<div align="center">

<img src="frontend/public/VisionAi.png" width="56" alt="Vision AI Logo" />

<br />

# Vision AI

<h3><strong>Explainable AI for Diabetic Retinopathy Screening in Rural India</strong></h3>

<sub>Problem Statement: SIH26038 &nbsp;|&nbsp; Smart India Hackathon 2026</sub>

<br />

![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow_2.x-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MATLAB](https://img.shields.io/badge/MATLAB_R2023b-0076A8?style=for-the-badge&logo=mathworks&logoColor=white)

<br />

<table>
  <tr>
    <td align="center" width="340">
      <strong>Clinical Dashboard</strong><br />
      <sub>Doctor review panel — full-res images, AI assessment, Grad-CAM</sub><br /><br />
      <a href="http://localhost:3000">
        <img src="https://img.shields.io/badge/visionai--clinical--dashboard.local-20232A?style=for-the-badge&logoColor=white" alt="Clinical Dashboard" />
      </a>
    </td>
    <td align="center" width="340">
      <strong>Inference API</strong><br />
      <sub>FastAPI inference server — /analyze endpoints</sub><br /><br />
      <a href="http://localhost:8000/health">
        <img src="https://img.shields.io/badge/visionai--inference--api.local-009688?style=for-the-badge&logoColor=white" alt="Inference API" />
      </a>
    </td>
  </tr>
</table>

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture (Deployed Pipeline)](#system-architecture-deployed-pipeline)
  - [Bilateral Screening & Worst-Eye Triage](#bilateral-screening--worst-eye-triage)
- [Implementation Status Table](#implementation-status-table)
- [Image Quality Gate](#image-quality-gate)
- [Production Deep Learning Pipeline](#production-deep-learning-pipeline)
  - [Five-Class Severity Classification](#five-class-severity-classification)
  - [Referable DR Triage Rule](#referable-dr-triage-rule)
  - [Exploratory Heuristic Evidence Overlays](#exploratory-heuristic-evidence-overlays)
- [Explainable AI (Grad-CAM)](#explainable-ai-grad-cam)
  - [Logits-Based Gradient Attribution](#logits-based-gradient-attribution)
  - [Confidence & Uncertainty Boundary](#confidence--uncertainty-boundary)
- [Referable-DR Evaluation & Verification](#referable-dr-evaluation--verification)
  - [Empirical Performance on Verification Split](#empirical-performance-on-verification-split)
  - [Confusion Matrix](#confusion-matrix)
- [Datasets and Evaluation Scope](#datasets-and-evaluation-scope)
- [MATLAB and Simulink Role](#matlab-and-simulink-role)
  - [MATLAB-to-Keras Model Parity](#matlab-to-keras-model-parity)
  - [Simulink Operational Simulation](#simulink-operational-simulation)
- [Planned Research Pipeline (In Progress)](#planned-research-pipeline-in-progress)
- [Technology Stack](#technology-stack)
- [Installation and Execution](#installation-and-execution)
- [Security, Privacy, and Clinical Safety](#security-privacy-and-clinical-safety)
- [SIH Presentation Login Credentials](#sih-presentation-login-credentials)
- [Team Viltrumites](#team-viltrumites)

---

## Project Overview

**Vision AI** is an AI-assisted screening and clinical decision support system designed for diabetic retinopathy (DR) triage across rural primary health centres (PHCs) and district hospitals in India. Developed for Smart India Hackathon (Problem Statement: **SIH26038**), the platform addresses critical healthcare bottlenecks: an acute shortage of vitreoretinal specialists in rural districts, high patient volumes at screening camps, varying non-mydriatic camera quality, and intermittent connectivity.

The system enables rural healthcare workers to register patients and upload bilateral fundus images. An automated image quality gate intercepts ungradable captures on-site. Deployed deep learning models compute 5-class DR severity predictions, referable risk flags, and visual Grad-CAM attention heatmaps. The results are queued for remote ophthalmologist tele-review, where the doctor holds sole authority for medical diagnosis and report issuance.

> [!IMPORTANT]
> **Assistive Screening Mandate:** Vision AI is an assistive decision-support tool designed to prioritize tele-ophthalmology queues and illuminate suspect retinal lesions. It is **not an autonomous diagnostic device** and does not substitute for clinical examination by a certified ophthalmologist.

---

## System Architecture (Deployed Pipeline)

The production web application runs a verified Python and TypeScript pipeline. Incoming bilateral fundus photographs pass through an automated quality gate before deep learning classification and explainability:

```mermaid
flowchart LR
    %% Styling
    classDef input fill:#e0e7ff,stroke:#4338ca,stroke-width:2px,color:#1e1b4b;
    classDef gate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#451a03;
    classDef ml fill:#f5efff,stroke:#7c3aed,stroke-width:2px,color:#2e1065;
    classDef xai fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#3b0764;
    classDef clinical fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#7c2d12;
    classDef output fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b;

    IN["<b>Bilateral Fundus Images</b><br/><i>(leftEye, rightEye files)</i>"]:::input
    QG["<b>Image Quality Gate</b><br/><i>Sharpness, Lighting & Dim Filter</i>"]:::gate
    API["<b>FastAPI Gateway</b><br/><i>POST /analyze</i>"]:::ml
    M5["<b>EfficientNetB0 V2</b><br/><i>5-Class Softmax Classifier</i>"]:::ml
    XAI["<b>Logits Grad-CAM</b><br/><i>top_activation Heatmap</i>"]:::xai
    DOC["<b>Doctor Review Queue</b><br/><i>Ophthalmologist Tele-Review</i>"]:::clinical
    REP["<b>Clinical Referral Report</b><br/><i>Bilingual PDF + QR Code</i>"]:::output

    IN --> QG
    QG -->|PASS| API
    QG -.->|FAIL: Blur / Dark / Small| IN
    API --> M5
    M5 --> XAI
    XAI --> DOC
    DOC --> REP
```

<br />

<div align="center">
<img src="frontend/src/assets/system%20design.jpeg" alt="System Design" width="85%" style="border-radius: 8px;" />
<br /><sub>Multi-tier deployed system topology: React UI, Express Gateway, PostgreSQL (Prisma), and FastAPI inference engine.</sub>
</div>

---

### Bilateral Screening & Worst-Eye Triage

Diabetic retinopathy frequently presents with marked bilateral asymmetry. The production pipeline processes both eyes independently and enforces clinical worst-eye prioritization:

1. **Independent Dual Pipeline:** `POST /analyze` receives `leftEye` and `rightEye` multipart streams, generating distinct 5-class distributions, referable flags, and Grad-CAM overlays for each eye.
2. **Worst-Eye Referral Governance:** Public health triage urgency is determined by the more severe eye:
   $$\text{Patient Referral Priority} = \max\left(\text{Grade}_{\text{Left Eye}}, \text{Grade}_{\text{Right Eye}}\right)$$
   A patient with Level 1 (Mild) in the left eye and Level 3 (Severe) in the right eye is automatically triaged for **Urgent Specialist Referral**.
3. **Synchronized Review Panel:** The doctor portal displays both eyes side-by-side with independent Grad-CAM opacity toggles and per-eye diagnostic override inputs.

---

## Implementation Status Table

In adherence to honest engineering and clinical audit standards, the operational status of every platform component is verified below directly against repository code and artifacts:

| Component | Status | Evidence in Codebase |
|---|:---:|---|
| **EfficientNetB0 V2 Inference** | **Verified Deployed** | `inference_service/main.py` (`PythonV2Provider`), `model/production/V2/DR_EfficientNetB0_V2.keras` (240 layers) |
| **Grad-CAM Explainability** | **Verified Deployed** | Logits-based gradient backpropagation on `top_activation` ($7 \times 7 \times 1280$) in `inference_service/main.py` |
| **Image Quality Gate** | **Implemented** | Scale-invariant Laplacian blur, illumination, and dimension checks in `inference_service/quality_gate.py` (8 unit tests) |
| **Sensitivity / Specificity Evaluation** | **Completed (Benchmark Split)** | Reproducible evaluation script `model/evaluation/evaluate_referable_dr.py` and report `model/evaluation/evaluation_report.md` |
| **MATLAB-Keras Parity** | **Not Run (Environment Constraint)** | Parity protocol documented in `model/evaluation/matlab_keras_parity_report.md`; MATLAB runtime unavailable in current environment |
| **Vessel / Disc / Lesion Segmentation** | **Planned (Heuristic Previews Deployed)** | Exploratory spatial filters in `inference_service/evidence_generator.py`; deep semantic segmentation models remain in research |
| **Cross-Dataset Testing** | **Planned** | Protocol and directory manifests in `matlab/datasets/` and `model/training/README.md`; multi-center validation pending |
| **Simulink Simulation** | **Verified Implemented** | `matlab/simulink/DRScreeningSystem.slx`, `DRDistrictSystem.slx` with 17 custom operational queuing blocks |

---

## Image Quality Gate

Non-mydriatic fundus cameras operated by rural health workers often capture blurred, underexposed, or improperly centered images. To prevent diagnostic errors, Vision AI integrates a deterministic quality-check module ([`inference_service/quality_gate.py`](file:///Users/sudarshankumar/DR-Screening-System/inference_service/quality_gate.py)):

### Quality Evaluation Metrics & Thresholds

| Check | Metric Evaluated | Rejection Threshold | Clinical Rationale |
|---|---|:---:|---|
| **Defocus / Blur** | Scale-normalized Laplacian variance at $512 \times 512$ | $< 12.0$ | Severe blur obscures microaneurysms and delicate vascular branches. |
| **Underexposure** | Mean grayscale illumination of retinal foreground | $< 30.0$ / $255$ | Dark captures hide intraretinal hemorrhages and cotton wool spots. |
| **Overexposure / Glare** | Mean grayscale illumination of retinal foreground | $> 235.0$ / $255$ | Corneal reflection washouts eliminate macular lesion visibility. |
| **Dimension Check** | Image width and height | $< 150 \text{ px}$ | Insufficient resolution for diagnostic feature extraction. |
| **Aspect Ratio** | Aspect ratio $\max(W/H, H/W)$ | $> 2.5$ | Rejects non-fundus banners, corrupted strips, or thumbnail artifacts. |
| **Field Coverage** | Retinal foreground pixel fraction ($>15$ intensity) | $< 15\%$ | Detects lens cap closures or completely obstructed optical fields. |

### Test Demonstration: Quality Gate Rejection

When an uploaded fundus photograph fails the quality gate (e.g. from camera shake or patient movement), inference is safely aborted and a structured JSON rejection is returned:

```json
// Example Test Output: POST /quality-check (Defocused Fundus Image)
{
  "passed": false,
  "status": "FAIL",
  "reason": "Defocus/motion blur detected: sharpness metric (2.85) is below acceptable quality boundary (12.0). Retinal vessels cannot be resolved reliably.",
  "action": "RECAPTURE_REQUIRED",
  "metrics": {
    "width": 2048,
    "height": 1536,
    "aspectRatio": 1.33,
    "meanBrightness": 74.20,
    "sharpness": 2.85,
    "fieldFraction": 0.82
  },
  "thresholds": {
    "min_dimension": 150,
    "max_aspect_ratio": 2.5,
    "min_brightness": 30.0,
    "max_brightness": 235.0,
    "min_sharpness": 12.0,
    "min_field_fraction": 0.15
  }
}
```

*Verified via unit tests in [`inference_service/tests/test_quality_gate.py`](file:///Users/sudarshankumar/DR-Screening-System/inference_service/tests/test_quality_gate.py) across good-quality, blurry, dark, washed-out, and undersized test images.*

---

## Production Deep Learning Pipeline

The production inference microservice executes a deterministic pipeline around `DR_EfficientNetB0_V2.keras`:

1. **Ingestion & Validation:** Receives multipart image data, decodes via PIL into 3-channel RGB `uint8`.
2. **Quality Gate Assessment:** Evaluates focus, illumination, and geometry. Returns immediate recapture requests on failure.
3. **Spatial Rescaling:** Resizes to $224 \times 224$ pixels using bilinear interpolation and casts to `float32` in $[0.0, 255.0]$.
4. **Embedded Model Normalization:** The Keras model embeds native `rescaling` ($\div 255$) and `normalization` (ImageNet channel z-score: $\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).
5. **Backbone Feature Extraction:** 238 layers comprising inverted residual MBConv blocks with Squeeze-and-Excitation.
6. **Softmax Output:** Dense `dr_classifier` outputs 5 unnormalized logits, converted to class probabilities $\mathbf{p} = [p_0, p_1, p_2, p_3, p_4]$ via softmax.

### Five-Class Severity Classification

Vision AI follows the **International Clinical Diabetic Retinopathy (ICDR)** severity scale:

| Level | Severity Grade | Clinical Retinal Findings | Triage Referral Pathway |
|:---:|:---|:---|:---|
| **0** | **No DR** | No visible diabetic retinal lesions | Non-referable. Annual rescreening. |
| **1** | **Mild NPDR** | Microaneurysms only | Non-referable. Follow-up in 6–12 months. |
| **2** | **Moderate NPDR** | Microaneurysms, dot/blot hemorrhages, hard exudates | **Referable DR**. Specialist review in 3–6 months. |
| **3** | **Severe NPDR** | 4-2-1 rule (>20 hemorrhages in 4 quadrants, venous beading) | **Referable DR**. Urgent referral in 2–4 weeks. |
| **4** | **Proliferative DR** | Neovascularization (NVD/NVE), vitreous hemorrhage | **Referable DR**. Immediate specialist intervention. |

### Referable DR Triage Rule

In public health screening, Referable DR is defined as any stage requiring specialist attention (Level $\ge 2$). The referable score is computed by summing tail probabilities:

$$P(\text{Referable}) = \sum_{c=2}^{4} p_c = p_{\text{Moderate}} + p_{\text{Severe}} + p_{\text{Proliferative}}$$

The active triage rule configured in `model/config/model_config.json` uses the optimized sensitivity threshold:
$$\text{isReferable} = \begin{cases} \mathbf{true} & \text{if } P(\text{Referable}) \ge 0.20798 \\ \mathbf{false} & \text{otherwise} \end{cases}$$

> [!NOTE]
> **Threshold Provenance:** The threshold $0.20798$ was derived from development validation curves to bias towards high sensitivity in rural screening. This threshold is an empirical heuristic that requires formal prospective clinical validation before autonomous deployment.

---

### Exploratory Heuristic Evidence Overlays

To aid ophthalmologists in rapid visual review, [`inference_service/evidence_generator.py`](file:///Users/sudarshankumar/DR-Screening-System/inference_service/evidence_generator.py) generates four visual inspection aids:

- **Enhanced Image (`qualityEvidence`):** Contrast ($1.5\times$) and color ($1.2\times$) enhancement to reveal faint retinal lesions.
- **Vessel Map Preview (`vesselEvidence`):** Green-channel inversion ($255 - G$) with Gaussian high-pass spatial filtering ($\sigma = 15$) and 92nd-percentile thresholding.
- **Optic Disc & Fovea Marker (`discFoveaEvidence`):** Multi-scale spatial blurring to estimate the brightest landmark (optic disc, yellow ring) and central dark landmark (fovea, cyan ring).
- **Lesion Highlight Map (`lesionEvidence`):** High-pass edge filtering colorized red and blended ($50\%$) with the original fundus image.

> [!CAUTION]
> **Heuristic Boundary Notice:** These four visual generators are **exploratory image-processing filters** intended solely as UI inspection aids for reviewing clinicians. They are **not** deep learning segmentation models (e.g. U-Net++ or DeepLabV3+) and must not be treated as certified lesion segmentations.

---

## Explainable AI (Grad-CAM)

Vision AI incorporates **Gradient-weighted Class Activation Mapping (Grad-CAM)** to visually highlight regions of diagnostic importance on fundus images.

### Logits-Based Gradient Attribution

A common failure mode in medical Grad-CAM is vanishing gradients caused by post-softmax saturation when the model is confident ($p_c \to 1.0$). To prevent this, Vision AI taps the pre-softmax logits from the `dr_classifier` dense layer:

$$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^{U} \sum_{j=1}^{V} \frac{\partial z^c}{\partial A_{ij}^k}, \qquad L_{\mathrm{Grad-CAM}}^c = \mathrm{ReLU}\left( \sum_{k=1}^{K} \alpha_k^c A^k \right)$$

where $A^k$ represents the $7 \times 7$ feature maps from `top_activation` ($K = 1280$), and $z^c$ is the unnormalized logit for target class $c$.

The resulting heatmap is normalized to $[0, 1]$, upsampled to $224 \times 224$, color-mapped using `jet`, and dynamically alpha-blended with the original image (maximum $60\%$ opacity at peak activation):
$$\text{Overlay} = (\text{Heatmap}_{\text{jet}} \times \alpha) + (\text{Fundus}_{\text{original}} \times (1 - \alpha)), \quad \alpha = \text{Heatmap}_{\text{norm}} \times 0.60$$

### Confidence & Uncertainty Boundary

Model probabilities represent raw softmax scores:
$$p_i = \frac{e^{z_i}}{\sum_{j=0}^4 e^{z_j}}$$

- **Uncalibrated Probability Notice:** These scores are uncalibrated model outputs and do not represent true Bayesian posterior probabilities.
- **Low Confidence Alert:** If $\max(p) < 0.50$, the system flags `isLowConfidence = true`, notifying the doctor that the case falls near the decision boundary.

> [!WARNING]
> **Safety Boundary:** Grad-CAM displays model attention correlation. It does **not** provide ground-truth lesion boundaries and must never be interpreted as clinical evidence without ophthalmologist validation.

---

## Referable-DR Evaluation & Verification

To establish an honest, verifiable performance record, the deployed model (`model/production/V2/DR_EfficientNetB0_V2.keras`) was evaluated on the 15 held-out verification benchmark images recorded in `model/production/V2/verification_report.json`.

Evaluation was performed using the reproducible script [`model/evaluation/evaluate_referable_dr.py`](file:///Users/sudarshankumar/DR-Screening-System/model/evaluation/evaluate_referable_dr.py):

### Empirical Performance on Verification Split

| Metric | Evaluated Result ($N=15$) | 95% Wilson Score Confidence Interval | Clinical Target Standard |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **22.2%** (2/9) | [6.3%, 54.7%] | $\ge 93.0\%$ (Target) |
| **Specificity** | **50.0%** (3/6) | [18.8%, 81.2%] | $\ge 87.5\%$ (Target) |
| **Precision (PPV)** | **40.0%** (2/5) | [11.8%, 76.9%] | High positive yield |
| **Negative Predictive Value (NPV)** | **30.0%** (3/10) | [10.8%, 60.3%] | High rule-out safety |
| **Overall Accuracy** | **33.3%** (5/15) | [15.2%, 58.3%] | — |
| **Binary F1-Score** | **0.2857** | — | $\ge 0.88$ (Target) |

### Confusion Matrix

```text
                             Predicted Non-Referable     Predicted Referable
Actual Non-Referable (0–1)           TN = 3                    FP = 3
Actual Referable (2–4)               FN = 7                    TP = 2
```

### Critical Findings & Clinical Implications:
1. **High False Negative Rate on Verification Cohort:** On this 15-sample verification set, 7 of 9 referable cases were under-predicted by the fine-tuned checkpoint.
2. **Mandatory Doctor Review:** This empirical result proves why the **Doctor-in-the-Loop** model is essential. The AI model cannot operate autonomously; certified retina specialists must review every case.
3. **Clinical Target ($\ge 93\%$ Sensitivity):** While historical training on the full development split reached high accuracy, the $\ge 93\%$ sensitivity target remains a **developmental objective** requiring multi-center retraining across diverse Indian fundus datasets.
4. **Reproducibility:** Run the evaluation script at any time:
   ```bash
   python3 model/evaluation/evaluate_referable_dr.py
   ```

---

## Datasets and Evaluation Scope

Model development and research benchmarking reference the following standardized retinal datasets:

| Dataset | Repository Availability | Role in Project | Images Used | Evaluation Status |
|---|---|---|:---:|---|
| **APTOS 2019** | Documented in `model/training/README.md` (Raw images external via `DATASET_ROOT`) | Primary fine-tuning and developmental split | 3,662 | **Developmental split trained**; 15-sample verification split evaluated in `evaluation_report.md` |
| **EyePACS (Kaggle DR)** | Documented in `matlab/datasets/` | Large-scale pre-training backbone | ~35,000 | Backbone pre-training reference |
| **Messidor / Messidor-2** | Documented in `matlab/datasets/` | Multi-center external validation | 1,748 | **Planned** for prospective multi-center testing |
| **IDRiD** | Documented in `matlab/datasets/` | Ground truth for Indian population lesion segmentation | 516 | **Planned** for future lesion segmentation validation |
| **DRIVE** | Documented in `matlab/datasets/` | Retinal microvasculature segmentation reference | 40 | **Planned** for future vessel segmentation validation |

> **Data Privacy Policy:** Raw retinal datasets and patient-identifiable data are strictly excluded from version control via `.gitignore` to comply with privacy regulations and avoid repository bloat.

---

## MATLAB and Simulink Role

Vision AI maintains a clear architecture boundary between production deployment and offline research:

```text
Production Deployed Stack (Docker)             Offline Research & Simulation Stack
┌──────────────────────────────────────┐       ┌─────────────────────────────────────┐
│ React Frontend (Port 3000)           │       │ matlab/algorithms/                  │
│ Node.js / Express API (Port 8080)    │       │   (preprocessing, enhancement)      │
│ FastAPI Inference Engine (Port 8000) │       │ matlab/simulink/                    │
│   DR_EfficientNetB0_V2.keras         │       │   (DRScreeningSystem.slx)           │
│ PostgreSQL 16 Database (Port 5432)   │       │ matlab/training/                    │
└──────────────────────────────────────┘       │   (contributor workspace & scripts) │
                                               └─────────────────────────────────────┘
```

- **Python (Deployed):** Runs real-time inference, API routing, quality checks, Grad-CAM generation, and web interfaces.
- **MATLAB (Research):** Used offline for algorithmic research, training script templates (`matlab/training/scripts/train_dr_model.m`), and reference functions (`matlab/inference/`).
- **Simulink (Simulation):** Used offline for healthcare operational planning, clinic queue latency modeling, and district capacity stress-testing.

---

### MATLAB-to-Keras Model Parity

- **Parity Status:** **NOT RUN (MATLAB Runtime Not Available in Execution Environment)**
- **Reference Model:** `model/reference/DR_EfficientNetB0_V2.mat` (289 layers)
- **Production Model:** `model/production/V2/DR_EfficientNetB0_V2.keras` (240 layers)
- **Report & Protocol:** See [`model/evaluation/matlab_keras_parity_report.md`](file:///Users/sudarshankumar/DR-Screening-System/model/evaluation/matlab_keras_parity_report.md) for full layer mapping, input tensor layout comparisons, and future verification instructions.

---

### Simulink Operational Simulation

The `matlab/simulink/` directory hosts discrete-event models for district-level screening logistics:
- **Models:** `DRScreeningSystem.slx` (clinic queue) and `DRDistrictSystem.slx` (district network).
- **Custom Blocks (17 implementations):** `sim_PatientArrival.m`, `sim_DoctorQueue.m`, `sim_AIResource.m`, `sim_DecisionRouter.m`.
- **Function:** Tests patient queue latency, ophthalmologist service capacity, and network bandwidth constraints across rural clinics.

<br />

<div align="center">
<img src="frontend/src/assets/simulation-2.jpeg" width="45%" style="border-radius: 8px; margin-right: 5px;" />
<img src="frontend/src/assets/Throughput%20Metrics.jpeg" width="45%" style="border-radius: 8px;" />
<br /><sub>Simulink operational simulation models patient arrival queues, doctor tele-review latency, and clinic throughput.</sub>
</div>

---

## Planned Research Pipeline (In Progress)

To evolve Vision AI from an assistive single-model triage tool into a comprehensive diagnostic suite, the following research components are actively in development:

```text
[Planned Multi-Stage AI Pipeline]
Fundus Capture ──> [EfficientNet-B2: Deep IQA]
                      └──> [U-Net++: Retinal Vessel Segmentation]
                              └──> [Heatmap CNN: Optic Disc & Fovea Localization]
                                      └──> [DeepLabV3+: Multi-Lesion Segmentation]
                                              └──> [ResNet-101: Multi-Task DR Grading]
                                                      └──> [Grad-CAM++ & Epistemic Uncertainty]
```

1. **Deep Learning Image Quality Assessment (EfficientNet-B2):** Replacing deterministic Laplacian filters with a convolutional model trained on EyePACS-QA to classify focus, illumination, and media opacities (senile cataracts).
2. **Retinal Vessel Segmentation (U-Net++):** Deep supervision network for microvascular caliber ratios and arteriolar-to-venular ratio (AVR) analysis.
3. **Optic Disc & Fovea Localization (U-Net++ + Heatmap CNN):** Sub-pixel regression for landmark coordinates, standardizing retinal quadrants and foveal exudate proximity for Clinically Significant Macular Edema (CSME).
4. **Lesion Semantic Segmentation (DeepLabV3+ ResNet-50):** Multi-class segmentation isolating microaneurysms, hemorrhages, and hard/soft exudates.
5. **Multi-Task DR Severity Classification (ResNet-101):** Auxiliary heads predicting overall 5-level severity alongside focal lesion counts.
6. **Temperature Calibration & Epistemic Uncertainty:** Post-hoc temperature scaling ($T$) to minimize Expected Calibration Error (ECE), and Monte Carlo Dropout for Bayesian uncertainty estimates.

---

## Technology Stack

| Domain | Technology | Component Role in Vision AI |
|---|---|---|
| **Deep Learning** | **TensorFlow 2.x & Keras** | Production inference engine (`DR_EfficientNetB0_V2.keras`), Logits Grad-CAM |
| **Quality Gate** | **Python (NumPy + Pillow)** | Deterministic blur, illumination, and dimension gate (`quality_gate.py`) |
| **Inference API** | **FastAPI & Uvicorn** | Asynchronous HTTP inference microservice (`POST /analyze`, port 8000) |
| **Backend Gateway** | **Node.js 20 & Express 5** | RBAC session engine, multipart proxy, audit logs, PDFKit report generation |
| **Database & ORM** | **PostgreSQL 16 & Prisma** | Relational metadata persistence (`Screening`, `ClinicalReview`, `Patient`) |
| **Frontend Portals** | **React 18 & TypeScript (Vite)** | Responsive portals for Staff, Doctor, Admin, and Patient with TailwindCSS |
| **Operational Simulation** | **MATLAB & Simulink** | Discrete-event healthcare capacity simulation (`DRScreeningSystem.slx`) |
| **Toolboxes** | **Deep Learning, Image Processing, Computer Vision, Medical Imaging** | MathWorks toolboxes for research, CLAHE, and reference pipelines |
| **Containerization** | **Docker & Docker Compose** | 4-service edge orchestration with isolated bridge network |

---

## Installation and Execution

Vision AI is containerized for deployment at rural vision centres and district hospitals.

### 1. Prerequisites
- Docker Engine 24.0+ and Docker Compose 2.20+
- Node.js 20 LTS (for local dev without Docker)
- Python 3.11 with TensorFlow (for local inference testing)

### 2. Quick Start with Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/SudarshanSingh1/DR-Screening-System.git
cd DR-Screening-System

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch all 4 services
docker compose up --build
```

### 3. Service Access Endpoints

| Portal / Service | URL | Port | Health Check |
|---|---|:---:|---|
| **Frontend Portal** | `http://localhost:3000` | 3000 | Web UI (Staff, Doctor, Admin, Patient) |
| **Backend API Gateway** | `http://localhost:8080` | 8080 | `GET /api/health` |
| **Inference Service** | `http://localhost:8000` | 8000 | `GET http://localhost:8000/health` |
| **PostgreSQL Database** | `localhost:5432` | 5432 | `pg_isready -h localhost -p 5432` |

### 4. Running Tests & Quality Verification

```bash
# Run backend test suite
npm --prefix backend test

# Run Python inference & quality gate unit tests
python3 -m unittest discover -s inference_service/tests

# Run reproducible referable-DR evaluation
python3 model/evaluation/evaluate_referable_dr.py
```

---

## Security, Privacy, and Clinical Safety

- **Patient Data Protection:** Screening records separate relational metadata from raw fundus images. Temporary upload buffers are wiped immediately after inference.
- **Aadhaar Data Governance:** In compliance with UIDAI regulations and India's Digital Personal Data Protection (DPDP) Act 2023, Vision AI **never stores raw 12-digit Aadhaar UID numbers or biometric data**. Only opaque system-generated patient identifiers (`patientId`) and masked display references (`XXXX XXXX 1234`) are retained on clinical reports.
- **Offline Limitations:** Deployed edge instances require local network connectivity between the browser client and the containerized backend/inference services. Asynchronous offline queue synchronization to tertiary hospitals is currently in progress.
- **Clinical Safety Disclaimer:** Vision AI is a research and clinical decision-support prototype developed for SIH26038. It does not possess CDSCO medical device certification and must not be used as an autonomous diagnostic authority. Certified ophthalmologist review is mandatory for all clinical determinations.

---

## SIH Presentation Login Credentials

Predefined role-based test accounts for demonstration and evaluation:

| Role | Account | Email | Password |
|---|---|---|---|
| **Screening Staff** | Staff 1 | `screening.staff1@visionai.health` | `Vision@Staff1#2026` |
| **Screening Staff** | Staff 2 | `screening.staff2@visionai.health` | `Vision@Staff2#2026` |
| **Doctor** | Doctor 1 | `doctor1@visionai.health` | `Vision@Doctor1#2026` |
| **Doctor** | Doctor 2 | `doctor2@visionai.health` | `Vision@Doctor2#2026` |
| **Patient** | Patient 1 | `patient1@visionai.health` | `Vision@Patient1#2026` |

---

<div align="center">

## Team Viltrumites

<p style="color: #888;">Smart India Hackathon 2026 &mdash; Problem Statement: SIH26038</p>

<table width="60%" style="border-collapse: collapse; text-align: left;">
  <thead>
    <tr style="background-color: rgba(255, 255, 255, 0.05);">
      <th style="padding: 12px; border-bottom: 1px solid #444;">Name</th>
      <th style="padding: 12px; border-bottom: 1px solid #444;">Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;"><b>Akshay Kumar Verma</b></td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">Team Leader</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;"><b>Anshu Kumar</b></td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">Team Member</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;"><b>Aditi Gargi</b></td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">Team Member</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;"><b>Sudarshan Kumar</b></td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">Team Member</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;"><b>Krishna Kumar</b></td>
      <td style="padding: 12px; border-bottom: 1px solid #333;">Team Member</td>
    </tr>
    <tr>
      <td style="padding: 12px;"><b>Aditya Singh</b></td>
      <td style="padding: 12px;">Team Member</td>
    </tr>
  </tbody>
</table>

<br /><br />

Built for Smart India Hackathon 2026 (SIH26038)
<br /><br />
<img src="frontend/src/assets/MakeInIndia.jpeg" width="120" alt="Make in India" />

</div>
