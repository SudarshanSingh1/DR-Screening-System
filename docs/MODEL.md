# Model Documentation

## Canonical Model Artifact

| Property | Value |
|---|---|
| **File** | `model/model_file/DR_EfficientNetB0_V2.mat` |
| **MATLAB variable** | `net` — `dlnetwork` (289 Layers, 362 Connections) |
| **Architecture** | EfficientNetB0 base + custom `DR_Classifier` head |
| **Output layer** | `DR_Softmax` |
| **MATLAB variables also in file** | `classNames` (5×1 cell), `info` (deep.TrainingInfo), `inputSize` ([224 224 3]) |
| **Configuration** | `model/config/model_config.json` |

## Input Requirements

| Property | Value |
|---|---|
| **Spatial size** | 224 × 224 pixels |
| **Channels** | 3 (RGB) |
| **MATLAB dtype** | `single` (float32) |
| **Value range** | [0, 255] — the V2 native dlnetwork embeds its own z-score normalization layer |
| **dlarray format** | `dlarray(img, 'SSC')` |
| **Resize method** | Bilinear |

> Note: `model_config.json` documents `"dtype": "float32"` which correctly reflects the [0, 255] float32 range. This is the native expectation of the trained V2 network.

## Output Format

- **Shape**: 1 × 5 probability vector (per-class softmax scores)
- **Class mapping** (0-indexed):

| Index | Class Name | Clinical Significance |
|---|---|---|
| 0 | No DR | Non-referable |
| 1 | Mild | Non-referable |
| 2 | Moderate | **Referable** |
| 3 | Severe | **Referable** |
| 4 | Proliferative DR | **Referable** |

## Thresholds (from `model_config.json`)

| Threshold | Value | Source field | Applied to |
|---|---|---|---|
| Referable DR | **0.20798** | `referable_dr.optimized_threshold` | `sum(probs[2:4])` |
| Low Confidence | **0.5** | `uncertainty_handling.provisional_confidence_threshold` | `max(probs)` — provisional |

## Clinical State Routing

| State | Condition | Meaning |
|---|---|---|
| -1 | Image quality fail | UNGRADEABLE — recapture required *(not yet implemented)* |
| 0 | `sum(probs[2:4]) < 0.20798` AND `max(probs) >= 0.5` | NON-REFERABLE |
| 1 | `sum(probs[2:4]) >= 0.20798` AND `max(probs) >= 0.5` | REFERABLE |
| 2 | `max(probs) < 0.5` | LOW CONFIDENCE — specialist review |

> ⚠️ **Not clinically validated.** This pipeline has been technically verified for correct execution. Clinical performance against labeled patient data has not been assessed.
