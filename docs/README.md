# Vision AI Documentation Index

Welcome to the technical, clinical, and architectural documentation for **Vision AI** (SIH26038).

---

## 1. Architecture Documentation (`docs/architecture/`)
- [`deployed-system.md`](architecture/deployed-system.md): The live, deployed system architecture (bilateral intake, quality gate, FastAPI gateway, EfficientNetB0 V2, logits Grad-CAM, worst-eye triage queue, bilingual PDF report).
- [`ai-pipeline.md`](architecture/ai-pipeline.md): The six-model research AI pipeline (EfficientNet-B2 IQA, U-Net++ vessels, Heatmap CNN landmarks, DeepLabV3+ lesions, ResNet-101 multi-task, Grad-CAM++ & uncertainty).
- [`data-flow.md`](architecture/data-flow.md): The 9-stage clinical data progression, distinguishing raw images, probability vectors, AI evidence, doctor inputs, and signed reports.
- [`deployment.md`](architecture/deployment.md): Multi-tier container deployment, environment variables, volumes, and edge maintenance.

---

## 2. Research & Evaluation Documentation (`docs/research/`)
- [`datasets.md`](research/datasets.md): Retinal datasets, provenance, licensing, and patient-level partitioning (APTOS, EyePACS, Messidor-2, IDRiD, DRIVE).
- [`evaluation-protocol.md`](research/evaluation-protocol.md): Formal evaluation methodology, formulas, referable DR definition (Level 2+), Wilson 95% CIs, and verification benchmark metrics.
- [`matlab-keras-parity.md`](research/matlab-keras-parity.md): Cross-framework parity testing protocol and layer topology comparison (Status: NOT RUN).

---

## 3. Governance, Safety & Security
- [`clinical-safety.md`](clinical-safety.md): Clinical safety protocol, doctor-in-the-loop mandate, failure modes risk matrix, and CDSCO prototype disclaimer.
- [`privacy-security.md`](privacy-security.md): Medical data security, RBAC, IDOR protection, DPDP Act 2023 compliance, and Aadhaar privacy governance (masked references only).
- [`limitations.md`](limitations.md): Algorithmic, clinical, and operational boundaries of the research prototype.

---

## 4. Visual Assets (`docs/images/`)
- Contains all verified system diagrams, workflow charts, and Simulink discrete-event queue simulation screenshots.
