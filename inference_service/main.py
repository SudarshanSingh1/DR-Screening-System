"""
inference_service/main.py  — Python V2 Production Inference
============================================================
Architecture:
  Frontend → Backend → Python Inference Service → PythonV2Provider → .keras model

InferenceProvider abstraction:
  ACTIVE_PROVIDER = python_v2   (production)
  ACTIVE_PROVIDER = matlab_v2   (future, optional)

API:
  GET  /health
  POST /analyze   multipart: leftEye (file), rightEye (file)

Response (per eye):
  {
    "success": true,
    "prediction": {"classIndex": int, "label": str, "confidence": float},
    "probabilities": [float × 5],
    "isLowConfidence": bool,
    "isReferable": bool,
    "gradCam": "data:image/png;base64,..."
  }
"""
import os
import io
import json
import base64
import traceback
import logging
from abc import ABC, abstractmethod
from pathlib import Path

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
log = logging.getLogger("inference")

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "model" / "config" / "model_config.json"
KERAS_PATH  = BASE_DIR / "model" / "production" / "V2" / "DR_EfficientNetB0_V2.keras"

# ── Config ─────────────────────────────────────────────────────────────────────
ACTIVE_PROVIDER = os.environ.get("ACTIVE_PROVIDER", "python_v2")

app = FastAPI(title="Vision AI Inference Service — Python V2")

# ── Global state ───────────────────────────────────────────────────────────────
_model_config: dict = {}
_provider = None
_startup_error: dict = {"code": "NOT_STARTED", "message": "Service not yet initialised"}


# ══════════════════════════════════════════════════════════════════════════════
# InferenceProvider abstraction
# ══════════════════════════════════════════════════════════════════════════════
class InferenceProvider(ABC):
    @abstractmethod
    def is_ready(self) -> bool: ...

    @abstractmethod
    def predict_eye(self, image_rgb_uint8: np.ndarray, override_class: int = None) -> dict:
        """
        Args:
            image_rgb_uint8: (H, W, 3) uint8 ndarray (already 224×224)
        Returns:
            {
              "classIndex": int,
              "label": str,
              "confidence": float,
              "probabilities": list[float],
              "isReferable": bool,
              "isLowConfidence": bool,
              "gradCam": str  (data:image/png;base64,...)
            }
        """
        ...


