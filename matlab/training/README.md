# MATLAB Training — Contributor Guide

This directory contains MATLAB scripts, functions, and configurations for training Diabetic Retinopathy classification models.

> **Important:** This training code is separate from the production Python inference pipeline. Models trained here must pass compatibility, evaluation, and integration checks before being deployed.

---

## Directory Layout

```text
training/
├── scripts/          # Training entry-point scripts and experiment runners
│   └── train_dr_model.m   # Starter template (implement before use)
├── functions/        # Reusable training functions, custom losses, metrics, callbacks
├── configs/          # Experiment configuration files (.json, .mat)
└── README.md         # This file
```

---

## Quick Start for Contributors

### 1. Where to Put Your Code

| What | Where |
|---|---|
| Main training scripts | `scripts/` |
| Reusable helper functions | `functions/` |
| Experiment configs (hyperparams, architecture) | `configs/` |
| Preprocessing utilities | `../preprocessing/` |
| Evaluation scripts and metrics | `../evaluation/` |
| Trained model artifacts (small only) | `../models/` |
| Experiment results and plots | `../results/` |

### 2. Document Your Environment

At the top of every training script, document:

```matlab
% Requirements:
%   - MATLAB R2023b (or specify your release)
%   - Deep Learning Toolbox
%   - Image Processing Toolbox
%   - [List any additional toolboxes]
```

### 3. Record Experiment Metadata

For reproducibility, every experiment should record:

- **Model architecture** (backbone, head modifications, layer count)
- **Dataset version** (source, size, class distribution, train/val/test splits)
- **Random seed** (use `rng(seed, 'twister')` for reproducibility)
- **Hyperparameters** (learning rate, batch size, epochs, optimizer, scheduler)
- **Evaluation metrics** (accuracy, per-class precision/recall, F1, confusion matrix)
- **Training environment** (MATLAB release, GPU type, training duration)

Save this metadata alongside your model artifact in `../results/`.

### 4. Run the Training Pipeline

```matlab
% From the MATLAB Command Window:
cd('path/to/DR-Screening-System/matlab/training/scripts')
train_dr_model   % Or your custom training script
```

Ensure all required toolboxes are installed before running. Use `ver` to check.

### 5. Save Experiment Outputs

- Save trained models to `../models/` (small artifacts only).
- Save training logs, plots, and metrics to `../results/`.
- **Do NOT commit:** large checkpoints, raw datasets, or temporary files.
- Use Git LFS for model weights exceeding 50 MB.
- Add generated files to `../.gitignore` if appropriate.

### 6. Export for Production

The production inference pipeline uses **Python + TensorFlow/Keras**. To propose a new model:

1. Export the trained MATLAB model to a compatible format (`.keras`, `.h5`, or weights `.npz`).
2. Use `../conversion/` for export scripts and validation utilities.
3. Document the conversion process and any layer mapping differences.
4. Validate the converted model against a known test set.
5. Compare predictions with the current production model (`model/production/V2/DR_EfficientNetB0_V2.keras`).
6. Place the validated artifact in `model/production/V3/` (or next version).
7. Update `model/config/model_config.json` with new model metadata.

> **Never** replace the current production model without team review and approval.

### 7. Git Workflow

```bash
# Create a feature branch
git checkout -b feature/matlab-training-<description>

# Stage your changes
git add matlab/training/ matlab/models/ matlab/results/

# Commit with a descriptive message
git commit -m "feat(matlab): add DR training script with EfficientNetB0 fine-tuning"

# Push and open a pull request
git push origin feature/matlab-training-<description>
```

Keep commits focused. Separate training code from evaluation code from results.

---

## Production Model Reference

| Property | Value |
|---|---|
| Architecture | EfficientNetB0 (5-class) |
| Input Size | 224 × 224 × 3 (RGB) |
| Pixel Range | [0.0, 255.0] float32 |
| Resize Method | Bilinear interpolation |
| Grad-CAM Layer | `top_activation` (7 × 7 × 1280) |
| Production Path | `model/production/V2/DR_EfficientNetB0_V2.keras` |
| MATLAB Reference | `model/reference/DR_EfficientNetB0_V2.mat` |

Any new model must be compatible with these specifications or the inference pipeline must be updated accordingly.

---

## Starter Template

See [`scripts/train_dr_model.m`](scripts/train_dr_model.m) for a documented starter template with placeholders for each pipeline stage. All `[TODO]` sections must be implemented before the script can execute.
