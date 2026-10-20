# Referable Diabetic Retinopathy Evaluation Report

**Model:** `model/production/V2/DR_EfficientNetB0_V2.keras`  
**Evaluation Split:** APTOS 2019 Held-Out Verification Split ($N = 15$)  
**Referable Decision Rule:** $P(\text{Referable}) = \sum_{c=2}^4 p_c \ge 0.20798$  
**Standard:** ICDR Level $\ge 2$ indicates Referable DR  

---

## 1. Contingency Matrix (Referable DR)

| | Predicted Non-Referable | Predicted Referable | Total Actual |
|---|:---:|:---:|:---:|
| **Actual Non-Referable (Levels 0–1)** | **TN = 3** | **FP = 3** | 6 |
| **Actual Referable (Levels 2–4)** | **FN = 7** | **TP = 2** | 9 |
| **Total Predicted** | 10 | 5 | 15 |

---

## 2. Diagnostic Performance Metrics

| Metric | Result | 95% Wilson Score CI | Clinical Target Standard |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **22.2%** (2/9) | [6.3%, 54.7%] | $\ge 93.0\%$ (Target) |
| **Specificity** | **50.0%** (3/6) | [18.8%, 81.2%] | $\ge 87.5\%$ (Target) |
| **Precision (PPV)** | **40.0%** (2/5) | [11.8%, 76.9%] | High Positive Yield |
| **Negative Predictive Value (NPV)** | **30.0%** (3/10) | [10.8%, 60.3%] | High Rule-Out Safety |
| **Overall Accuracy** | **33.3%** (5/15) | [15.2%, 58.3%] | High Diagnostic Accuracy |
| **Binary F1-Score** | **0.2857** | — | $\ge 0.88$ (Target) |

---

## 3. Clinical Governance Rationale

1. **Under-Prediction on Verification Set:** On this 15-sample verification cohort, the deployed fine-tuned model yielded 7 False Negatives (actual referable cases under-called by model tail probabilities).
2. **Mandatory Doctor Sign-Off:** This empirical finding confirms why **Vision AI strictly enforces a Doctor-in-the-Loop policy**. AI outputs are preliminary triage aids; certified ophthalmologists retain sole diagnostic authority.
3. **Developmental Target Notice:** The $\ge 93\%$ sensitivity requirement remains an engineering target requiring broader multi-center retraining across diverse Indian camera types.
