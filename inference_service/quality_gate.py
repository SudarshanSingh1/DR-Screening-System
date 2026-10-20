"""
inference_service/quality_gate.py — Fundus Image Quality Gate
==============================================================
Provides automated, deterministic image quality checks for retinal
fundus photographs prior to deep learning classification.

Evaluates:
  1. Dimension & aspect ratio (detects corrupted/unsuitable thumbnails)
  2. Illumination / Brightness (evaluates retinal field foreground for underexposure or glare)
  3. Sharpness / Blur (scale-invariant Laplacian variance at 512x512 analysis resolution)

Returns:
  PASS -> proceeds to inference
  FAIL -> returns specific clinical rejection reason & requests recapture
"""

import numpy as np
from PIL import Image
from typing import Dict, Any, Optional


# Default configurable thresholds
DEFAULT_QUALITY_CONFIG = {
    "min_dimension": 150,           # Minimum width and height in pixels
    "max_aspect_ratio": 2.5,        # Maximum allowable aspect ratio (w/h or h/w)
    "min_brightness": 30.0,         # Minimum mean foreground illumination [0, 255]
    "max_brightness": 235.0,        # Maximum mean foreground illumination [0, 255]
    "min_sharpness": 12.0,          # Minimum scale-normalized Laplacian variance
    "min_field_fraction": 0.15,     # Minimum fraction of non-black field (>15 intensity)
}


def _compute_laplacian_variance(gray: np.ndarray) -> float:
    """
    Computes image sharpness via the variance of the discrete 3x3 Laplacian.
    Uses standard discrete convolution without requiring external CV libraries.
    """
    kernel = np.array([
        [0,  1, 0],
        [1, -4, 1],
        [0,  1, 0]
    ], dtype=np.float32)

    padded = np.pad(gray.astype(np.float32), 1, mode="edge")
    lap = (
        kernel[0, 1] * padded[:-2, 1:-1] +
        kernel[1, 0] * padded[1:-1, :-2] +
        kernel[1, 1] * padded[1:-1, 1:-1] +
        kernel[1, 2] * padded[1:-1, 2:] +
        kernel[2, 1] * padded[2:, 1:-1]
    )
    return float(np.var(lap))


