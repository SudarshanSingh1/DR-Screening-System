# MATLAB / Simulink — Research and Training

This directory contains MATLAB scripts, Simulink models, and research utilities for the Vision AI Diabetic Retinopathy screening system.

> **Note:** The production web application uses a Python-based inference pipeline (FastAPI + TensorFlow/Keras). MATLAB code here serves research, training, simulation, and reference purposes.

---

## Directory Structure

```text
matlab/
├── algorithms/              # Image processing and analysis algorithms
│   ├── enhancement/         # Image enhancement utilities
│   ├── preprocessing/       # Fundus image preprocessing (preprocessFundus.m)
│   ├── quality/             # Image quality assessment
│   └── segmentation/        # Retinal structure segmentation
├── core/                    # Core MATLAB utilities and shared functions
├── explainability/          # Grad-CAM and visual explanation generation
├── inference/               # MATLAB inference scripts (loadDRModel, predictDR)
├── reporting/               # Screening report generation (runScreening.m)
├── simulink/                # Simulink models and simulation framework
│   ├── blocks/              # Custom Simulink block implementations
│   ├── DRScreeningSystem.slx
│   └── DRDistrictSystem.slx
├── tests/                   # Test scripts (testRealPipeline.m)
├── training/                # ★ Training scripts and contributor workspace
├── preprocessing/           # Dataset preparation and normalization
├── datasets/                # Dataset documentation and manifests
├── evaluation/              # Metrics, validation, and evaluation scripts
├── models/                  # MATLAB-specific trained artifacts
├── conversion/              # Model export and format conversion utilities
├── results/                 # Experiment summaries and reproducible outputs
└── README.md                # This file
```

## Training Contributions

If you are contributing MATLAB training code, start here:

1. Read [`training/README.md`](training/README.md) for the full contributor guide.
2. Place training scripts in `training/scripts/`.
3. Place reusable functions in `training/functions/`.
4. Review the starter template: [`training/scripts/train_dr_model.m`](training/scripts/train_dr_model.m).

## Simulink Simulation

The `simulink/` directory contains resource planning and triage simulation models for rural healthcare deployment. These are completely isolated from the production web stack.

## Reference Algorithms

The `algorithms/`, `inference/`, and `explainability/` directories contain MATLAB reference implementations that parallel the production Python pipeline.
