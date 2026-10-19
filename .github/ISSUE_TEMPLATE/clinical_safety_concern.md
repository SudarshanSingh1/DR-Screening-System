---
name: Clinical Safety / Risk Concern
about: Report a concern regarding clinical triage, false-negative risk, or explainability discrepancy
title: '[CLINICAL SAFETY] '
labels: ['clinical-safety', 'high-priority']
assignees: ''
---

> **Important:** This issue template is specifically for concerns regarding screening triage safety, edge-case failure modes, explainability discrepancy (Grad-CAM hallucination), or misclassification risks.

**Nature of Safety Concern**
- [ ] Potential False Negative risk (severe pathology graded as benign or non-referable)
- [ ] Explainability misalignment (Grad-CAM highlights non-retinal artifacts or distractors)
- [ ] Poor image quality bypass (ungradable image accepted without warning)
- [ ] Triage urgency miscalculation
- [ ] Data integrity or patient linkage issue

**Detailed Description**
Describe the clinical or algorithmic scenario, observed AI output, and the clinical expectation.

**Clinical Grading Discrepancy (if applicable)**
- AI Prediction:
- Expected Clinical Grade (ICDR 0–4):
- Referable Flag (Expected vs Actual):

**Impact on Screening Workflow**
Explain how this failure mode would impact real-world rural screening or tele-ophthalmology referral queues.

**Recommended Remediation**
Suggestions for preprocessing adjustments, quality gates, confidence thresholds, or doctor review workflow enhancements.