def evaluate_image_quality(
    image_rgb_uint8: np.ndarray,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Inspects an image array and returns an honest, structured quality decision.

    Args:
        image_rgb_uint8: (H, W, 3) or (H, W) ndarray of uint8 pixels.
        config: Optional dictionary overriding default thresholds.

    Returns:
        {
            "passed": bool,
            "status": "PASS" | "FAIL",
            "reason": Optional[str],
            "action": "PROCEED" | "RECAPTURE_REQUIRED",
            "metrics": {
                "width": int,
                "height": int,
                "aspectRatio": float,
                "meanBrightness": float,
                "sharpness": float,
                "fieldFraction": float
            },
            "thresholds": dict
        }
    """
    cfg = dict(DEFAULT_QUALITY_CONFIG)
    if config:
        cfg.update(config)

    if image_rgb_uint8 is None or not isinstance(image_rgb_uint8, np.ndarray):
        return {
            "passed": False,
            "status": "FAIL",
            "reason": "Invalid image payload: data is null or not a numpy array.",
            "action": "RECAPTURE_REQUIRED",
            "metrics": {},
            "thresholds": cfg,
        }

    shape = image_rgb_uint8.shape
    if len(shape) < 2:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Invalid image array shape: {shape}.",
            "action": "RECAPTURE_REQUIRED",
            "metrics": {},
            "thresholds": cfg,
        }

    orig_h, orig_w = shape[0], shape[1]

    # 1. Dimension check
    if orig_h < cfg["min_dimension"] or orig_w < cfg["min_dimension"]:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Image dimensions ({orig_w}x{orig_h}) below minimum diagnostic requirement ({cfg['min_dimension']}x{cfg['min_dimension']} px).",
            "action": "RECAPTURE_REQUIRED",
            "metrics": {"width": orig_w, "height": orig_h},
            "thresholds": cfg,
        }

    # 2. Aspect ratio check
    aspect_ratio = max(orig_w / orig_h, orig_h / orig_w)
    if aspect_ratio > cfg["max_aspect_ratio"]:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Unsuitable aspect ratio ({aspect_ratio:.2f} > {cfg['max_aspect_ratio']}). Fundus photographs must be roughly circular/square.",
            "action": "RECAPTURE_REQUIRED",
            "metrics": {"width": orig_w, "height": orig_h, "aspectRatio": round(aspect_ratio, 2)},
            "thresholds": cfg,
        }

    # Normalize analysis scale to standard 512x512 for resolution-independent focus/lighting
    pil_img = Image.fromarray(image_rgb_uint8)
    if (orig_w, orig_h) != (512, 512):
        pil_512 = pil_img.resize((512, 512), Image.BILINEAR)
    else:
        pil_512 = pil_img

    arr_512 = np.array(pil_512)
    if len(arr_512.shape) == 3 and arr_512.shape[2] >= 3:
        gray_512 = (
            0.299 * arr_512[:, :, 0] +
            0.587 * arr_512[:, :, 1] +
            0.114 * arr_512[:, :, 2]
        ).astype(np.float32)
    else:
        gray_512 = arr_512.astype(np.float32)

    # Identify retinal foreground (non-black background)
    fg_mask = gray_512 > 15.0
    field_fraction = float(np.mean(fg_mask))

    if field_fraction < cfg["min_field_fraction"]:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Empty or obstructed retinal field: detected foreground covers only {field_fraction*100:.1f}% of image (< {cfg['min_field_fraction']*100:.0f}%).",
            "action": "RECAPTURE_REQUIRED",
            "metrics": {
                "width": orig_w,
                "height": orig_h,
                "aspectRatio": round(float(aspect_ratio), 2),
                "fieldFraction": round(field_fraction, 3)
            },
            "thresholds": cfg,
        }

    # Evaluate foreground brightness
    fg_brightness = float(np.mean(gray_512[fg_mask]))
    sharpness = _compute_laplacian_variance(gray_512)

    metrics = {
        "width": int(orig_w),
        "height": int(orig_h),
        "aspectRatio": round(float(aspect_ratio), 2),
        "meanBrightness": round(float(fg_brightness), 2),
        "sharpness": round(float(sharpness), 2),
        "fieldFraction": round(float(field_fraction), 3)
    }

    # 3. Severe underexposure / darkness check
    if fg_brightness < cfg["min_brightness"]:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Severe underexposure: retinal field illumination ({fg_brightness:.1f}) is below threshold ({cfg['min_brightness']}). Check camera flash/illumination.",
            "action": "RECAPTURE_REQUIRED",
            "metrics": metrics,
            "thresholds": cfg,
        }

    # 4. Severe overexposure / washout check
    if fg_brightness > cfg["max_brightness"]:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Severe overexposure: retinal field illumination ({fg_brightness:.1f}) exceeds threshold ({cfg['max_brightness']}). Avoid direct corneal glare.",
            "action": "RECAPTURE_REQUIRED",
            "metrics": metrics,
            "thresholds": cfg,
        }

    # 5. Blur / defocus check
    if sharpness < cfg["min_sharpness"]:
        return {
            "passed": False,
            "status": "FAIL",
            "reason": f"Defocus/motion blur detected: sharpness metric ({sharpness:.1f}) is below acceptable quality boundary ({cfg['min_sharpness']}). Retinal vessels cannot be resolved reliably.",
            "action": "RECAPTURE_REQUIRED",
            "metrics": metrics,
            "thresholds": cfg,
        }

    # PASS
    return {
        "passed": True,
        "status": "PASS",
        "reason": None,
        "action": "PROCEED",
        "metrics": metrics,
        "thresholds": cfg,
    }
