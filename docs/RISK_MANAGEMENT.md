# Clinical Risk Management & Regulatory Governance

This document establishes the clinical risk management framework, failure mode mitigations, regulatory context, and data protection guidelines for the Vision AI Diabetic Retinopathy Screening System.

---

## 1. Clinical Risk Analysis & Failure Modes

Deploying artificial intelligence models in real-world clinical screening workflows introduces specific clinical, technical, and human-factors risks.

| Failure Mode | Clinical Consequence | Root Cause | Implemented Technical & Workflow Mitigation |
|---|---|---|---|
| **False Negative (Missed Referable DR)** | Delayed treatment; progression to irreversible vision impairment or blindness. | Subtle lesions obscured by cataract; peripheral neovascularization outside 45° field of view; faint microaneurysms. | **Calibrated Thresholding:** Referable threshold set to $p \ge 0.20798$, prioritizing $>90\%$ sensitivity over specificity. All screenings require ophthalmologist tele-review. |
| **False Positive (Over-Referral)** | Unnecessary patient distress; referral overload at secondary and tertiary eye care facilities. | Confounding retinal features: age-related drusen, myelinated nerve fibers, laser scars, or choroidal nevi. | Multi-class ICDR probability breakdown and Grad-CAM visual evidence allow reviewing ophthalmologists to quickly identify confounding benign lesions. |
| **Poor Image Quality Degradation** | Inaccurate classification due to degraded retinal signal. | Dense cataract, small un-dilated pupil, corneal reflection, dust on lens, patient motion blur. | Multi-modal evidence generation; mandatory image quality assessment; cases with $\max(\mathbf{p}) < 0.50$ trigger `isLowConfidence = true` for mandatory re-imaging or dilation. |
| **Automation Bias** | Healthcare workers uncritically accepting AI predictions without inspecting fundus photographs. | Over-reliance on AI score; high patient volume in rural camps. | The system never automatically discharges patients. The reviewing doctor must verify image features and submit a signed review before report generation. |
| **Grad-CAM Misalignment** | Saliency map highlights non-pathological structures (e.g., optic disc cup, vascular arcades). | Gradients influenced by dominant global retinal landmarks. | Logits-based Grad-CAM computed from `top_activation` before softmax saturation, complemented by separate vessel and disc-fovea structural maps. |

---

## 2. Regulatory Positioning (India — CDSCO)

### 2.1 Software as a Medical Device (SaMD) Classification
- Under the **Medical Device Rules (MDR), 2017** issued by the Central Drugs Standard Control Organisation (CDSCO), software intended for healthcare screening or diagnostic decision support is classified under Software as a Medical Device (SaMD).
- **Current Legal Status:** Vision AI is currently an **academic research and investigational decision-support tool**.
- **Non-Diagnostic Claim:** The platform does **not** claim to provide autonomous or primary diagnostic determinations.
- **Prerequisite for Clinical Deployment:** Any prospective real-world deployment in government screening programs (such as the National Programme for Control of Blindness and Visual Impairment - NPCB&VI) requires:
  1. Formal prospective multi-centre clinical validation across Indian demographic cohorts.
  2. Performance evaluation against consensus panel retinal grading (minimum two independent retina specialists).
  3. Formal investigational device clearance from the CDSCO Subject Expert Committee (SEC).

---

## 3. Data Protection & Patient Privacy (DPDP Act & DISHA)

Because the system manages sensitive health data and medical imagery, engineering practices are aligned with the principles of the **Digital Personal Data Protection (DPDP) Act, 2023** and draft **Digital Information Security in Healthcare Act (DISHA)** guidelines:

### 3.1 Data Minimization & Purpose Limitation
- The system only captures demographics essential for clinical screening (Name, Age, Gender, Contact, known Diabetes Duration, Facility ID).
- Retinal imagery is linked to internal UUIDs rather than national identity numbers.

### 3.2 Access Control & Role Isolation
- **Role-Based Access Control (RBAC):** Strict boundaries enforced at API gateway and database levels:
  - Screening staff can only view patients and screenings registered at their assigned facility.
  - Reviewing doctors only access unreviewed screening queues assigned to their clinical roster.
  - Administrative roles have zero access to clinical review overrides.

### 3.3 Storage Security & Encryption
- **In Transit:** HTTPS / TLS 1.3 encryption across all communication between client, backend, and internal inference endpoints.
- **At Rest:** Database volumes and persistent file storage (`STORAGE_BASE_PATH`) reside in secured, isolated storage with restricted filesystem permissions.
- **Local Sovereignty:** Storage architecture is designed to run within local Indian data centres or on-premise hospital infrastructure, preventing cross-border transfer of health data.

### 3.4 Audit Trail Integrity
- Every screening event, AI inference execution, and clinical review decision is immutably logged with:
  - User ID of the acting operator.
  - Exact timestamp.
  - Original image storage key.
  - Model version hash (`DR_EfficientNetB0_V2`).
  - Pre-review AI grade vs Post-review Doctor grade.

---

## 4. Operational Safety Controls

### 4.1 Demo Mode Isolation
- The application includes a presentation demo mode (`PRESENTATION_DEMO_MODE`) designed strictly for offline UI demonstrations during hackathon presentations.
- **Safety Rule:** `PRESENTATION_DEMO_MODE` must be explicitly configured as `"false"` (or omitted) in all production and clinical environments.
- **Defensive Safeguards:**
  - Whenever demo mode is active, prominent safety warnings are emitted to application logs.
  - All generated database records and API responses are stamped with `isSimulatedDemo: true`.
  - Demo mode data is segregated in audit reports and cannot be confused with genuine patient screening data.

### 4.2 Model Traceability & Rollback Protocol
- **Model Versioning:** The active model is pinned by version and file hash in `model/config/model_config.json`:
  ```json
  {
    "model_version": "V2",
    "model_path": "model/production/V2/DR_EfficientNetB0_V2.keras",
    "referable_threshold": 0.20798
  }
  ```
- **Safe Rollback:** If an active model version exhibits anomalous behavior or drift:
  1. The environment variable or configuration pointer in `model_config.json` can be immediately reverted to the previous validated model artifact.
  2. The inference service reloads the model without requiring database migrations or service downtime.
  3. All historical screenings maintain immutable records of the exact model version used at the time of screening.

---

## 5. Adverse Event & Incident Reporting

Any observed failure mode—including suspected false-negative screenings or image processing errors—must be reported through the structured [Clinical Safety Issue Template](../.github/ISSUE_TEMPLATE/clinical_safety_concern.md).

Reported incidents trigger immediate review by the engineering lead and medical advisory team to evaluate potential model drift, preprocessing anomalies, or user training gaps.