# ══════════════════════════════════════════════════════════════════════════════
# PythonV2Provider — TensorFlow / Keras EfficientNetB0
# ══════════════════════════════════════════════════════════════════════════════
class PythonV2Provider(InferenceProvider):
    """
    Production Python inference using the weight-transplanted Keras model.

    Preprocessing:
      1. Resize to 224×224 with bilinear interpolation (PIL)
      2. Convert to float32 [0, 255]
      3. Add batch dimension → shape (1, 224, 224, 3)
      4. Feed to model (model internally applies zscore normalization)

    Grad-CAM target:
      'top_activation' — the Swish activation at the head
      Equivalent to MATLAB: efficientnet-b0|model|head|MulLayer
    """

    GRADCAM_LAYER = "top_activation"

    def __init__(self, keras_path: Path, config: dict):
        import tensorflow as tf
        self._tf = tf
        self._model = None
        self._grad_model = None
        self._config = config
        self._error = None

        if not keras_path.exists():
            self._error = f"Model file not found: {keras_path}"
            log.error(self._error)
            return

        try:
            log.info(f"Loading Keras model from {keras_path} ...")
            self._model = tf.keras.models.load_model(str(keras_path))
            log.info(f"Model loaded: {self._model.name}  layers={len(self._model.layers)}")

            # Build GradCAM subgraph (feature layer + logits output)
            # We use logits ('dr_classifier') to prevent vanishing gradients caused by softmax saturation
            self._grad_model = tf.keras.Model(
                inputs=self._model.input,
                outputs=[
                    self._model.get_layer(self.GRADCAM_LAYER).output,
                    self._model.get_layer("dr_classifier").output,
                ],
            )
            log.info(f"Grad-CAM model built — target layer: {self.GRADCAM_LAYER}, logits layer: dr_classifier")

        except Exception as e:
            self._error = str(e)
            log.error(f"Failed to load model: {e}")
            traceback.print_exc()

    def is_ready(self) -> bool:
        return self._model is not None and self._error is None

    def _preprocess(self, image_rgb_uint8: np.ndarray) -> "tf.Tensor":
        """
        Resize to 224×224, convert to float32 [0,255], add batch dim.
        The model's internal 'rescaling' (÷255) + 'normalization' (zscore) layers
        handle further processing.
        """
        img = Image.fromarray(image_rgb_uint8, mode="RGB")
        img = img.resize((224, 224), Image.BILINEAR)
        arr = np.array(img, dtype=np.float32)     # [0, 255] float32
        return self._tf.constant(arr[np.newaxis])  # (1, 224, 224, 3)

    def _compute_gradcam(self, img_tensor, original_img_arr: np.ndarray, target_class_idx: int) -> str:
        """
        Returns a base64-encoded PNG Grad-CAM heatmap overlay (224×224).
        Implements Grad-CAM on 'top_activation' (1280 feature maps, 7×7).
        Equivalent to MATLAB's generateGradCAM.m using head|MulLayer.
        """
        tf = self._tf
        with tf.GradientTape() as tape:
            tape.watch(img_tensor)
            conv_outputs, logits = self._grad_model(img_tensor, training=False)
            class_score = logits[:, target_class_idx]

        # Gradients of the class score w.r.t. the feature map
        grads = tape.gradient(class_score, conv_outputs)        # (1, 7, 7, 1280)
        
        log.info(f"[Grad-CAM] Image shape: {original_img_arr.shape} -> target_layer: {self.GRADCAM_LAYER}, feature_map_shape: {conv_outputs.shape}, target_class: {target_class_idx}")

        if grads is None:
            raise RuntimeError("Grad-CAM produced no gradients.")

        # Global average pool the gradients → weights (1, 1, 1280)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))    # (1280,)

        # Weighted combination of feature maps
        conv_out = conv_outputs[0]                              # (7, 7, 1280)
        heatmap = tf.reduce_sum(conv_out * pooled_grads, axis=-1)  # (7, 7)

        # ReLU
        heatmap = tf.nn.relu(heatmap).numpy()                   # (7, 7)

        if not np.isfinite(heatmap).all():
            raise RuntimeError("Grad-CAM produced NaN or Inf values.")

        # Normalize to [0, 1]
        h_max = heatmap.max()
        h_min = heatmap.min()
        if h_max == h_min:
            raise RuntimeError("Grad-CAM produced constant activation (max == min), no valid heatmap could be produced.")
        
        heatmap = (heatmap - h_min) / (h_max - h_min)

        # Resize heatmap to match original image (224x224)
        heatmap_img = Image.fromarray(np.uint8(heatmap * 255), mode="L")
        heatmap_img = heatmap_img.resize((224, 224), Image.BILINEAR)
        heatmap_arr = np.array(heatmap_img) / 255.0

        # Apply Jet colormap
        import matplotlib
        jet = matplotlib.colormaps['jet']
        # jet returns (224, 224, 4) in [0, 1]
        jet_heatmap = jet(heatmap_arr)[:, :, :3] 

        # Create improved overlay (Heatmap-driven opacity)
        # Ensure original image is 224x224
        orig_pil = Image.fromarray(original_img_arr, mode="RGB").resize((224, 224), Image.BILINEAR)
        orig_arr = np.array(orig_pil) / 255.0
        
        # Max opacity 60% in highest activation regions, fully transparent in 0 activation regions
        alpha = heatmap_arr[..., np.newaxis] * 0.6
        overlay = (jet_heatmap * alpha) + (orig_arr * (1 - alpha))
        overlay_uint8 = np.uint8(overlay * 255)

        # Encode as PNG → base64
        buf = io.BytesIO()
        Image.fromarray(overlay_uint8, mode="RGB").save(buf, format="PNG")
        return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    def predict_eye(self, image_rgb_uint8: np.ndarray, override_class: int = None) -> dict:
        if not self.is_ready():
            raise RuntimeError(f"Provider not ready: {self._error}")

        img_tensor = self._preprocess(image_rgb_uint8)

        # Inference
        probs_tensor = self._model(img_tensor, training=False)
        probs = probs_tensor.numpy()[0].tolist()                # List[float], len=5

        max_prob   = float(max(probs))
        class_idx  = int(probs.index(max_prob))

        class_names = self._config.get("class_names", {})
        label = class_names.get(str(class_idx), f"Level{class_idx}")

        referable_threshold = (
            self._config
            .get("referable_dr", {})
            .get("optimized_threshold", 0.20798)
        )
        confidence_threshold = (
            self._config
            .get("uncertainty_handling", {})
            .get("provisional_confidence_threshold", 0.5)
        )

        # Referable: sum of probabilities for classes 2, 3, 4
        ref_prob   = sum(probs[2:5])
        is_referable      = bool(ref_prob >= referable_threshold)
        is_low_confidence = bool(max_prob < confidence_threshold)

        # Grad-CAM (Use override_class if provided for demo mode)
        target_cam_idx = override_class if override_class is not None else class_idx
        gradcam_b64 = self._compute_gradcam(img_tensor, image_rgb_uint8, target_cam_idx)

        return {
            "classIndex":      class_idx,
            "label":           label,
            "confidence":      max_prob,
            "probabilities":   probs,
            "isReferable":     is_referable,
            "isLowConfidence": is_low_confidence,
            "gradCam":         gradcam_b64,
        }





