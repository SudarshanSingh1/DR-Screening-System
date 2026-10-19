# MATLAB Model Artifacts

Store small, redistributable MATLAB-specific trained artifacts here.

## Guidelines

- Only commit small model files (< 50 MB).
- Use Git LFS for larger weights.
- Document the training configuration, dataset version, and evaluation metrics for each artifact.
- The production model lives in `model/production/V2/` at the repository root.
- The MATLAB reference model is at `model/reference/DR_EfficientNetB0_V2.mat`.
