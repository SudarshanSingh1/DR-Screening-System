# Testing

This repository contains two separate test suites — one for the real inference pipeline, one for the Simulink operational simulation.

---

## 1. Real Inference Pipeline — `testRealPipeline.m`

**File**: `matlab/tests/testRealPipeline.m`

Tests the real clinical inference pipeline end-to-end on synthetic robustness images.

> ⚠️ The three synthetic test images (black, white, noise) are pipeline robustness tests only. Their model outputs are **not clinically interpretable**.

### Requirements
- MATLAB R2024a or newer with Deep Learning Toolbox
- Model file present: `model/model_file/DR_EfficientNetB0_V2.mat`

### How to Run
```matlab
cd matlab/tests
testRealPipeline()
```

### What is Verified (10 tests)
| Test | Description |
|---|---|
| 1 | Model loads from repo-relative path; `dlnetwork` initialized; 5 classes; config valid |
| 2 | Invalid file path raises `preprocessFundus:FileNotFound` error |
| 3 | BLACK image: full pipeline executes, probs valid, heatmap 224×224, no NaN/Inf |
| 4 | WHITE image: same checks |
| 5 | NOISE image: same checks |
| 6–8 | Class mapping matches `argmax(probs)`; thresholds match `model_config.json` |
| 9 | Heatmaps differ across distinct inputs (pipeline processes images independently) |
| 10 | No Simulink block references any real inference function (isolation verified) |

---

## 2. Simulink Operational Simulation — `testSimulation.m`

**File**: `matlab/simulink/testSimulation.m`

Tests the abstract operational simulation across seven capacity scenarios.

### Requirements
- MATLAB R2024a or newer with Simulink

### How to Run
```matlab
cd matlab/simulink
testSimulation()
```

Or from terminal:
```bash
matlab -batch "cd matlab/simulink; testSimulation()"
```

### Scenarios Tested
| Scenario | Description |
|---|---|
| Baseline | Normal patient load and capacity |
| AI Bottleneck | High arrivals, low AI capacity |
| AI Scale-Up | High arrivals, increased AI capacity |
| Doctor Bottleneck | Normal AI, low doctor capacity |
| Doctor Scale-Up | Normal AI, increased doctor capacity |
| Zero Edge Case | Zero patients — system must handle gracefully |
| High Capacity | Maximum concurrency configuration |

### What is Validated
- Patient conservation: `Generated == NonReferable + Specialist + Recapture`
- Queue length reflects configured bottleneck scenarios
- Throughput changes correctly with capacity changes
