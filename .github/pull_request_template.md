## Description

<!-- Provide a concise summary of the changes and the rationale behind them. -->

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Model / Inference Pipeline change (modifications to weights, preprocessing, or thresholds)
- [ ] Documentation update
- [ ] Security / Compliance hardening

---

## Medical AI & Clinical Risk Assessment

> **Important:** Changes affecting clinical decision support, inference logic, or patient data handling require rigorous verification.

- [ ] **Model Invariance:** This PR does **not** change model weights, operating thresholds ($0.20798$), or class mappings without prior formal evaluation.
- [ ] **Image Preprocessing:** Fundus image preprocessing, resizing (224×224), and color channels (RGB) remain consistent with the model contract.
- [ ] **Triage & Referrals:** Referable DR criteria (Moderate DR, Severe DR, Proliferative DR, or confidence < threshold) are preserved.
- [ ] **Demo Mode Isolation:** `PRESENTATION_DEMO_MODE` is disabled by default and clearly marked if triggered.
- [ ] **Data Privacy & Security:** No Patient Health Information (PHI) or hardcoded credentials are committed or exposed in logs.

---

## Verification & Testing

Please describe the tests executed to verify these changes:

- [ ] **Frontend:** `npm --prefix frontend run build` & `npm --prefix frontend run lint` passed (0 errors).
- [ ] **Backend:** `npm --prefix backend run build` & `npm --prefix backend test` passed.
- [ ] **Inference Service:** `python3 -m unittest discover -s inference_service/tests` passed.
- [ ] **Docker Compose:** `docker compose config --quiet` syntax validated.
- [ ] **Manual verification:** Verified in local environment.

### Test Evidence / Output:
```text
<!-- Paste relevant command outputs or test logs here -->
```

---

## Checklist

- [ ] My code adheres to the project's coding and formatting standards.
- [ ] I have commented my code where necessary, particularly in complex algorithmic sections.
- [ ] I have updated relevant documentation in `docs/` and `README.md`.
- [ ] My changes do not introduce new security vulnerabilities or unhandled exceptions.
- [ ] A rollback plan is documented if this change affects production services.
