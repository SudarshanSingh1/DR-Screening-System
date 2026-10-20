# MATLAB-to-Keras Model Parity Report & Protocol — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Status:** NOT RUN (Environment Constraint — MATLAB Runtime Not Available)  
**Report Version:** 1.0.0  

---

## 1. Executive Summary

Vision AI maintains two synchronized model artifacts:
1. **MATLAB Reference Model:** `model/reference/DR_EfficientNetB0_V2.mat` (289 layers, MathWorks Deep Learning Toolbox format).
2. **Keras Production Model:** `model/production/V2/DR_EfficientNetB0_V2.keras` (240 layers, TensorFlow/Keras format).

This document specifies the numerical parity protocol to evaluate cross-framework floating-point divergence between MATLAB R2023b inference and TensorFlow 2.x Python inference.

---

## 2. Parity Status: NOT RUN

> [!WARNING]
> **Execution Constraint:** In the current Linux/Docker execution environment, the MATLAB runtime (`matlab` executable) is not installed. Parity execution is marked **NOT RUN** in accordance with honest engineering reporting.

---

## 3. Structural Comparison of Model Artifacts

| Parameter | MATLAB Reference (`.mat`) | Keras Production (`.keras`) | Parity Notes |
|---|---|---|---|
| **Architecture** | EfficientNetB0 DAG Network | EfficientNetB0 Functional Model | Topological equivalence |
| **Layer Count** | 289 layers | 240 layers | MATLAB splits activation/norm into separate nodes |
| **Input Shape** | $224 \times 224 \times 3$ (HWC) | $224 \times 224 \times 3$ (HWC) | Identical spatial dimensions |
| **Normalization** | Embedded in layer graph | Embedded Keras Rescaling + Normalization | ImageNet $\mu, \sigma$ |
| **Grad-CAM Layer** | `top_activation` | `top_activation` ($7 \times 7 \times 1280$) | Identical bottleneck layer |
| **Output Classes** | 5 (`dr_classifier` / `softmax`) | 5 (`dr_classifier` / Softmax) | ICDR Stages 0–4 |

---

## 4. Reproducible Parity Verification Protocol

When running in an environment equipped with MATLAB R2023b and Python 3.11:

### Step 1: Export MATLAB Benchmark Predictions
```matlab
% In MATLAB Command Window:
net = load('model/reference/DR_EfficientNetB0_V2.mat');
testImages = loadImagesFromManifest('model/production/V2/verification_report.json');
matlabProbs = predict(net.DR_EfficientNetB0_V2, testImages);
writematrix(matlabProbs, 'model/evaluation/matlab_predictions.csv');
```

### Step 2: Run Python TensorFlow Predictions
```bash
python3 -c "
import numpy as np, tensorflow as tf, json
model = tf.keras.models.load_model('model/production/V2/DR_EfficientNetB0_V2.keras')
# Generate predictions on identical tensors
"
```

### Step 3: Compute Numerical Discrepancy
- **Mean Absolute Error (MAE):** $\text{MAE} = \frac{1}{N \cdot C} \sum_{i=1}^N \sum_{c=0}^4 |p_{\text{Keras}}^{(i, c)} - p_{\text{MATLAB}}^{(i, c)}|$
- **Max Absolute Divergence:** $\text{MaxDiff} = \max_{i, c} |p_{\text{Keras}}^{(i, c)} - p_{\text{MATLAB}}^{(i, c)}|$
- **Classification Agreement:** Percentage of identical $\text{argmax}$ predictions across all test samples.
- **Acceptance Criterion:** $\text{MAE} < 10^{-4}$ and $100\%$ class agreement.
