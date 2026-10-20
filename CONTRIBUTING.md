# Contributing to Vision AI — Diabetic Retinopathy Screening System

Thank you for contributing to the Vision AI project. This platform is engineered for real-world diabetic retinopathy screening workflows in resource-constrained healthcare environments, including rural Primary Health Centres (PHCs) and Community Health Centres (CHCs) in India.

Because this system operates in a healthcare decision-support context, we maintain rigorous engineering, machine learning, and clinical safety standards.

---

## Code of Conduct & Clinical Safety Principles

1. **Patient Data Privacy:** Never commit real patient images, Personal Identifiable Information (PII), or Protected Health Information (PHI) to the repository. Use synthetic or anonymized public datasets.
2. **Decision Support, Not Primary Diagnosis:** The AI model is designed as a screening triage and clinical decision-support tool. It assists trained healthcare workers and ophthalmologists; it does not replace qualified clinical judgment.
3. **Model Invariance:** Never modify production model weights, classification heads, or operating thresholds ($0.20798$ referable threshold) without formal evaluation, cross-dataset validation, and clinical sign-off.
4. **Architectural Separation:** The production web stack (Python FastAPI + Node.js + React) and the research simulation stack (MATLAB + Simulink) are decoupled. Do not introduce MATLAB runtime dependencies into the production web application.

---

## Repository Architecture

```text
├── frontend/             # React 18, Vite, TypeScript, Tailwind CSS
├── backend/              # Node.js 20, Express, TypeScript, Prisma, PostgreSQL
├── inference_service/    # Python 3.11, FastAPI, TensorFlow/Keras
├── model/                # Production model artifacts, configs, and reference weights
├── matlab/               # Research algorithms, Simulink models, and training workspace
├── evaluation/           # Evaluation runners, verification split reports, and metric tests
├── tests/                # Unified test suites (unit, integration, security, fixtures)
├── scripts/              # Verification and automated test runner scripts
├── deployment/           # Deployment guides and container configurations
├── docs/                 # Architectural, research, clinical safety, and security docs
└── docker-compose.yml    # Multi-service local orchestration
```

---

## Development Setup

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **Python**: v3.11.x
- **Docker & Docker Compose**: v2.20+
- **MATLAB** (Optional, research only): R2023b+ with Deep Learning & Image Processing Toolboxes

### 2. Environment Configuration
Copy the sanitized environment template:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Ensure `PRESENTATION_DEMO_MODE="false"` in your local environment for genuine AI inference.

### 3. Local Docker Orchestration
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Inference Service: `http://localhost:8000`

---

## Quality Standards & Testing

Before submitting a pull request, verify that all automated checks pass locally.

### Unified Test Runner (Recommended)
```bash
bash scripts/run_all_tests.sh
```

### Individual Service Verification

#### Frontend
```bash
cd frontend
npm ci
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

#### Backend
```bash
cd backend
npm ci
npx prisma generate
npm run build    # tsc
npm test         # node --test dist/tests/**/*.test.js
```

#### Python Unit & Integration Tests
```bash
python3 -m unittest discover -s tests/unit
python3 -m unittest discover -s tests/integration
python3 -m unittest discover -s tests/security
python3 -m unittest discover -s evaluation/tests
```

#### Referable-DR Benchmark Evaluation
```bash
python3 evaluation/scripts/evaluate_referable_dr.py
```

#### Docker Compose
```bash
docker compose config --quiet
```

### MATLAB Tests (When licensed runner is available)
```matlab
% In MATLAB Command Window:
cd('matlab/tests')
testRealPipeline
```

---

## Git Workflow & Branching Conventions

We follow a structured Git branching model:

| Branch | Purpose |
|---|---|
| `main` | Production-ready, verified code. Protected branch. |
| `develop` | Integration branch for upcoming releases. |
| `feature/<scope>-<description>` | New features (e.g., `feature/backend-audit-logger`). |
| `fix/<scope>-<description>` | Bug fixes (e.g., `fix/docker-uploads-volume`). |
| `feat(matlab)/<description>` | MATLAB training and simulation contributions. |

### Commit Message Conventions
Follow Conventional Commits:
- `feat(frontend): add dual-eye zoom in screening viewer`
- `fix(backend): correct storage path for referral reports`
- `docs: update clinical workflow and referral escalation paths`
- `perf(inference): optimize bilinear resizing pipeline`
- `test(inference): add unit tests for evidence generator`

---

## Model Contribution Guidelines

1. **New Models:** Train and evaluate new architectures in `matlab/training/` or an external training notebook. Follow the contributor guide in [`matlab/training/README.md`](matlab/training/README.md).

2. **Export to Production:** Export validated weights to `.keras` format matching the input contract:
   - Input shape: `(None, 224, 224, 3)`
   - Pixel range: `[0.0, 255.0]` float32 (RGB)
   - Grad-CAM layer: `top_activation`
   - Output: 5-class softmax probabilities (ICDR 0–4)

3. **Versioning:** Never overwrite existing models. Save new candidates in `model/production/V3/` and document evaluation metrics (Quadratic Weighted Kappa, Accuracy, Referable Sensitivity/Specificity) in `model/config/model_config.json`.

4. **Dataset Quality and Preprocessing:** Ensure training, validation, and test datasets are properly separated to prevent data leakage. Document image preprocessing steps, class distributions, image quality checks, and any augmentation techniques used during training.

5. **Explainability and Visualization:** Generate Grad-CAM heatmaps to highlight image regions influencing model predictions. Verify that heatmaps are generated successfully and correspond to the correct input image and predicted class. Treat heatmaps as explanatory aids, not proof of clinical correctness.

6. **Reproducibility:** Record random seeds, dataset versions, training configurations, hyperparameters, and dependency versions for every new model candidate. Where possible, ensure that training and evaluation results can be reproduced.

7. **Model Evaluation and Validation:** Evaluate each candidate on a held-out test dataset and report per-class precision, recall, F1-score, confusion matrix, Quadratic Weighted Kappa, and referable diabetic retinopathy sensitivity and specificity. Compare results against the currently deployed model before promoting a candidate.

8. **Input Validation and Error Handling:** Reject unsupported image formats, corrupted files, invalid image dimensions, and empty inputs. Verify RGB channel ordering, pixel range, and tensor shape before inference. Handle low-quality or ungradable fundus images explicitly rather than forcing a severity prediction.

9. **Model Configuration and Metadata:** Update `model/config/model_config.json` with the model version, architecture, input specifications, class mapping, evaluation metrics, training dataset reference, and creation date. Keep configuration metadata consistent with the exported model.

10. **Production Readiness and Safety:** Validate inference compatibility, prediction output shape, probability normalization, and Grad-CAM generation before deployment. Model predictions must support clinical review and must not be presented as a definitive diagnosis without qualified medical assessment.

11. **Documentation and Change Tracking:** Include a short report for each candidate describing architectural changes, training methodology, evaluation results, known limitations, and comparison with previous versions. Document any breaking changes to the model input or output contract.

12. **Promotion and Rollback:** Promote a model to production only after all evaluation and compatibility checks pass. Retain previous validated versions and document the deployment decision so the system can be rolled back if a newly deployed model performs unexpectedly.


## Pull Request Process

1. Open a PR against `develop` (or `main` for hotfixes).
2. Fill out the [Pull Request Template](.github/pull_request_template.md) completely, including the **Clinical Risk Assessment** checklist.
3. Ensure local verification checks pass (builds, tests, and linter).
4. Request review from at least one core engineer and one clinical/domain reviewer where applicable.
