# System Architecture

This repository contains two distinct, isolated pipelines that must never be conflated.

---

## Pipeline 1 — Real Clinical Inference Pipeline

This pipeline operates on actual fundus images using the canonical trained DR model.

```
Fundus Image (file path)
        │
        ▼
matlab/preprocessing/preprocessFundus.m
  - Loads image via imread()
  - Ensures 3-channel RGB (grayscale → replicated, RGBA → first 3 channels)
  - Resizes to 224×224 via bilinear interpolation
  - Converts to float32 single [0, 255]
  - Returns dlarray(img, 'SSC')
        │
        ▼
matlab/inference/loadDRModel.m
  - Loads model/model_file/DR_EfficientNetB0_V2.mat (path resolved relative to repo root)
  - Returns: net (dlnetwork), classNames (5×1 cell), config (struct from model_config.json)
  - Uses persistent caching to avoid repeated disk I/O
        │
        ▼
matlab/inference/predictDR.m
  - Calls predict(net, dlImg) → 1×5 probability vector
  - Applies optimized_threshold (0.20798) to sum(probs[3:5]) → isReferable
  - Applies provisional_confidence_threshold (0.5) to max(probs) → isLowConfidence
  - Returns: probs, predClass (0-indexed), isReferable, isLowConfidence, maxProb
        │
        ▼
matlab/explainability/generateGradCAM.m
  - Uses the SAME dlImg from preprocessFundus (no reload)
  - Target layer: efficientnet-b0|model|head|MulLayer (programmatically verified)
  - Computes gradient of predicted class score w.r.t. feature map activations
  - Returns 224×224 normalized heatmap
        │
        ▼
matlab/reporting/runScreening.m
  - Orchestrates the full pipeline end-to-end
  - Maps to clinical state: 0=Non-Referable, 1=Referable, 2=Low Confidence
  - NOTE: State -1 (Ungradeable) is not yet implemented — requires image quality module
  - Returns consolidated result struct
```

**Clinical State Mapping:**
| State | Meaning |
|---|---|
| -1 | UNGRADEABLE — Recapture required *(not yet implemented in real pipeline)* |
| 0 | NON-REFERABLE |
| 1 | REFERABLE — Specialist review required |
| 2 | LOW CONFIDENCE — Specialist review required |

---

## Pipeline 2 — Abstract Operational Simulation (Simulink)

This pipeline simulates the **operational workflow capacity** of a DR screening service. It does **not** execute the real model. It uses deterministic routing to test queue throughput, bottlenecks, and capacity configurations.

```
Synthetic Patient Events
        │
        ▼
sim_PatientArrival    → generates patient IDs at configurable intervals
        │
        ▼
sim_NetworkDelay      → simulates image transmission latency
        │
        ▼
sim_PatientQueue      → queues patients before AI resource
        │
        ▼
sim_AIResource        → simulates concurrent AI processing slots
        │
        ▼
simulinkQualityAssessment   → ABSTRACT: deterministic quality pass/fail
simulinkQualityDecision     → routes based on quality result
simulinkAIEngine            → ABSTRACT: deterministic class assignment
simulinkReferableDecision   → ABSTRACT: maps class to referable flag
simulinkConfidenceCheck     → ABSTRACT: deterministic low-confidence flag
simulinkClinicalOutput      → passes state downstream
        │
        ▼
sim_DecisionRouter    → routes to exits based on state
        │
        ├──── State 0  ────► Non-Referable Exit (log_Exit_NonRef)
        ├──── State -1 ────► Recapture Exit     (log_Exit_Recap)
        └──── State 1/2 ───► sim_DoctorQueue
                                    │
                                    ▼
                              sim_DoctorResource
                                    │
                                    ▼
                              Specialist Exit  (log_Exit_Spec)
```

All simulation parameters are centralized in `matlab/simulink/simulationConfig.m`.

> ⚠️ The Simulink AI blocks use deterministic hashing of Patient IDs **exclusively for simulation routing purposes**. This is clearly labeled within each block. These values are never presented as real AI predictions, clinical decisions, or model outputs.

---

## Isolation Guarantee

The real clinical inference pipeline (`matlab/inference/`, `matlab/preprocessing/`, `matlab/explainability/`, `matlab/reporting/`) and the abstract Simulink operational simulation (`matlab/simulink/`) are **completely isolated**. No Simulink block references `loadDRModel`, `predictDR`, `runScreening`, `generateGradCAM`, or `preprocessFundus`.
