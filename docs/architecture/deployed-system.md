# Deployed System Architecture — Vision AI

**Problem Statement:** SIH26038 | Smart India Hackathon 2026  
**Document Status:** Production Deployed Reference  
**Last Verified:** October 2026  

---

## 1. Executive Summary

Vision AI operates a deterministic, assistive tele-ophthalmology screening pipeline deployed as a containerized edge system for rural Primary Health Centres (PHCs) and district hospitals in India.

The active production pipeline consists of:
1. **Bilateral Ingestion:** Concurrent handling of left eye (OS) and right eye (OD) fundus photographs.
2. **Automated Image Quality Gate:** Deterministic pre-inference filter evaluating scale-invariant Laplacian blur variance, foreground illumination, and aspect geometry.
3. **FastAPI Deep Learning Gateway:** Asynchronous inference microservice hosting fine-tuned EfficientNetB0 V2.
4. **Five-Class Severity Classification:** ICDR severity stages 0–4 with tail-sum referable DR triage.
5. **Logits-Based Grad-CAM Explainability:** Pre-softmax gradient backpropagation onto layer `top_activation`.
6. **Doctor-in-the-Loop Review Queue:** Specialist triage queue enforcing worst-eye referral governance.
7. **Immutable Clinical Referral Report:** Bilingual signed PDF report generation with QR code authenticity verification.

---

## 2. End-to-End Deployed Architecture

