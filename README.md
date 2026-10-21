<div align="center">

<img src="docs/images/VisionAi.png" width="72" alt="Vision AI Logo" />

<br />

# Vision AI

### <strong>Assistive Deep Learning for Diabetic Retinopathy Screening in Rural India</strong>

<sub>Problem Statement: <b>SIH26038</b> &nbsp;|&nbsp; Smart India Hackathon 2026</sub>

<br />

![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow_2.x-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MATLAB](https://img.shields.io/badge/MATLAB_R2023b-0076A8?style=for-the-badge&logo=mathworks&logoColor=white)
![Simulink](https://img.shields.io/badge/Simulink-0076A8?style=for-the-badge&logo=mathworks&logoColor=white)

<br />

<table>
  <tr>
    <td align="center" width="340">
      <strong>Clinical Web Application</strong><br />
      <sub>Tele-ophthalmology portal — bilateral triage, Grad-CAM, signed reports</sub><br /><br />
      <a href="http://localhost:3000">
        <img src="https://img.shields.io/badge/visionai--clinical--dashboard.local-20232A?style=for-the-badge&logoColor=white" alt="Clinical Web Application" />
      </a>
    </td>
    <td align="center" width="340">
      <strong>AI Inference Microservice</strong><br />
      <sub>FastAPI inference engine — /analyze &amp; /quality-check</sub><br /><br />
      <a href="http://localhost:8000/health">
        <img src="https://img.shields.io/badge/visionai--inference--api.local-009688?style=for-the-badge&logoColor=white" alt="Inference Microservice" />
      </a>
    </td>
    <td align="center" width="340">
      <strong>Backend API Gateway</strong><br />
      <sub>Node.js / Express — Auth, RBAC, Prisma ORM, PDF generation</sub><br /><br />
      <a href="http://localhost:8080/api/health">
        <img src="https://img.shields.io/badge/visionai--api--gateway.local-43853D?style=for-the-badge&logoColor=white" alt="API Gateway" />
      </a>
    </td>
  </tr>
</table>

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Six Specialized AI Models](#six-specialized-ai-models)
   - [1. EfficientNet-B2 — Image Quality Assessment](#1-efficientnet-b2-image-quality-assessment)
   - [2. U-Net++ — Retinal Vessel Segmentation](#2-u-net-retinal-vessel-segmentation)
   - [3. U-Net++ + Heatmap CNN — Optic Disc & Fovea Localization](#3-u-net-heatmap-cnn-optic-disc-fovea-localization)
   - [4. DeepLabV3+ (ResNet-50) — Lesion Segmentation](#4-deeplabv3-resnet-50-lesion-segmentation)
   - [5. ResNet-101 Multi-Task — DR Severity Grading](#5-resnet-101-multi-task-dr-severity-grading)
   - [6. Grad-CAM++ + Calibration/Uncertainty — Explainability & Trust](#6-grad-cam-calibrationuncertainty-explainability-trust)
3. [AI Pipeline Architecture](#ai-pipeline-architecture)
   - [Six-Stage Pipeline Flow](#six-stage-pipeline-flow)
   - [Decoupled Multi-Tier System Topology](#decoupled-multi-tier-system-topology)
4. [Explainable AI](#explainable-ai)
   - [Logits Grad-CAM Formulation](#logits-grad-cam-formulation)
   - [Softmax Saturation Mitigation](#softmax-saturation-mitigation)
   - [Confidence Assessment & Epistemic Uncertainty](#confidence-assessment-epistemic-uncertainty)
5. [Bilateral Screening: Left Eye and Right Eye](#bilateral-screening-left-eye-and-right-eye)
   - [Dual-Channel Bilateral Workflow](#dual-channel-bilateral-workflow)
   - [Patient-Level Worst-Eye Governance](#patient-level-worst-eye-governance)
   - [Referable DR Tail-Sum Decision Rule](#referable-dr-tail-sum-decision-rule)
6. [Clinical Workflow & Doctor-in-the-Loop](#clinical-workflow-doctor-in-the-loop)
   - [Rural & Low-Connectivity Screening Goals](#rural-low-connectivity-screening-goals)
   - [Doctor Review Queue & Override Authority](#doctor-review-queue-override-authority)
   - [Bilingual Clinical Referral Reports](#bilingual-clinical-referral-reports)
7. [Technology Stack](#technology-stack)
   - [Runtime & Infrastructure Stack](#runtime-infrastructure-stack)
   - [MathWorks Engineering Ecosystem](#mathworks-engineering-ecosystem)
8. [MATLAB and Simulink](#matlab-and-simulink)
   - [Discrete-Event Healthcare Capacity Modeling](#discrete-event-healthcare-capacity-modeling)
   - [Algorithm Development & Cross-Platform Parity](#algorithm-development-cross-platform-parity)
9. [Datasets and Evaluation](#datasets-and-evaluation)
   - [Public Retinal Datasets](#public-retinal-datasets)
   - [Clinical Target Standards vs. Empirical Verification](#clinical-target-standards-vs-empirical-verification)
   - [Contingency Matrix & Clinical Governance](#contingency-matrix-clinical-governance)
10. [Repository Structure](#repository-structure)
11. [Installation and Execution](#installation-and-execution)
    - [Prerequisites & Environment Configuration](#prerequisites-environment-configuration)
    - [Docker Compose Quickstart](#docker-compose-quickstart)
    - [Automated Multi-Tier Test Suite](#automated-multi-tier-test-suite)
    - [SIH Presentation Test Accounts](#sih-presentation-test-accounts)
12. [Future Scope](#future-scope)
13. [Open-Source Research References](#open-source-research-references)
14. [Security and Clinical Disclaimer](#security-and-clinical-disclaimer)
15. [Team Viltrumites](#team-viltrumites)

---

## Project Overview

**Vision AI** (Problem Statement: **SIH26038**, Smart India Hackathon 2026) is an assistive, explainable clinical decision-support system engineered for diabetic retinopathy (DR) triage across primary health centres (PHCs), rural vision centres, and district hospital tele-ophthalmology networks in India.

Diabetic Retinopathy is the leading cause of preventable adult blindness globally and in India, which is home to over 77 million individuals living with diabetes mellitus. In rural Indian districts, the ratio of certified ophthalmologists to citizens frequently drops below 1:100,000 (compared to the WHO recommended benchmark of 1:50,000). As a result, early microvascular abnormalities go undetected until irreversible vision loss occurs.

Vision AI bridges this diagnostic divide by enabling community health workers to capture digital fundus photographs and receive automated triage guidance, routing urgent sight-threatening cases to district hospital ophthalmologists while preserving physician oversight as an absolute prerequisite.

### Key Engineering & Architectural Specifications

| Parameter | Specification & Benchmark | Engineering Scope |
|---|:---:|---|
| **Pipeline Architecture** | **Six Specialized AI Stages** | Modular sequence covering quality, anatomy, lesions, grading, explainability, and review |
| **Active Production Backbone** | **EfficientNetB0 V2** | Fine-tuned 240-layer functional classifier loaded from `model/production/V2/DR_EfficientNetB0_V2.keras` |
| **Model Parameter Count** | **4,055,845** (~4.06M) | 4,013,822 trainable backbone parameters; 42,023 dense classification head parameters |
| **Network Input Tensor** | **224 × 224 × 3** | Bilinear RGB interpolation; floating-point range $[0.0, 255.0]$ with internal z-score normalization |
| **Explainability Target Layer** | `top_activation` | Final spatial convolutional tensor ($7 \times 7 \times 1280$) before global pooling |
| **Quality Gate Latency (CPU)** | **~24 ms** | Scale-invariant Laplacian blur variance ($\ge 12.0$) and luminance range ($[30, 235]$) |
| **Inference Forward Pass (CPU)** | **~210 ms** | 5-class categorical forward pass via TensorFlow 2.x C++ runtime |
| **Grad-CAM Attribution (CPU)** | **~165 ms** | Pre-softmax gradient backpropagation and bilinear heatmap interpolation |
| **Total Round-Trip Latency** | **~480 ms / eye** | End-to-end processing per fundus image (Quality Gate + Model + Grad-CAM + Evidence) |
| **Referable DR Threshold ($\tau$)** | **0.20798** | Tail-sum probability threshold: $P(\text{Referable}) = p_2 + p_3 + p_4 \ge \tau$ |
| **Sensitivity Clinical Target** | **$\ge 93.0\%$** | Target standard for detecting referable diabetic retinopathy in population screening |
| **Specificity Clinical Target** | **$\ge 87.5\%$** | Target standard for correctly ruling out non-referable cases to prevent clinic overload |
| **Held-Out Verification Cohort** | **$N = 15$ images** | Stratified split from APTOS 2019 evaluated under identical runtime conditions |
| **Core Training Dataset** | **3,662 images** | APTOS 2019 Blindness Detection dataset (Aravind Eye Hospital cohort) |

---

## Six Specialized AI Models

Vision AI is structured around **six specialized AI models**, each addressing a distinct diagnostic responsibility modeled after the clinical examination protocol of a vitreoretinal specialist:

```text
1. EfficientNet-B2       ──► Image Quality Assessment (Focus, Illumination, Media Opacity)
2. U-Net++              ──► Retinal Vessel Segmentation (Microvasculature & Caliber)
3. U-Net++ + Heatmap    ──► Optic Disc & Fovea Localization (Anatomical Landmarks & CSME Reference)
4. DeepLabV3+           ──► Lesion Segmentation (Microaneurysms, Hemorrhages, Exudates)
5. ResNet-101 Multi-Task──► DR Severity Grading (ICDR 0–4 & Focal Lesion Densities)
6. Grad-CAM++           ──► Explainability & Trust (Visual Saliency & Uncertainty Bounds)
```

---

### 1. EfficientNet-B2 — Image Quality Assessment
- **Clinical Responsibility:** Evaluates retinal fundus image quality and supports image quality assessment and enhancement.
- **Diagnostic Role:** Assesses incoming fundus photographs at point-of-care to identify images requiring rejection or enhancement due to defocus blur, uneven illumination, optical glare washout, or cataractous media opacity.
- **Input & Output:**
  - *Input:* $H \times W \times 3$ RGB fundus photograph.
  - *Output:* Gradability probability $P(\text{Gradable}) \in [0, 1]$, defect vector $[d_{\text{blur}}, d_{\text{dark}}, d_{\text{glare}}, d_{\text{cataract}}]$, and actionable feedback (`PROCEED` vs. `RECAPTURE_REQUIRED`).
- **Implementation Mapping:**
  - *Production Service:* Implemented as a deterministic image quality gate in [`inference_service/quality_gate.py`](inference_service/quality_gate.py) (`evaluate_image_quality`), evaluating scale-invariant Laplacian blur variance ($\ge 12.0$), mean foreground illumination ($[30, 235]$), and aspect ratio ($\le 2.5$). PIL contrast ($1.5\times$) and color ($1.2\times$) enhancement previews are generated in [`inference_service/evidence_generator.py`](inference_service/evidence_generator.py).
  - *Simulation Model:* Abstract discrete-event queuing block in [`matlab/simulink/blocks/simulinkQualityAssessment.m`](matlab/simulink/blocks/simulinkQualityAssessment.m).

---

### 2. U-Net++ — Retinal Vessel Segmentation
- **Purpose:** Segments retinal blood vessels to support retinal structural analysis.
- **Diagnostic Role:** Delineates retinal microvasculature (arterioles, venules, and capillary networks) to quantify morphological biomarkers, including vascular caliber ratios, vessel tortuosity indices, and arteriolar-to-venular ratio (AVR), which correlate with vascular compromise and hypertensive changes.
- **Input & Output:**
  - *Input:* Green-channel contrast-enhanced fundus image ($512 \times 512 \times 3$).
  - *Output:* Dense binary and multi-scale probability vessel mask ($512 \times 512 \times 1$).
- **Implementation Mapping:**
  - *Production Service:* Operational green-channel inverted spatial high-pass filter (`highpass = inv_g - gaussian_filter(inv_g, sigma=15)`) thresholded at the 92nd percentile in [`inference_service/evidence_generator.py`](inference_service/evidence_generator.py) generates visual vessel masks displayed in the review portals.
  - *Simulation Model:* Modeled as computational delay in [`matlab/simulink/blocks/simulinkSegmentation.m`](matlab/simulink/blocks/simulinkSegmentation.m).

---

### 3. U-Net++ + Heatmap CNN — Optic Disc & Fovea Localization
- **Purpose:** Identifies and localizes key retinal anatomical structures for further analysis.
- **Diagnostic Role:** Regresses sub-pixel coordinates for the optic nerve head (optic disc margin) and foveal avascular zone (FAZ center). This establishes a standardized anatomical coordinate system across the retina, enabling quadrant referencing and geometric distance measurement for Clinically Significant Macular Edema (CSME) identification.
- **Input & Output:**
  - *Input:* RGB fundus image ($512 \times 512 \times 3$).
  - *Output:* Optic disc boundary contour, sub-pixel $(x, y)$ coordinates for the foveal pit, and radial distance contours.
- **Implementation Mapping:**
  - *Production Service:* Operational spatial intensity extrema filter in [`inference_service/evidence_generator.py`](inference_service/evidence_generator.py) extracts landmark locations (optic disc marked in yellow, $r=30\text{px}$; fovea marked in cyan, $r=15\text{px}$) rendered as interactive visual overlays.
  - *Simulation Model:* Simulated within [`matlab/simulink/blocks/simulinkSegmentation.m`](matlab/simulink/blocks/simulinkSegmentation.m).

---

### 4. DeepLabV3+ (ResNet-50) — Lesion Segmentation
- **Purpose:** Identifies and segments diabetic retinopathy-related lesions, including microaneurysms, hemorrhages, and exudates.
- **Diagnostic Role:** Performs fine-grained semantic segmentation across individual pathological lesion types:
  1. *Microaneurysms (MAs):* Focal capillary dilations indicating early microvascular breakdown.
  2. *Intraretinal Hemorrhages:* Dot, blot, and flame hemorrhages indicating vascular leakage.
  3. *Hard Exudates:* Lipid and lipoprotein deposits accumulating in the outer plexiform layer.
  4. *Soft Exudates (Cotton Wool Spots):* Axoplasmic flow blockages indicating localized retinal ischemia.
- **Input & Output:**
  - *Input:* RGB fundus image ($512 \times 512 \times 3$).
  - *Output:* 4-channel lesion probability tensor ($512 \times 512 \times 4$) with per-pixel lesion classifications.
- **Implementation Mapping:**
  - *Production Service:* Operational high-pass edge colorization filter in [`inference_service/evidence_generator.py`](inference_service/evidence_generator.py) produces red lesion overlays blended at 50% opacity for clinical inspection.
  - *Simulation Model:* Simulated within [`matlab/simulink/blocks/simulinkSegmentation.m`](matlab/simulink/blocks/simulinkSegmentation.m).

---

### 5. ResNet-101 Multi-Task — DR Severity Grading
- **Purpose:** Performs five-level diabetic retinopathy grading:
  - **Level 0: No DR** — No microvascular abnormalities detected.
  - **Level 1: Mild NPDR** — Microaneurysms only.
  - **Level 2: Moderate NPDR** — More than microaneurysms, but less than severe NPDR.
  - **Level 3: Severe NPDR** — >20 intraretinal hemorrhages in 4 quadrants, definite venous beading in 2+ quadrants, or IRMA in 1+ quadrant (4-2-1 rule).
  - **Level 4: Proliferative DR (PDR)** — Neovascularization or vitreous/preretinal hemorrhage.
- **Diagnostic Role:** Integrates structural and lesion context to predict the overall International Clinical Diabetic Retinopathy (ICDR) severity category alongside auxiliary focal lesion count estimates and referable DR risk.
- **Input & Output:**
  - *Input:* $224 \times 224 \times 3$ preprocessed fundus tensor.
  - *Output:* 5-class probability distribution $\mathbf{p} = [p_0, p_1, p_2, p_3, p_4]$, predicted class index ($0$ to $4$), and referable boolean ($p_2+p_3+p_4 \ge 0.20798$).
- **Implementation Mapping:**
  - *Production Service:* Deployed via the fine-tuned 240-layer functional classifier [`model/production/V2/DR_EfficientNetB0_V2.keras`](model/production/V2/DR_EfficientNetB0_V2.keras) in [`inference_service/main.py`](inference_service/main.py) (`PythonV2Provider.predict_eye`).
  - *MATLAB Reference:* [`model/reference/DR_EfficientNetB0_V2.mat`](model/reference/DR_EfficientNetB0_V2.mat) executed in [`matlab/inference/predictDR.m`](matlab/inference/predictDR.m).

---

### 6. Grad-CAM++ + Calibration/Uncertainty — Explainability & Trust
- **Purpose:** Provides visual explanations, confidence assessment, and uncertainty-aware interpretation to support clinical review.
- **Diagnostic Role:** Computes second-order pixel-weighted gradient attribution maps highlighting the spatial retinal regions driving the predicted severity grade, coupled with post-hoc probability calibration and epistemic uncertainty quantification to alert physicians when model confidence is low.
- **Input & Output:**
  - *Input:* Model convolutional feature activations and pre-softmax logits.
  - *Output:* Normalized visual heatmap ($224 \times 224$), confidence score $\max(\mathbf{p})$, and boolean low-confidence flag ($\max(\mathbf{p}) < 0.50$).
- **Implementation Mapping:**
  - *Production Service:* Pre-softmax Logits Grad-CAM on layer `top_activation` ($7 \times 7 \times 1280$) in [`inference_service/main.py`](inference_service/main.py) (`_compute_gradcam`), rendered in Jet colormap with up to 60% activation-proportional opacity.
  - *MATLAB Reference:* [`matlab/explainability/generateGradCAM.m`](matlab/explainability/generateGradCAM.m) targeting `efficientnet-b0|model|head|MulLayer`.

---

## AI Pipeline Architecture

### Six-Stage Pipeline Flow

The end-to-end clinical workflow organizes the six specialized AI models into a sequential decision-support pipeline from initial fundus image capture to final ophthalmologist review and signed report delivery:

```mermaid
flowchart LR
    IN["<b>Fundus Image Input</b><br/><i>Bilateral RGB Capture</i>"]
    
    subgraph S1 ["Stage 1"]
        M1["<b>Image Quality Assessment</b><br/><i>EfficientNet-B2</i>"]
    end

    subgraph S2 ["Stage 2"]
        M2["<b>Vessel Segmentation</b><br/><i>U-Net++</i>"]
    end

    subgraph S3 ["Stage 3"]
        M3["<b>Optic Disc & Fovea Localization</b><br/><i>U-Net++ + Heatmap CNN</i>"]
    end

    subgraph S4 ["Stage 4"]
        M4["<b>Lesion Segmentation</b><br/><i>DeepLabV3+ (ResNet-50)</i>"]
    end

    subgraph S5 ["Stage 5"]
        M5["<b>DR Severity Grading</b><br/><i>ResNet-101 Multi-Task</i>"]
    end

    subgraph S6 ["Stage 6"]
        M6["<b>Explainability & Confidence</b><br/><i>Grad-CAM++ + Calibration</i>"]
    end

    subgraph CLINICAL ["Clinical Review & Delivery"]
        DOC["<b>Doctor Review</b><br/><i>Tele-Ophthalmology Queue</i>"]
        REP["<b>Clinical Report</b><br/><i>Bilingual Signed PDF</i>"]
    end

    IN --> M1
    M1 -->|Gradable Image| M2
    M1 -->|Gradable Image| M3
    M2 --> M4
    M3 --> M4
    M4 --> M5
    M5 --> M6
    M6 --> DOC
    DOC --> REP

    classDef input fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef stage fill:#f5efff,stroke:#7c3aed,stroke-width:2px,color:#2e1065;
    classDef clinical fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b;

    class IN input;
    class M1,M2,M3,M4,M5,M6 stage;
    class DOC,REP clinical;
```

---

### Decoupled Multi-Tier System Topology

The platform executes across four containerized services orchestrated via Docker Compose:

```mermaid
flowchart TD
    subgraph UI ["Client Tier (React 18 + Vite + TailwindCSS)"]
        STAFF["<b>Staff Screening Portal</b><br/><i>Intake, bilateral camera capture, quality alert feedback</i>"]
        DOCTOR["<b>Doctor Review Portal</b><br/><i>Tele-review queue, Grad-CAM opacity toggle, diagnostic sign-off</i>"]
        PATIENT["<b>Patient Portal</b><br/><i>Direct PDF download, referral tracking, verification QR view</i>"]
    end

    subgraph GATEWAY ["Application Gateway (Node.js 20 + Express 5)"]
        AUTH["<b>Auth & RBAC Guard</b><br/><i>STAFF, DOCTOR, PATIENT, ADMIN session cookies</i>"]
        ROUTER["<b>REST API Gateway</b><br/><i>/api/screenings, /api/patients, /api/reviews</i>"]
        PDF_ENG["<b>PDFKit Report Engine</b><br/><i>Bilingual referral generator with digital signature & QR</i>"]
        AUTH --> ROUTER
        ROUTER --> PDF_ENG
    end

    subgraph AI_SVC ["Inference Tier (Python 3.11 + FastAPI + TensorFlow 2.x)"]
        FASTAPI["<b>FastAPI REST Gateway</b><br/><i>Port 8000: POST /analyze, POST /quality-check</i>"]
        QG["<b>Image Quality Gate</b><br/><i>Scale-invariant Laplacian variance & luminance check</i>"]
        MODEL["<b>Deep Learning Engine</b><br/><i>Fine-tuned functional graph (240 layers)</i>"]
        XAI["<b>Logits Grad-CAM</b><br/><i>Pre-softmax gradient attribution on layer top_activation</i>"]
        FASTAPI --> QG
        QG --> MODEL
        MODEL --> XAI
    end

    subgraph DATA ["Persistence Tier (PostgreSQL 16 + Local Volumes)"]
        DB[("<b>PostgreSQL Database</b><br/><i>Prisma ORM: Patients, Screenings, Reviews, AuditLogs</i>")]
        UPLOADS["<b>Image Storage Volume</b><br/><i>Mounted persistent storage (/app/uploads)</i>"]
        REPORTS["<b>Report Storage Volume</b><br/><i>Mounted persistent storage (/app/reports)</i>"]
    end

    STAFF --> AUTH
    DOCTOR --> AUTH
    PATIENT --> AUTH

    ROUTER -->|Multipart Image Stream| FASTAPI
    FASTAPI -->|Probabilities, Heatmaps, Evidence| ROUTER

    ROUTER -->|SQL Queries via Prisma| DB
    ROUTER -->|Persist Raw Fundus Files| UPLOADS
    PDF_ENG -->|Write Signed PDF Referrals| REPORTS

    DOCTOR -.->|Inspect Raw Fundus & Overlays| UPLOADS
    PATIENT -.->|Download Signed PDF Referral| REPORTS

    classDef uiBox fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef gwBox fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b;
    classDef aiBox fill:#f5efff,stroke:#7c3aed,stroke-width:2px,color:#2e1065;
    classDef dbBox fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#7c2d12;

    class STAFF,DOCTOR,PATIENT uiBox;
    class AUTH,ROUTER,PDF_ENG gwBox;
    class FASTAPI,QG,MODEL,XAI aiBox;
    class DB,UPLOADS,REPORTS dbBox;
```

---

## Explainable AI

### Logits Grad-CAM Formulation
Vision AI implements gradient-weighted Class Activation Mapping (Grad-CAM) to provide transparent visual evidence to the reviewing ophthalmologist.

Let $A^k \in \mathbb{R}^{U \times V}$ denote the $k$-th feature activation map of target convolutional layer `top_activation` ($U = 7, V = 7, K = 1280$). The importance weight $\alpha_k^c$ for class $c$ is computed by global average pooling over spatial dimensions:

$$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^{U} \sum_{j=1}^{V} \frac{\partial z_c}{\partial A_{i,j}^k}, \quad Z = U \times V = 49$$

The visual localization map $L_{\text{Grad-CAM}}^c \in \mathbb{R}^{U \times V}$ is calculated as a rectified linear combination of feature maps, isolating features that positively support the target class:

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_{k=1}^{K} \alpha_k^c A^k\right)$$

$L_{\text{Grad-CAM}}^c$ is normalized to $[0, 1]$, upsampled via bilinear interpolation to $224 \times 224$, mapped through the Jet colormap, and blended with the original fundus image using activation-proportional alpha opacity (up to 60%).

### Softmax Saturation Mitigation
Standard Grad-CAM computes gradients with respect to post-softmax probabilities $y_c$. When a convolutional neural network predicts high-confidence classifications ($y_c \to 1.0$), the derivative of the softmax function approaches zero:

$$\frac{\partial y_c}{\partial z_c} = y_c (1 - y_c) \to 0$$

This **softmax saturation** causes vanishing gradients, producing degraded or flat heatmaps regardless of underlying feature importance. Vision AI solves this by computing gradient attribution directly with respect to the **pre-softmax logit** $z_c$ of dense layer `dr_classifier`.

### Confidence Assessment & Epistemic Uncertainty
To enhance clinical safety, Vision AI evaluates categorical confidence:

$$\text{Confidence} = \max_{c \in \{0..4\}} P(y = c \mid \mathbf{x})$$

- If $\text{Confidence} < 0.50$, the system flags `isLowConfidence = true`, alerting the reviewing doctor that the prediction exhibits high categorical ambiguity.
- Research into temperature scaling for Expected Calibration Error (ECE) minimization and Monte Carlo Dropout for epistemic variance estimation forms the ongoing explainability roadmap.

---

## Bilateral Screening: Left Eye and Right Eye

Retinal microvascular compromise develops asymmetrically. A patient may present with mild non-proliferative changes in one eye while the contralateral eye exhibits proliferative retinopathy requiring immediate laser photocoagulation. Vision AI enforces concurrent, independent bilateral processing.

### Dual-Channel Bilateral Workflow

```mermaid
flowchart TD
    subgraph INGEST ["Bilateral Ingestion"]
        OS["Left Eye (OS) Image"]
        OD["Right Eye (OD) Image"]
    end

    subgraph QG ["Independent Quality Gates"]
        QG_OS{"OS Quality Check<br/>Blur, Illumination, Framing"}
        QG_OD{"OD Quality Check<br/>Blur, Illumination, Framing"}
        RECAP_OS["OS Recapture Alert (422)"]
        RECAP_OD["OD Recapture Alert (422)"]
    end

    subgraph INFER ["Independent AI Inference"]
        MODEL_OS["OS Classifier<br/>5-Class Probabilities"]
        MODEL_OD["OD Classifier<br/>5-Class Probabilities"]
        CAM_OS["OS Grad-CAM Heatmap"]
        CAM_OD["OD Grad-CAM Heatmap"]
    end

    subgraph GOVERN ["Patient-Level Governance"]
        TRIAGE["Worst-Eye Triage Rule<br/>Urgency = max(Grade_OS, Grade_OD)<br/>isReferable = max(P_OS, P_OD) ≥ 0.20798"]
        DOC["Ophthalmologist Verification Queue"]
    end

    OS --> QG_OS
    OD --> QG_OD

    QG_OS -->|FAIL| RECAP_OS
    QG_OD -->|FAIL| RECAP_OD

    QG_OS -->|PASS| MODEL_OS
    QG_OD -->|PASS| MODEL_OD

    MODEL_OS --> CAM_OS
    MODEL_OD --> CAM_OD

    MODEL_OS --> TRIAGE
    MODEL_OD --> TRIAGE
    CAM_OS --> TRIAGE
    CAM_OD --> TRIAGE

    TRIAGE --> DOC

    classDef input fill:#eff6ff,stroke:#2563eb,stroke-width:2px;
    classDef gate fill:#ecfdf5,stroke:#059669,stroke-width:2px;
    classDef fail fill:#fef2f2,stroke:#dc2626,stroke-width:2px;
    classDef infer fill:#f5efff,stroke:#7c3aed,stroke-width:2px;
    classDef gov fill:#fff7ed,stroke:#ea580c,stroke-width:2px;

    class OS,OD input;
    class QG_OS,QG_OD gate;
    class RECAP_OS,RECAP_OD fail;
    class MODEL_OS,MODEL_OD,CAM_OS,CAM_OD infer;
    class TRIAGE,DOC gov;
```

### Patient-Level Worst-Eye Governance
The clinical triage priority for the patient is determined by the maximum severity observed across either eye:

$$\hat{y}_{\text{Patient}} = \max\left(\hat{y}_{\text{OS}}, \, \hat{y}_{\text{OD}}\right)$$

$$P(\text{Referable})_{\text{Patient}} = \max\left(P(\text{Referable})_{\text{OS}}, \, P(\text{Referable})_{\text{OD}}\right)$$

### Referable DR Tail-Sum Decision Rule
Under ICDR guidelines, cases presenting with Moderate NPDR or worse ($c \ge 2$) require specialist intervention. Vision AI calculates the cumulative tail probability:

$$P(\text{Referable} \mid \mathbf{x}) = \sum_{c=2}^{4} P(y = c \mid \mathbf{x}) = p_2 + p_3 + p_4$$

$$\text{Decision}(\mathbf{x}) = \begin{cases} \text{Referable DR (Urgent Specialist Review)}, & P(\text{Referable}) \ge 0.20798 \\ \text{Non-Referable DR (Routine 12-mo Review)}, & P(\text{Referable}) < 0.20798 \end{cases}$$

---

## Clinical Workflow & Doctor-in-the-Loop

### Rural & Low-Connectivity Screening Goals
Vision AI is engineered specifically for deployment across rural Primary Health Centres (PHCs), sub-centres, and mobile vision vans where specialist care is absent and network connectivity is intermittent:
- **Low-Bandwidth Optimized:** Images undergo point-of-care quality validation and client-side pre-flight checks, minimizing wasted cellular bandwidth on ungradable recaptures.
- **Asynchronous Tele-Ophthalmology:** Health workers capture bilateral photographs offline or over rural cellular networks; screening records automatically queue for remote specialist review when connectivity is restored.
- **Privacy First (DPDP Act 2023):** Raw 12-digit Aadhaar UID numbers and biometric data are never ingested or stored. Records utilize opaque random identifiers (`patientId`) and masked display references (`XXXX XXXX 1234`).

### Doctor Review Queue & Override Authority
Vision AI strictly enforces a **Doctor-in-the-Loop policy**. AI outputs are preliminary triage aids; certified ophthalmologists retain sole diagnostic authority:
1. Every completed screening enters the **Doctor Review Queue** with side-by-side bilateral inspection.
2. The specialist inspects raw fundus images alongside interactive Grad-CAM attention heatmaps (with an opacity slider from 0% to 100%) and multi-modal anatomical evidence maps.
3. The specialist can confirm the AI recommendation or override the grade, recording mandatory clinical findings and follow-up directives.

### Bilingual Clinical Referral Reports
Following specialist sign-off, the backend generates an official, tamper-evident bilingual PDF referral report via PDFKit:
- **Bilingual Guidance:** Formatted in English and Hindi to ensure accessibility for rural patients and primary health workers.
- **Bilateral Findings:** Contains side-by-side fundus captures, assigned severity grades, and embedded Grad-CAM overlays.
- **Specialist Digital Signature:** Displays the reviewing physician's name, medical council registration number, and digital signature timestamp.
- **Anti-Tampering QR Code:** Embeds a cryptographically verifiable URL linking directly to the authentic patient record.

---

## Technology Stack

### Runtime & Infrastructure Stack

| Layer | Technology | Version | Purpose in Vision AI |
|---|---|:---:|---|
| **Deep Learning Runtime** | **TensorFlow / Keras** | `2.x` | Functional graph execution (`DR_EfficientNetB0_V2.keras`), Logits Grad-CAM |
| **Inference Microservice** | **FastAPI & Uvicorn** | `0.110+` | Async REST inference gateway (`POST /analyze`, `POST /quality-check`, Port 8000) |
| **Quality & Evidence CV** | **NumPy / SciPy / PIL** | `3.11` | Scale-invariant Laplacian blur variance, luminance filtering, evidence previews |
| **Application Gateway** | **Node.js & Express** | `20 LTS / 5.x` | Session authentication, RBAC guards, multipart stream proxy, PDF generation |
| **Relational Database** | **PostgreSQL & Prisma** | `16 / 5.x` | Normalized schema for patients, bilateral screenings, reviews, and audit logs |
| **Clinical Frontend** | **React & Vite** | `18 / 5.x` | Responsive tele-ophthalmology portal styled with TailwindCSS and Lucide-React |
| **Clinical Reporting** | **PDFKit & QRCode** | `0.15+` | Tamper-evident bilingual referral PDF generation with specialist digital signature |
| **Containerization** | **Docker & Docker Compose** | `24+ / 2.20+` | Multi-container edge orchestration on an isolated bridge network |

### MathWorks Engineering Ecosystem

Vision AI incorporates a dedicated MATLAB and Simulink research workspace utilized for offline algorithm development, network translation, and healthcare capacity modeling:

- **MATLAB R2023b:** Core numerical and algorithmic workspace for signal and matrix processing.
- **Deep Learning Toolbox:** Network architecture inspection, layer mapping, and reference `dlnetwork` inference execution ([`matlab/inference/predictDR.m`](matlab/inference/predictDR.m)).
- **Image Processing Toolbox:** Color-space transformations, contrast-limited adaptive histogram equalization (CLAHE), and fundus preprocessing ([`matlab/algorithms/preprocessing/preprocessFundus.m`](matlab/algorithms/preprocessing/preprocessFundus.m)).
- **Computer Vision Toolbox:** Feature point extraction, edge detection, and morphological landmark processing.
- **Medical Imaging Toolbox:** Specialized DICOM / NIfTI inspection, medical pixel calibration, and clinical visualization standards.
- **Simulink:** Discrete-event capacity simulations ([`matlab/simulink/DRScreeningSystem.slx`](matlab/simulink/DRScreeningSystem.slx), [`DRDistrictSystem.slx`](matlab/simulink/DRDistrictSystem.slx)) evaluating rural patient arrival queues, tele-review latencies, and specialist workloads.

---

## MATLAB and Simulink

Vision AI maintains an intentional separation between the live production container stack and the offline MATLAB/Simulink research workspace:

```text
Production Deployed Runtime (Docker)            Offline Research & Capacity Simulation
┌──────────────────────────────────────┐        ┌─────────────────────────────────────┐
│ React Frontend (Port 3000)           │        │ matlab/algorithms/                  │
│ Node.js / Express API (Port 8080)    │        │   (preprocessFundus.m)              │
│ FastAPI Inference Engine (Port 8000) │        │ matlab/inference/                   │
│   DR_EfficientNetB0_V2.keras         │        │   (predictDR.m, loadDRModel.m)      │
│ PostgreSQL 16 Database (Port 5432)   │        │ matlab/explainability/              │
│   (Prisma Relational Schema)         │        │   (generateGradCAM.m)               │
│                                      │        │ matlab/simulink/                    │
│                                      │        │   (DRScreeningSystem.slx)           │
└──────────────────────────────────────┘        └─────────────────────────────────────┘
```

### Discrete-Event Healthcare Capacity Modeling
The Simulink models ([`matlab/simulink/DRScreeningSystem.slx`](matlab/simulink/DRScreeningSystem.slx) and [`DRDistrictSystem.slx`](matlab/simulink/DRDistrictSystem.slx)) simulate the operational dynamics of district-wide tele-ophthalmology screening using 17 custom blocks (`sim_PatientArrival.m`, `sim_DoctorQueue.m`, `sim_AIResource.m`, `simulinkSegmentation.m`, `simulinkQualityAssessment.m`):
- **Queue Dynamics:** Simulates rural patient arrival distributions across multiple Primary Health Centres.
- **Compute Latency Simulation:** Models server-side processing delays (3–6 s per bilateral image pair) to evaluate cloud and edge GPU sizing.
- **Tele-Ophthalmologist Workload:** Quantifies specialist review queue backlogs, response times, and burnout thresholds under high patient volumes.

### Algorithm Development & Cross-Platform Parity
- **Reference Model Checkpoint:** [`model/reference/DR_EfficientNetB0_V2.mat`](model/reference/DR_EfficientNetB0_V2.mat) contains the reference MATLAB `dlnetwork` matching the production Keras architecture.
- **Mathematical Parity Protocol:** The layer-by-layer translation protocol between MATLAB's Deep Learning Toolbox and Keras is documented in [`docs/research/matlab-keras-parity.md`](docs/research/matlab-keras-parity.md).

---

## Datasets and Evaluation

### Public Retinal Datasets

| Dataset | Origin & Primary Source | Images | Annotation Resolution | Role in Project |
|---|---|:---:|:---:|---|
| **APTOS 2019** | Aravind Eye Hospital, India | 3,662 | 5 Classes (ICDR 0–4) | Primary fine-tuning and verification split |
| **EyePACS** | California Telehealth Network | 35,126 | 5 Classes (ICDR 0–4) | Large-scale clinical feature extraction reference |
| **Messidor-2** | University of Brest, France | 1,748 | 5 Classes (ICDR 0–4) | Planned multi-center external validation split |
| **IDRiD** | Indian Diabetic Retinopathy DB | 516 | 5 Classes + Lesion Masks | Benchmark for Indian demographics & lesion segmentation |
| **DRIVE** | Utrecht University Hospital | 40 | Pixel Vessel Masks | Benchmark for retinal microvasculature segmentation |

### Clinical Target Standards vs. Empirical Verification

To ensure clinical safety and academic integrity, Vision AI distinguishes between its **clinical engineering targets** and empirical metrics measured on its held-out verification split:

| Metric | Measured Verification Result ($N = 15$) | 95% Wilson Score CI | Clinical Engineering Target |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **22.2%** (2/9) | [6.3%, 54.7%] | **$\ge 93.0\%$ (Target Standard)** |
| **Specificity** | **50.0%** (3/6) | [18.8%, 81.2%] | **$\ge 87.5\%$ (Target Standard)** |
| **Precision (PPV)** | **40.0%** (2/5) | [11.8%, 76.9%] | High positive yield |
| **Negative Predictive Value (NPV)** | **30.0%** (3/10) | [10.8%, 60.3%] | High rule-out safety |
| **Overall Accuracy** | **33.3%** (5/15) | [15.2%, 58.3%] | High diagnostic accuracy |
| **Binary F1-Score** | **0.2857** | — | **$\ge 0.88$ (Target Standard)** |

> [!IMPORTANT]
> **Performance Benchmark Disclaimer:** The **$\ge 93.0\%$ sensitivity** and **$\ge 87.5\%$ specificity** metrics represent **active clinical engineering targets** defined by international screening guidelines, not claimed experimental results on the verification cohort.

### Contingency Matrix & Clinical Governance

The deployed model (`DR_EfficientNetB0_V2.keras`) was evaluated on the held-out verification split recorded in [`evaluation/reports/evaluation_report.md`](evaluation/reports/evaluation_report.md) using [`evaluation/scripts/evaluate_referable_dr.py`](evaluation/scripts/evaluate_referable_dr.py):

```text
                      PREDICTED NON-REF        PREDICTED REFERABLE
ACTUAL NON-REF (0-1)  [  TN = 3 (20.0%)  ]     [  FP = 3 (20.0%)  ]   Total: 6
ACTUAL REFERABLE (2-4)[  FN = 7 (46.7%)  ]     [  TP = 2 (13.3%)  ]   Total: 9
                      Total: 10                Total: 5               Total: 15
```

**Clinical Safety Rationale:** On this challenge verification cohort, the model yielded 7 False Negatives (cases with actual Moderate+ DR under-called by model probabilities). This empirical finding demonstrates why **Vision AI strictly enforces a Doctor-in-the-Loop policy**. Autonomous deployment under these conditions would pose severe patient safety risks; the system is strictly engineered as an assistive triage aid where certified ophthalmologists retain sole diagnostic authority.

---

## Repository Structure

```text
DR-Screening-System/
├── README.md                           # Main engineering & clinical documentation
├── LICENSE                             # MIT Open-Source License
├── SECURITY.md                         # Security policy, vulnerability reporting, and DPDP Act compliance
├── CONTRIBUTING.md                     # Contributor guidelines and Git workflow
├── CODE_OF_CONDUCT.md                  # Contributor Covenant Code of Conduct
├── docker-compose.yml                  # 4-tier container orchestration configuration
├── .env.example                        # Template environment variables
├── backend/                            # Application Gateway & Authentication Tier
│   ├── src/
│   │   ├── app.ts                      # Express app setup and middleware registration
│   │   ├── server.ts                   # HTTP listener startup (Port 8080)
│   │   ├── modules/                    # Feature modules (auth, screening, doctor, admin)
│   │   ├── middleware/                 # Auth, rate limiting, and validation middleware
│   │   ├── providers/                  # Inference proxy and PDF report generator
│   │   └── utils/                      # Storage and formatting utilities
│   ├── prisma/
│   │   └── schema.prisma               # PostgreSQL relational schema definition
│   └── Dockerfile                      # Production container build for backend gateway
├── frontend/                           # Clinical Web Application Tier
│   ├── src/
│   │   ├── pages/                      # Intake, Screening, Doctor Review, Admin dashboards
│   │   ├── components/                 # Bilateral viewer, Grad-CAM opacity slider, modals
│   │   └── App.tsx                     # Top-level routing and state management
│   ├── nginx.conf                      # Production SPA web server configuration
│   └── Dockerfile                      # Multi-stage static build container
├── inference_service/                  # Python Deep Learning Inference Microservice
│   ├── main.py                         # FastAPI microservice with Logits Grad-CAM logic
│   ├── quality_gate.py                 # Deterministic scale-invariant quality assessment
│   ├── evidence_generator.py           # Retinal evidence filter algorithms (vessels, disc, lesions)
│   └── Dockerfile                      # Python 3.11 + TensorFlow CPU inference container
├── model/                              # Machine Learning Model Artifacts
│   ├── production/V2/                  # Deployed Keras classifier (DR_EfficientNetB0_V2.keras)
│   ├── reference/                      # MATLAB reference weights (DR_EfficientNetB0_V2.mat)
│   ├── config/model_config.json        # Preprocessing, normalization, and layer metadata
│   ├── training/                       # Python model training documentation and configs
│   └── evaluation/                     # Standalone model evaluation scripts
├── evaluation/                         # Independent Research Evaluation Suite
│   ├── scripts/evaluate_referable_dr.py # Reproducible referable-DR benchmark runner
│   ├── tests/test_evaluation_pipeline.py # Unit tests for confusion matrix and metrics
│   └── reports/evaluation_report.md    # Verified empirical evaluation audit report
├── matlab/                             # MATLAB Algorithms & Simulink Simulations
│   ├── algorithms/                     # Reference preprocessing (preprocessFundus.m)
│   ├── simulink/                       # Discrete-event capacity models (DRScreeningSystem.slx)
│   ├── inference/                      # Reference MATLAB inference scripts (predictDR.m)
│   ├── explainability/                 # Reference Grad-CAM implementation (generateGradCAM.m)
│   ├── training/                       # Contributor training starter templates (train_dr_model.m)
│   └── datasets/                       # Retinal dataset manifests and documentation
├── docs/                               # Technical & Governance Documentation
│   ├── architecture/                   # Deployed system, AI pipeline, data flow, deployment
│   ├── research/                       # Datasets, evaluation protocol, MATLAB parity
│   ├── images/                         # Architectural diagrams, screenshots, and logos
│   ├── clinical-safety.md              # Medical device boundaries and safety protocols
│   ├── privacy-security.md             # DPDP Act 2023 and Aadhaar masking compliance
│   └── limitations.md                  # Comprehensive boundary and limitation disclosures
├── scripts/                            # Operational Scripts & Test Runners
│   ├── run_all_tests.sh                # Unified test runner across all tiers (27 tests)
│   └── verify_environment.py           # Host dependency and model integrity checker
└── tests/                              # Automated Multi-Tier Test Suite
    ├── unit/                           # Quality gate & evidence generator unit tests
    ├── integration/                    # FastAPI HTTP contract integration tests
    └── security/                       # Path traversal, Aadhaar masking, and auth tests
```

---

## Installation and Execution

### Prerequisites & Environment Configuration
- **Docker Engine 24.0+** and **Docker Compose 2.20+**
- **Node.js 20 LTS** and **Python 3.11** *(optional for development outside Docker)*

Configure environment variables by copying `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Backend API URL for frontend client |
| `PORT` | `8080` | Express application gateway port |
| `NODE_ENV` | `development` | Node.js runtime environment |
| `SESSION_SECRET` | `replace_me_with_a_secure_minimum_32_character_secret` | Express session signing key |
| `INFERENCE_SERVICE_URL` | `http://inference:8000` | Internal FastAPI service address |
| `DATABASE_URL` | `postgresql://visionai:visionai_dev@database:5432/visionai_auth` | PostgreSQL connection string |
| `STORAGE_BASE_PATH` | `/app/uploads` | Persistent directory for uploads and PDF reports |
| `PRESENTATION_DEMO_MODE` | `false` | When `false`, executes real AI model. When `true`, overrides inference with mock data for UI demo. |

---

### Docker Compose Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/SudarshanSingh1/DR-Screening-System.git
cd DR-Screening-System

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch all 4 services
docker compose up --build
```

#### Service Endpoints

| Service / Portal | Access URL | Port | Health Check |
|---|---|:---:|---|
| **Clinical Web App** | `http://localhost:3000` | 3000 | Frontend portal (Staff, Doctor, Patient) |
| **Backend API Gateway** | `http://localhost:8080` | 8080 | `GET http://localhost:8080/api/health` |
| **AI Inference Microservice** | `http://localhost:8000` | 8000 | `GET http://localhost:8000/health` |
| **PostgreSQL 16 Database** | `localhost:5432` | 5432 | `pg_isready -h localhost -p 5432` |

---

### Automated Multi-Tier Test Suite

Vision AI includes an automated test harness covering all software layers:

```bash
# Execute the complete automated test suite (27 tests across 6 phases):
bash scripts/run_all_tests.sh
```

- **Phase 1: Backend Node.js Tests** (2 unit tests verifying storage path safety and key resolution)
- **Phase 2: Python Unit Tests** (11 unit tests in `tests/unit/` verifying quality gate filters and evidence generators)
- **Phase 3: FastAPI Integration Tests** (3 integration tests in `tests/integration/` validating `/health`, `/quality-check`, and `/analyze`)
- **Phase 4: Security & Privacy Tests** (4 tests in `tests/security/` verifying path traversal guards and Aadhaar redaction)
- **Phase 5: Evaluation Pipeline Tests** (3 tests in `evaluation/tests/` verifying confusion matrix math and Wilson score intervals)
- **Phase 6: Reproducible Referable-DR Benchmark** (`evaluation/scripts/evaluate_referable_dr.py` evaluating the deployed model)

---

### SIH Presentation Test Accounts

| Role | Account Name | Email | Password |
|---|---|---|---|
| **Screening Staff** | Staff 1 | `screening.staff1@visionai.health` | `Vision@Staff1#2026` |
| **Screening Staff** | Staff 2 | `screening.staff2@visionai.health` | `Vision@Staff2#2026` |
| **Ophthalmologist** | Doctor 1 | `doctor1@visionai.health` | `Vision@Doctor1#2026` |
| **Ophthalmologist** | Doctor 2 | `doctor2@visionai.health` | `Vision@Doctor2#2026` |
| **Patient** | Patient 1 | `patient1@visionai.health` | `Vision@Patient1#2026` |

---

## Future Scope

1. **Dedicated Deep Learning Segmentation Deployment:** Transitioning from deterministic computer vision evidence filters to fully trained deep learning models:
   - Training U-Net++ with dense skip connections on DRIVE and CHASE_DB1 for microvascular caliber and AVR computation.
   - Deploying dual-branch heatmap regression CNNs for sub-pixel foveal center and optic nerve head boundary delineation.
   - Implementing DeepLabV3+ with ResNet-50 for multi-class lesion segmentation (microaneurysms, hemorrhages, hard/soft exudates).
2. **Multi-Task DR Severity Classification:** Training a shared-backbone ResNet-101 multi-task architecture with split heads predicting overall 5-class severity alongside auxiliary focal lesion density counts.
3. **Advanced Calibration & Epistemic Uncertainty:** Transitioning to second-order Grad-CAM++, integrating temperature scaling to minimize Expected Calibration Error (ECE), and adding Monte Carlo Dropout for formal epistemic uncertainty estimates.
4. **Edge Deployment for Rural Clinics:** Quantizing neural network models via TensorFlow Lite and ONNX Runtime for offline deployment on low-cost point-of-care edge devices (e.g. Raspberry Pi 5, NVIDIA Jetson).
5. **Multi-Field Bilateral Protocols:** Extending ingestion to standard ETDRS 7-field or 2-field (macula + optic disc centered) photography to capture peripheral neovascularization outside the central 45° field.
6. **Prospective Clinical Trials & CDSCO Clearance:** Partnering with regional tertiary eye hospitals to conduct prospective multi-center validation trials and prepare documentation for regulatory compliance under CDSCO Medical Device Rules (2017).

---

## Open-Source Research References

1. **Gulshan, V., et al.** (2016). *Development and Validation of a Deep Learning Algorithm for Detection of Diabetic Retinopathy in Retinal Fundus Photographs.* **JAMA**, 316(22), 2402–2410. [doi:10.1001/jama.2016.17216](https://doi.org/10.1001/jama.2016.17216)
2. **Tan, M., & Le, Q. V.** (2019). *EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks.* **ICML 2019**, PMLR 97:6105–6114. [arXiv:1905.11946](https://arxiv.org/abs/1905.11946)
3. **Selvaraju, R. R., et al.** (2017). *Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization.* **ICCV 2017**, 618–626. [doi:10.1109/ICCV.2017.74](https://doi.org/10.1109/ICCV.2017.74)
4. **Zhou, Z., et al.** (2018). *UNet++: A Nested U-Net Architecture for Medical Image Segmentation.* **IEEE TMI**, 39(6), 1856–1867. [doi:10.1109/TMI.2019.2959609](https://doi.org/10.1109/TMI.2019.2959609)
5. **Chen, L.-C., et al.** (2018). *Encoder-Decoder with Atrous Separable Convolution for Semantic Image Segmentation.* **ECCV 2018**, LNCS 11211:833–851. [arXiv:1802.02611](https://arxiv.org/abs/1802.02611)
6. **He, K., Zhang, X., Ren, S., & Sun, J.** (2016). *Deep Residual Learning for Image Recognition.* **CVPR 2016**, 770–778. [doi:10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90)
7. **Chattopadhay, A., et al.** (2018). *Grad-CAM++: Generalized Gradient-Based Visual Explanations for Deep Convolutional Networks.* **WACV 2018**, 839–847. [doi:10.1109/WACV.2018.00097](https://doi.org/10.1109/WACV.2018.00097)
8. **Wilkinson, C. P., et al.** (2003). *Proposed International Clinical Diabetic Retinopathy and Diabetic Macular Edema Disease Severity Scales.* **Ophthalmology**, 110(9), 1677–1682. [doi:10.1016/S0161-6420(03)00475-5](https://doi.org/10.1016/S0161-6420(03)00475-5)
9. **Guo, C., et al.** (2017). *On Calibration of Modern Neural Networks.* **ICML 2017**, PMLR 70:1321–1330. [arXiv:1706.04599](https://arxiv.org/abs/1706.04599)
10. **MathWorks Documentation:**
    - [Deep Learning Toolbox Documentation](https://www.mathworks.com/help/deeplearning/)
    - [Image Processing Toolbox Documentation](https://www.mathworks.com/help/images/)
    - [Computer Vision Toolbox Documentation](https://www.mathworks.com/help/vision/)
    - [Medical Imaging Toolbox Documentation](https://www.mathworks.com/help/medical-imaging/)
    - [Simulink Discrete-Event Simulation & SimEvents](https://www.mathworks.com/help/simevents/)

---

## Security and Clinical Disclaimer

### Prototype & Regulatory Boundaries
- **Assistive Research Prototype:** Vision AI is an assistive decision-support research prototype developed for the Smart India Hackathon 2026 (SIH26038). It does not hold CDSCO (Central Drugs Standard Control Organisation, India) or US FDA clearance as an autonomous medical diagnostic device.
- **Mandatory Specialist Sign-Off:** The platform must never be used as a standalone diagnostic authority. All automated triage grades, tail-sum referability probabilities, and Grad-CAM attention overlays are preliminary aids that require explicit confirmation and digital signature by a certified ophthalmologist before clinical action is initiated. For risk governance protocols, see [Clinical Safety Protocol](docs/clinical-safety.md).

### Data Privacy & Aadhaar Compliance (DPDP Act 2023)
- In strict adherence to UIDAI regulations and India's Digital Personal Data Protection (DPDP) Act 2023, Vision AI **never ingests, stores, or transmits raw 12-digit Aadhaar UID numbers or biometric information**.
- Patient records use opaque, randomly generated system identifiers (`patientId`). If identification references are recorded, they are strictly restricted to masked display strings (`XXXX XXXX 1234`).
- All communication between client portals and backend gateways is encrypted via TLS; relational database storage resides on an isolated container network. For security architecture, see [Privacy & Security Architecture](docs/privacy-security.md).

<br />

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
<img src="docs/images/MakeInIndia.jpeg" width="120" alt="Make in India" />

</div>
