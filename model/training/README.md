# Diabetic Retinopathy Model Training

## 1. Purpose
This directory is designated for the training, validation, and evaluation code of the VISION AI Diabetic Retinopathy classification model.

*Note: The original training code was executed out-of-band (in Kaggle) and the raw training scripts are not currently tracked in this repository. Only the resulting production weights and configuration are present.*

## 2. Dataset Requirements
The model was fine-tuned for a 5-class Diabetic Retinopathy classification task.
- **Input Size:** 224 x 224 x 3 (RGB)
- **Pixel Range:** [0.0, 255.0]

## 3. Expected Directory Structure
Training scripts (if added here) should avoid hardcoding absolute developer paths. Datasets should be loaded via configurable environment variables (e.g., `DATASET_ROOT=/path/to/dataset`).

## 4. Environment Setup
The training environment was originally **Kaggle**.
Dependencies for the model architecture include:
- TensorFlow / Keras
- EfficientNetB0 backbone

## 5. Training Configuration
Based on the production model configuration:
- **Architecture:** EfficientNetB0
- **Total Layers:** 238
- **Frozen Layers:** 208
- **Trainable Layers:** 30 (Fine-tuning phase)
- **Learning Rate:** 1e-05

## 6. Evaluation & Thresholds
The model predicts 5 classes. A "Referable DR" threshold optimization was performed during evaluation.
- **Optimized Threshold:** 0.20798
- **Default Threshold:** 0.5
- **Legacy Threshold:** 0.440134
- **Low Confidence Threshold:** 0.5 (max individual class probability)

## 7. Model Output
The training process produces a `.keras` model artifact.
- **Original file:** `best_correct_fine_tuned_dr_model.keras`
- **Production file:** `DR_EfficientNetB0_V2.keras` (Stored in `model/production/V2/`)

## 8. Class Mapping
- 0: No DR
- 1: Mild
- 2: Moderate
- 3: Severe
- 4: Proliferative DR

Referable DR is defined as classes {2, 3, 4}. Non-referable is {0, 1}.

## 9. Important Preprocessing
Images must be resized to 224x224 using bilinear interpolation. The model utilizes a native dlnetwork translation with embedded z-score layers, meaning preprocessing expects `uint8` equivalent inputs [0, 255.0] formatted as `float32`.

## 10. Important Limitations
Do not mix training code into the production web application dependencies. Training scripts must remain in this folder and be executed separately. The model configuration here reflects the V2 model state.