# ══════════════════════════════════════════════════════════════════════════════
# Startup
# ══════════════════════════════════════════════════════════════════════════════
@app.on_event("startup")
def startup_event():
    global _model_config, _provider, _startup_error

    # Load model config
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            _model_config = json.load(f)
        log.info(f"Model config loaded: {_model_config.get('model_name')}")
    else:
        _startup_error = {
            "code": "CONFIG_MISSING",
            "message": f"Config file not found: {CONFIG_PATH}",
        }
        log.warning(_startup_error["message"])

    # Select provider
    provider_name = ACTIVE_PROVIDER.strip().lower()
    log.info(f"ACTIVE_PROVIDER={provider_name}")

    if provider_name == "python_v2":
        _provider = PythonV2Provider(KERAS_PATH, _model_config)
        if _provider.is_ready():
            _startup_error = {"code": "OK", "message": "Python V2 provider ready"}
            log.info("PythonV2Provider ready")
        else:
            _startup_error = {
                "code": "PYTHON_MODEL_LOAD_FAILED",
                "message": _provider._error or "Unknown load error",
            }
    else:
        _startup_error = {
            "code": "UNKNOWN_PROVIDER",
            "message": f"Unknown ACTIVE_PROVIDER: {provider_name}",
        }


# ══════════════════════════════════════════════════════════════════════════════
# Endpoints
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/health")
def health():
    if _provider is None or not _provider.is_ready():
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "provider": ACTIVE_PROVIDER,
                "error_code": _startup_error.get("code"),
                "detail": _startup_error.get("message"),
            },
        )
    return {
        "status": "healthy",
        "provider": ACTIVE_PROVIDER,
        "model": _model_config.get("model_name", "DR_EfficientNetB0_V2"),
    }


def _load_image(upload: UploadFile) -> np.ndarray:
    """Validate and decode an uploaded image to uint8 RGB ndarray."""
    ALLOWED_MIME = {"image/jpeg", "image/png", "image/bmp", "image/tiff"}
    if upload.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {upload.content_type}. Accepted: JPEG, PNG",
        )
    raw = upload.file.read()
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted image: {e}")
    return np.array(img, dtype=np.uint8)


def _run_eye(label: str, upload: UploadFile, override_class: int = None) -> dict:
    """Helper that runs full inference on a single eye upload."""
    img_arr = _load_image(upload)
    try:
        from evidence_generator import generate_quality_evidence, generate_vessel_evidence, generate_disc_fovea_evidence, generate_lesion_evidence
        
        result = _provider.predict_eye(img_arr, override_class)
        
        # Also generate the additional evidence formats from the original image array
        quality_evidence = generate_quality_evidence(img_arr)
        vessel_evidence = generate_vessel_evidence(img_arr)
        disc_fovea_evidence = generate_disc_fovea_evidence(img_arr)
        lesion_evidence = generate_lesion_evidence(img_arr)
        
        return {
            "success": True,
            "prediction": {
                "classIndex": result["classIndex"],
                "label":      result["label"],
                "confidence": result["confidence"],
            },
            "probabilities":   result["probabilities"],
            "isReferable":     result["isReferable"],
            "isLowConfidence": result["isLowConfidence"],
            "gradCam":         result["gradCam"],
            "qualityEvidence": quality_evidence,
            "vesselEvidence":  vessel_evidence,
            "discFoveaEvidence": disc_fovea_evidence,
            "lesionEvidence":  lesion_evidence,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"{label} inference failed: {e}",
        )


@app.post("/analyze")
async def analyze_bilateral(
    leftEye:  UploadFile = File(...),
    rightEye: UploadFile = File(...),
):
    """
    Bilateral screening endpoint.
    Accepts leftEye and rightEye as multipart form files.
    Returns independent predictions for each eye.
    """
    if _provider is None or not _provider.is_ready():
        raise HTTPException(
            status_code=503,
            detail=f"{_startup_error.get('code')}: {_startup_error.get('message')}",
        )

    left_result  = _run_eye("Left eye",  leftEye)
    right_result = _run_eye("Right eye", rightEye)

    return {
        "leftEye":  left_result,
        "rightEye": right_result,
    }


# Keep legacy single-image endpoint for backward compatibility
@app.post("/analyze/single")
async def analyze_single(file: UploadFile = File(...), override_class: int = Form(None)):
    """
    Legacy single-image endpoint (backward compatibility).
    Returns the same response structure as a single eye.
    """
    if _provider is None or not _provider.is_ready():
        raise HTTPException(
            status_code=503,
            detail=f"{_startup_error.get('code')}: {_startup_error.get('message')}",
        )

    result = _run_eye("Image", file, override_class)
    # Flatten to match legacy response shape
    return {
        "success": True,
        "prediction": result["prediction"],
        "probabilities":   result["probabilities"],
        "isReferable":     result["isReferable"],
        "isLowConfidence": result["isLowConfidence"],
        "gradCam":         result["gradCam"],
        "qualityEvidence": result.get("qualityEvidence"),
        "vesselEvidence":  result.get("vesselEvidence"),
        "discFoveaEvidence": result.get("discFoveaEvidence"),
        "lesionEvidence":  result.get("lesionEvidence")
    }
