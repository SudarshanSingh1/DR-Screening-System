# Real Inference Pipeline

This document describes the technically verified real DR screening inference pipeline.    

> **Label**: Technically verified real inference pipeline.
> Clinical performance has not been validated against labeled patient data.

---

## Files

| File | Role |
|---|---|
| `matlab/preprocessing/preprocessFundus.m` | Image loading and preprocessing |
| `matlab/inference/loadDRModel.m` | Model and config loading |
| `matlab/inference/predictDR.m` | Network prediction and threshold application |
| `matlab/reporting/runScreening.m` | End-to-end orchestration |

---

## preprocessFundus(imagePath)

**Inputs**: `imagePath` — absolute or relative path to an image file.

**Behaviour**:
- Fails with `preprocessFundus:FileNotFound` if file does not exist.
- Reads image with `imread()`.
- Grayscale (1-channel) → replicated to 3 channels.
- RGBA or higher (>3 channels) → first 3 channels retained.
- Resized to 224×224 via bilinear interpolation.
- Converted to `single` (float32) preserving [0, 255] range.
- Returned as `dlarray(img, 'SSC')`.

**Output**: `processedImage` — `dlarray` of size [224, 224, 3], dtype `single`.

---

## loadDRModel()

**Behaviour**:
- Resolves model path relative to the repository root using `mfilename('fullpath')`. No hardcoded machine paths.
- Loads `model/model_file/DR_EfficientNetB0_V2.mat`.
- Loads `model/config/model_config.json`.
- Uses `persistent` caching — model is loaded from disk only once per MATLAB session.

**Outputs**:
- `net` — initialized `dlnetwork` (289 layers)
- `classNames` — `{5×1 cell}`: `{'No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR'}`
- `config` — struct decoded from `model_config.json`

---

## predictDR(net, dlImg, config)

**Inputs**: loaded `dlnetwork`, preprocessed `dlarray`, config struct.

**Behaviour**:
- Calls `predict(net, dlImg)` — standard dlnetwork inference.
- Extracts 1×5 probability vector.
- `predClass` = `argmax(probs) - 1` (0-indexed, matching `model_config.json`).
- `isReferable` = `sum(probs(3:5)) >= config.referable_dr.optimized_threshold` (0.20798).
- `isLowConfidence` = `max(probs) < config.uncertainty_handling.provisional_confidence_threshold` (0.5).

**Outputs**: `probs`, `predClass`, `isReferable`, `isLowConfidence`, `maxProb`.

---

## runScreening(imagePath)

**Behaviour**:
1. Calls `loadDRModel()`.
2. Calls `preprocessFundus(imagePath)` → `dlImg`.
3. Calls `predictDR(net, dlImg, config)`.
4. Calls `generateGradCAM(net, dlImg, predClass+1)` using the **same `dlImg`**.
5. Maps to clinical state (see table in `MODEL.md`).
6. Returns consolidated result struct.

**Output struct fields**:

| Field | Type | Description |
|---|---|---|
| `imagePath` | string | Original input path |
| `prediction.classIndex` | int | 0-indexed predicted class |
| `prediction.className` | string | Human-readable class name |
| `prediction.probabilities` | 1×5 double | Raw softmax probabilities |
| `referable` | logical | Whether referable DR detected |
| `lowConfidence` | logical | Whether low-confidence flag set |
| `clinicalState` | int | -1 / 0 / 1 / 2 |
| `heatmap` | 224×224 double | Normalized Grad-CAM heatmap [0, 1] |

---

## Known Limitations

1. **State -1 (Ungradeable) not implemented.** An image quality assessment module would be required to detect and route ungradeable images before inference.
2. **Low-confidence threshold is provisional.** The `provisional_confidence_threshold = 0.5` is noted as provisional in `model_config.json` and has not been clinically validated.
3. **No clinical validation performed.** This pipeline has been technically verified for correct execution only.
