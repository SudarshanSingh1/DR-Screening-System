# Grad-CAM Explainability

This document describes the Grad-CAM implementation for the DR screening real inference pipeline.

> **Label**: Technically verified Grad-CAM implementation.
> Visual explanations are for inspection purposes only and have not been clinically validated.

---

## File

`matlab/explainability/generateGradCAM.m`

---

## Verified Target Layer

| Property | Value |
|---|---|
| **Layer name** | `efficientnet-b0|model|head|MulLayer` |
| **Layer type** | `nnet.cnn.layer.MultiplicationLayer` (Swish activation) |
| **Position** | Final spatial activation before `efficientnet-b0|model|head|global_average_pooling2d|GlobAvgPool` |
| **Verification method** | Programmatically traced by walking network graph backward from last `GlobalAveragePooling2DLayer` |

This layer was selected because it is the final spatial feature map in the network before spatial information is collapsed by global average pooling. Grad-CAM requires a spatial layer to produce a meaningful heatmap.

---

## Method

**Standard Grad-CAM algorithm** (Selvaraju et al., 2017):

```
1. Forward pass: compute predicted class score and feature map activations
   at the target layer, within a single dlfeval() call.

2. Gradient computation: compute ∂score_c / ∂A^k
   where score_c is the softmax output for class c,
   and A^k is the k-th feature channel of the target layer.

3. Channel weights: α^k = (1/Z) Σ_{i,j} (∂score_c / ∂A^k_{ij})
   (global average pooling over gradient spatial dimensions)

4. Weighted activation map: L = ReLU(Σ_k α^k · A^k)
   (ReLU enforces positive attribution only)

5. Normalization: rescale L to [0, 1]
   (if max == min, i.e., zero activation, return zero heatmap)

6. Resize to 224×224 via bilinear interpolation
   to align with the original preprocessed image dimensions.
```

---

## Image-Dependency Contract

The Grad-CAM **always uses the same `dlImg` instance** that was used for prediction in `runScreening.m`. There is no image reload, no alternative preprocessing path, and no possibility of Grad-CAM being computed for a different image than the one that produced the prediction.

```matlab
dlImg = preprocessFundus(imagePath);                      % single preprocessing call
[probs, predClass, ...] = predictDR(net, dlImg, config);  % same dlImg
heatmap = generateGradCAM(net, dlImg, predClass + 1);     % same dlImg
```

---

## API

```matlab
heatmap = generateGradCAM(net, dlImg, classIdx)
```

| Parameter | Type | Description |
|---|---|---|
| `net` | `dlnetwork` | Loaded DR model |
| `dlImg` | `dlarray` ('SSC') | Preprocessed image [224×224×3, float32] |
| `classIdx` | int | **1-indexed** target class (e.g., `predClass + 1`) |
| `heatmap` | 224×224 double | Normalized Grad-CAM heatmap [0, 1], no NaN/Inf |

> The default behaviour computes Grad-CAM for the **actual predicted class**. Passing a different `classIdx` is supported by the API but should be clearly labeled as a user-selected target class, not the automatic prediction.

---

## Safety Properties Verified

| Check | Status |
|---|---|
| NaN/Inf in output | Protected — zero heatmap returned if flat activation |
| Zero heatmap (uniform input) | Handled explicitly |
| Resize correctness | `imresize(..., [224,224], 'bilinear')` |
| ReLU applied | `max(gradcamMap, 0)` — only positive attribution |
| Multi-image independence | Verified — distinct inputs produce distinct heatmaps |

---

## Known Limitations

1. **EfficientNet Swish activation as Grad-CAM target**: The Swish (`MulLayer`) activation is a product layer combining a sigmoid gate and the linear input. Grad-CAM gradients through this layer are mathematically valid but may produce coarser localization compared to traditional ReLU-based networks.
2. **Not clinically validated**: Heatmap regions have not been validated against ophthalmologist annotations or lesion ground truth.