```mermaid
flowchart TD
    subgraph S1 ["1. Bilateral Patient Ingestion"]
        LE_IN["<b>Left Eye (OS) Fundus Image</b><br/><i>multipart/form-data</i>"]
        RE_IN["<b>Right Eye (OD) Fundus Image</b><br/><i>multipart/form-data</i>"]
    end

    subgraph S2 ["2. Automated Image Quality Gate (Dual Channel)"]
        QG_LE{"<b>OS Quality Check</b><br/>• Blur (Laplacian Var ≥ 12.0)<br/>• Illumination (30 ≤ μ ≤ 235)<br/>• Min Dim (≥ 150px, AR ≤ 2.5)"}
        QG_RE{"<b>OD Quality Check</b><br/>• Blur (Laplacian Var ≥ 12.0)<br/>• Illumination (30 ≤ μ ≤ 235)<br/>• Min Dim (≥ 150px, AR ≤ 2.5)"}
        RECAP_LE["<b>OS Recapture Required (422)</b><br/><i>Specific cause: defocus blur, underexposure,<br/>glare washout, or insufficient resolution</i>"]
        RECAP_RE["<b>OD Recapture Required (422)</b><br/><i>Specific cause: defocus blur, underexposure,<br/>glare washout, or insufficient resolution</i>"]
    end

    subgraph S3 ["3. FastAPI Inference Gateway & Deep Learning Models"]
        direction TB
        M5_LE["<b>OS EfficientNetB0 V2</b><br/><i>240 layers (ImageNet weights)</i>"]
        M5_RE["<b>OD EfficientNetB0 V2</b><br/><i>240 layers (ImageNet weights)</i>"]
        PRED_LE["<b>OS Five-Class DR Prediction</b><br/><i>Softmax [p0..p4]</i>"]
        PRED_RE["<b>OD Five-Class DR Prediction</b><br/><i>Softmax [p0..p4]</i>"]
        XAI_LE["<b>OS Grad-CAM Explainability</b><br/><i>Logits gradient on top_activation</i>"]
        XAI_RE["<b>OD Grad-CAM Explainability</b><br/><i>Logits gradient on top_activation</i>"]

        M5_LE --> PRED_LE
        M5_LE --> XAI_LE
        M5_RE --> PRED_RE
        M5_RE --> XAI_RE
    end

    subgraph S4 ["4. Doctor Review Queue & Clinical Decision"]
        TRIAGE["<b>Doctor Review Queue & Worst-Eye Triage</b><br/><i>Referral Urgency = max(Grade_OS, Grade_OD)<br/>isReferable: P(Referable) = ∑(p2..p4) ≥ 0.20798</i>"]
        DOC_EVAL{"<b>Clinical Decision (Ophthalmologist)</b><br/><i>Side-by-side inspection, opacity blending,<br/>confirm or override DR severity</i>"}
        TRIAGE --> DOC_EVAL
    end

    subgraph S5 ["5. Clinical Referral & Final Report"]
        ROUTINE["<b>Routine Community Follow-Up</b><br/><i>Levels 0–1 (Non-referable): 12-mo PHC review</i>"]
        URGENT["<b>Urgent Specialist Referral</b><br/><i>Levels 2–4 (Referable): District Hospital care</i>"]
        FINAL_REP["<b>Clinical Referral / Final Report (PDF)</b><br/><i>Bilingual summary, specialist signature, QR verify</i>"]

        ROUTINE --> FINAL_REP
        URGENT --> FINAL_REP
    end

    LE_IN --> QG_LE
    RE_IN --> QG_RE

    QG_LE -->|FAIL: Ungradable| RECAP_LE
    RECAP_LE -.->|Prompt Immediate Recapture| LE_IN
    QG_LE -->|PASS: Gradable| M5_LE

    QG_RE -->|FAIL: Ungradable| RECAP_RE
    RECAP_RE -.->|Prompt Immediate Recapture| RE_IN
    QG_RE -->|PASS: Gradable| M5_RE

    PRED_LE --> TRIAGE
    XAI_LE --> TRIAGE
    PRED_RE --> TRIAGE
    XAI_RE --> TRIAGE

    DOC_EVAL -->|Level 0–1: Mild/None| ROUTINE
    DOC_EVAL -->|Level 2–4: Moderate+| URGENT

    classDef input stroke:#2563eb,stroke-width:2px,fill:#eff6ff,color:#1e3a8a;
    classDef passGate stroke:#059669,stroke-width:2px,fill:#ecfdf5,color:#064e3b;
    classDef failGate stroke:#dc2626,stroke-width:2px,fill:#fef2f2,color:#7f1d1d;
    classDef mlEngine stroke:#7c3aed,stroke-width:2px,fill:#f5efff,color:#2e1065;
    classDef clinical stroke:#ea580c,stroke-width:2px,fill:#fff7ed,color:#7c2d12;
    classDef output stroke:#059669,stroke-width:2px,fill:#d1fae5,color:#065f46;

    class LE_IN,RE_IN input;
    class QG_LE,QG_RE passGate;
    class RECAP_LE,RECAP_RE failGate;
    class M5_LE,M5_RE,PRED_LE,PRED_RE,XAI_LE,XAI_RE mlEngine;
    class TRIAGE,DOC_EVAL clinical;
    class ROUTINE,URGENT,FINAL_REP output;
```

---

## 3. Pipeline Component Details

### 3.1 Bilateral Image Ingestion
- **Input Channels:** Left eye (`leftEye`) and right eye (`rightEye`) uploaded via `multipart/form-data`.
- **Formats Accepted:** JPEG, PNG, TIFF.
- **Storage:** Decoded and persisted to persistent container storage at `/app/uploads/{screeningId}/` with unique non-colliding UUID filenames.

