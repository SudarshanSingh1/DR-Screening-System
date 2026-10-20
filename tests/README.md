# Test Suites & Verification Framework — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Testing Guide  

---

## 1. Test Taxonomy

Vision AI enforces multi-level testing across backend, inference, evaluation, and security tiers:

| Test Level | Location | Scope & Components Verified | Execution Command |
|---|---|---|---|
| **Unit Tests** | `tests/unit/` & `inference_service/tests/` | Image Quality Gate (8 tests), evidence generators (3 tests) | `python3 -m unittest discover -s tests/unit` |
| **Integration Tests** | `tests/integration/` | FastAPI HTTP endpoints (`/health`, `/quality-check`, `/analyze`) | `python3 -m unittest discover -s tests/integration` |
| **Security Tests** | `tests/security/` | Sanitization, path traversal, Aadhaar masking, configuration integrity | `python3 -m unittest discover -s tests/security` |
| **Backend Unit Tests** | `backend/src/tests/` | Storage utilities, directory path resolutions | `npm --prefix backend test` |
| **Evaluation Tests** | `evaluation/tests/` | Wilson score confidence intervals, contingency metrics | `python3 -m unittest discover -s evaluation/tests` |
| **Referable-DR Script** | `evaluation/scripts/` | End-to-end evaluation on 15-sample verification cohort | `python3 evaluation/scripts/evaluate_referable_dr.py` |

---

## 2. Running All Tests

To run all automated test suites sequentially:

```bash
# Execute the unified test runner
bash scripts/run_all_tests.sh
```

Or execute suites individually:
```bash
# 1. Backend tests
npm --prefix backend test

# 2. Python unit & security tests
python3 -m unittest discover -s tests/unit
python3 -m unittest discover -s tests/integration
python3 -m unittest discover -s tests/security
python3 -m unittest discover -s evaluation/tests
```
