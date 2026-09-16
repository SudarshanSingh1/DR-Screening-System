# Vision AI - Model Provenance

## Model
DR EfficientNetB0 V2

## Production format
Keras

## Reference
MATLAB DR_EfficientNetB0_V2.mat

## Classes
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative DR

## Input
224 × 224 × 3

## Grad-CAM
- target layer = top_activation
- feature map = 7 × 7 × 1280
- target score = predicted class pre-softmax logit