### 3.2 Automated Image Quality Gate
Implemented in [`inference_service/quality_gate.py`](file:///Users/sudarshankumar/DR-Screening-System/inference_service/quality_gate.py).
Evaluates optical gradability before passing tensors to the deep learning model:
- **Laplacian Blur Variance:** Standardized on a $512 \times 512$ thumbnail. Sharpness score $< 12.0$ triggers immediate defocus rejection.
- **Illumination Filter:** Mean foreground brightness (excluding background black masks $< 15$ intensity). Brightness $< 30.0$ rejects underexposure; brightness $> 235.0$ rejects glare washouts.
- **Geometric Sanity:** Minimum dimensions ($150 \times 150 \text{ px}$), aspect ratio $\le 2.5$, and foreground coverage $\ge 15\%$.
- **HTTP Response:** Failure returns HTTP 422 with structured JSON (`action: RECAPTURE_REQUIRED`) detailing the exact defect to guide field workers.

### 3.3 Production Deep Learning Model
- **Artifact:** `model/production/V2/DR_EfficientNetB0_V2.keras`
- **Architecture:** 240 Keras layers, 4,055,845 parameters.
- **Input Dimensions:** $224 \times 224 \times 3$, normalized via embedded ImageNet z-score layer ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).
- **Classification Head:** Dense layer `dr_classifier` yielding 5 unnormalized logits, converted via Softmax into probabilities:
  $$\mathbf{p} = [p_0, p_1, p_2, p_3, p_4]$$
  representing ICDR Levels 0 (No DR), 1 (Mild NPDR), 2 (Moderate NPDR), 3 (Severe NPDR), and 4 (Proliferative DR).

### 3.4 Referable DR Triage Rule
Referable diabetic retinopathy is defined clinically as ICDR Stage 2 or greater:
$$P(\text{Referable}) = \sum_{c=2}^{4} p_c = p_{\text{Moderate}} + p_{\text{Severe}} + p_{\text{Proliferative}}$$
$$\text{isReferable} = \begin{cases} \mathbf{true} & \text{if } P(\text{Referable}) \ge 0.20798 \\ \mathbf{false} & \text{otherwise} \end{cases}$$
The threshold $0.20798$ was derived from development ROC curves to prioritize high screening sensitivity in community health camps.

### 3.5 Logits-Based Grad-CAM Explainability
Standard post-softmax Grad-CAM suffers from vanishing gradients when the classification head is highly confident ($p_c \to 1.0$). Vision AI circumvents this by backpropagating the pre-softmax dense logits:
$$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^U \sum_{j=1}^V \frac{\partial z^c}{\partial A_{ij}^k}, \qquad L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_{k=1}^K \alpha_k^c A^k\right)$$
where $A^k$ is the activation tensor of layer `top_activation` ($7 \times 7 \times 1280$), and $z^c$ is the logit for predicted class $c$.
The resulting 2D heatmap is upsampled to $224 \times 224$, color-mapped using OpenCV `COLORMAP_JET`, and alpha-blended ($60\%$ maximum opacity) with the fundus photograph.

### 3.6 Worst-Eye Triage & Specialist Governance
Because diabetic retinopathy frequently exhibits asymmetrical severity between eyes, public health urgency is dictated by the eye with greater pathology:
$$\text{Patient Triage Level} = \max\left(\text{Grade}_{\text{OS}}, \text{Grade}_{\text{OD}}\right)$$
The ophthalmologist reviews both eyes side-by-side with independent Grad-CAM opacity sliders. The doctor retains absolute authority to confirm or modify the severity grade, enter clinical notes, and authorize patient disposition.

---

## 4. Hardware and Latency Benchmarks

| Metric | Target Specification | Observed Edge Performance (CPU) |
|---|---|---|
| **Quality Gate Latency** | $< 100 \text{ ms}$ | $\approx 24 \text{ ms}$ (Pillow + NumPy) |
| **Inference Latency** | $< 500 \text{ ms}$ | $\approx 210 \text{ ms}$ (EfficientNetB0 V2) |
| **Grad-CAM Generation** | $< 300 \text{ ms}$ | $\approx 165 \text{ ms}$ (GradientTape) |
| **Total Round-Trip per Eye** | $< 1000 \text{ ms}$ | $\approx 480 \text{ ms}$ |
| **Memory Footprint** | $< 1.5 \text{ GB}$ | $\approx 780 \text{ MB}$ (TensorFlow runtime) |
