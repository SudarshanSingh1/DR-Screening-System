# Changelog

All notable changes to the Vision AI Diabetic Retinopathy Screening System are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-19

### Added
- **GitHub Community Standards:**
  - Pull Request template with dedicated Medical AI & Clinical Risk Assessment checklist.
  - Issue templates for Bug Reports, Feature Requests, Model Evaluations, and Clinical Safety Concerns.
- **Unit Testing Framework:**
  - Backend storage utility tests using Node.js native test runner (`backend/src/tests/storage.test.ts`).
  - Inference service evidence generator unit tests (`inference_service/tests/test_evidence_generator.py`).
- **Clinical Governance Documentation (`docs/`):**
  - [`docs/CLINICAL_WORKFLOW.md`](docs/CLINICAL_WORKFLOW.md): Operational guide for rural PHC/CHC screening, role boundaries, and tele-ophthalmology referral escalation.
  - [`docs/RISK_MANAGEMENT.md`](docs/RISK_MANAGEMENT.md): Failure mode analysis, poor-quality image handling, false-negative mitigations, and CDSCO/DPDP alignment.
- **MATLAB Contributor Workspace & Test Documentation:**
  - Standardized training directory structure under `matlab/training/` with documented starter template.
  - Test guide in `matlab/tests/README.md`.

### Fixed
- **Docker Compose Storage Persistence (`docker-compose.yml`):**
  - Removed accidental `uploads` volume mount from PostgreSQL `database` container.
  - Mounted persistent `uploads:/app/uploads` volume to the `backend` container, ensuring all uploaded fundus images and generated PDF reports persist across container recreation.
- **Demo Mode Isolation & Clinical Safety (`screening.controller.ts`, `doctor.controller.ts`):**
  - Documented `PRESENTATION_DEMO_MODE="false"` default in all `.env.example` templates.
  - Added safety audit warnings to application logs when demo mode is active.
  - Tagged all demo-mode screening outputs with `isSimulatedDemo: true` in database records and API payloads to prevent confusing simulated demo data with clinical patient records.
- **MATLAB Test Reproducibility (`matlab/tests/testRealPipeline.m`):**
  - Added dual discovery to check for dedicated test images (`data/test_images/`) and automatically fall back to repository sample fixtures (`frontend/public/images/fundus/`).
  - Replaced abrupt crashes with clear prerequisite instructions when image fixtures are missing.
- **Frontend Hook Ordering (`NewScreeningWorkspace.tsx`):**
  - Moved `useEffect` above conditional return guard to comply with React's Rules of Hooks, eliminating all linter errors.

---

## [1.1.0] - 2026-09-22

### Added
- Production V2 deep learning model (`DR_EfficientNetB0_V2.keras`, 224×224 input, 5-class ICDR grading).
- Calibrated referable diabetic retinopathy threshold ($0.20798$).
- Dual-eye Grad-CAM saliency map visualization using logits gradients from `top_activation`.
- Multi-modal evidence generator producing vessel segmentation maps, optic disc/fovea landmarks, and quality assessments.
- Automated clinical referral PDF generation with bilingual patient instructions (English & Hindi).
- Role-Based Access Control (RBAC) with dedicated portals for screening staff, reviewing doctors, patients, and administrators.

---

## [1.0.0] - 2026-09-10

### Added
- Initial microservices architecture: React frontend, Express/Prisma backend, FastAPI inference service, PostgreSQL database.
- MATLAB and Simulink discrete-event queue simulation models (`DRDistrictSystem.slx`, `DRScreeningSystem.slx`) for rural healthcare capacity planning.
- Docker Compose local orchestration.
- Initial project documentation and architecture specifications.
