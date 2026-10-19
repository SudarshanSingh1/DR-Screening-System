---
name: Model Evaluation / Benchmark Request
about: Propose a new model evaluation, benchmark dataset, or retraining experiment
title: '[MODEL EVAL] '
labels: ['machine-learning', 'evaluation']
assignees: ''
---

**Proposed Experiment / Evaluation Scope**
- [ ] Retraining on expanded clinical cohort
- [ ] Cross-dataset generalization benchmark (e.g. Messidor-2, EyePACS, APTOS)
- [ ] Quantization / Edge optimization (TFLite / ONNX)
- [ ] Calibration and uncertainty estimation enhancement
- [ ] Grad-CAM / XAI fidelity assessment

**Dataset Provenance & Ethics**
- Dataset Name:
- Source / Citation:
- Ethics / De-identification status:
- Size and class distribution:

**Current vs Proposed Baseline**
- Current Production Model: `model/production/V2/DR_EfficientNetB0_V2.keras` (EfficientNetB0)
- Proposed Architecture / Approach:
- Target Metrics (Quadratic Weighted Kappa, Sensitivity @ High Specificity, F1):

**Deployment Considerations**
- Model size / memory footprint:
- Latency budget:
- Backward compatibility with existing inference API:
