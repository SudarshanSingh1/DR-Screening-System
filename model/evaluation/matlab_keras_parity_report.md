# MATLAB-to-Keras Model Parity Report

**Status:** **NOT RUN (MATLAB Runtime Not Available in Execution Environment)**  
**Verification Date:** October 2026  
**Evaluator:** Vision AI Engineering Audit  

---

## 1. Artifact Overview

| Artifact | Framework / Format | File Path | Layer Count | Status |
|---|---|---|:---:|---|
| **Production Model** | Python / TensorFlow Keras (`.keras`) | `model/production/V2/DR_EfficientNetB0_V2.keras` | 240 | Deployed in FastAPI service |
| **Reference Model** | MATLAB Deep Learning Toolbox (`.mat`) | `model/reference/DR_EfficientNetB0_V2.mat` | 289 | Maintained for MATLAB research |
| **Weight Arrays** | NumPy Archive (`.npz`) | `model/production/V2/v2_weights.npz` | — | Extracted weight weights |
| **Config Specification** | JSON | `model/config/model_config.json` | — | Class names, thresholds, and metadata |

---

## 2. Execution Constraint Notice

> [!WARNING]
> **Execution Status: NOT RUN**  
> Direct numerical inference comparison between `DR_EfficientNetB0_V2.mat` and `DR_EfficientNetB0_V2.keras` could not be executed in the current environment because the **MATLAB runtime (`matlab` binary / `matlabengine`) is not installed** in this container/host environment (`which matlab: not found`).  
> In adherence to strict scientific documentation standards, **no synthetic agreement percentage or fabricated concordance metric is reported.**

---

## 3. Structural & Preprocessing Differences

While end-to-end numerical parity was not run in this session, the structural mappings and tensor requirements are documented below:

| Property | Python Keras Pipeline | MATLAB `dlnetwork` Pipeline |
|---|---|---|
| **Input Shape** | `(1, 224, 224, 3)` (NHWC) | `[224, 224, 3, 1]` formatted as `dlarray` (`SSCB` layout) |
| **Input Data Type** | `float32` in range `[0.0, 255.0]` | `single` in range `[0.0, 255.0]` |
| **Embedded Normalization** | Native Keras `rescaling` (÷255) + `normalization` (ImageNet z-score) | Native MATLAB `zscoreLayer` embedded inside DAG network |
| **Feature Extraction Layer** | `top_activation` (Swish activation, $7 \times 7 \times 1280$) | `efficientnet-b0|model|head|MulLayer` ($7 \times 7 \times 1280$) |
| **Logits Layer** | `dr_classifier` (Dense, 5 unnormalized logits) | Pre-softmax activation layer |
| **Softmax Output** | `softmax` (5-class probabilities) | `DR_Softmax` (5-class probabilities) |
| **Interpolation** | PIL Bilinear interpolation | MATLAB `imresize(..., 'bilinear')` |

---

## 4. Required Protocol for Future Parity Verification

When a licensed MATLAB R2023b+ environment is available, execute the following protocol:

```matlab
% In MATLAB Command Window:
cd('matlab/tests');
testRealPipeline;  % Evaluates sample images against model/reference/DR_EfficientNetB0_V2.mat
```

And in Python:
```bash
python3 -c "
import tensorflow as tf
from pathlib import Path
m = tf.keras.models.load_model('model/production/V2/DR_EfficientNetB0_V2.keras')
# Evaluate concordance against MATLAB output logits
"
```

### Acceptance Criteria for Parity Sign-off:
1. **Predicted Class Agreement:** $\ge 98.0\%$ concordance across a minimum of 100 test fundus images.
2. **Probability Concordance:** Maximum absolute difference in predicted class probability $\max |p_{\text{keras}} - p_{\text{matlab}}| < 1 \times 10^{-3}$.
3. **Grad-CAM Centroid Alignment:** Spatial centroid distance of the primary activation cluster $< 5.0$ pixels.
