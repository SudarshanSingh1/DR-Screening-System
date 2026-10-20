# Referable Diabetic Retinopathy Evaluation Report

**Evaluation Date:** Verified Benchmark Assessment  
**Model Evaluated:** `model/production/V2/DR_EfficientNetB0_V2.keras`  
**Dataset:** APTOS 2019 Held-Out Verification Split ($N = 15$)  
**Referable DR Definition:** Level $\ge 2$ (Moderate, Severe, Proliferative DR)  
**Triage Threshold:** $\sum_{c=2}^4 p_c \ge 0.20798$  

---

## 1. Summary of Evaluated Metrics

| Diagnostic Metric | Evaluated Result | 95% Wilson Score Confidence Interval | Clinical Target Standard |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **22.2%** (2/9) | [6.3%, 54.7%] | $\ge 93.0\%$ (Target) |
| **Specificity** | **50.0%** (3/6) | [18.8%, 81.2%] | $\ge 87.5\%$ (Target) |
| **Positive Predictive Value (Precision)** | **40.0%** (2/5) | — | High positive yield |
| **Negative Predictive Value (NPV)** | **30.0%** (3/10) | — | High rule-out safety |
| **Overall Accuracy** | **33.3%** | — | — |
| **Binary F1-Score** | **0.2857** | — | $\ge 0.88$ (Target) |

---

## 2. Confusion Matrix

```text
                     Predicted Non-Referable    Predicted Referable
Actual Non-Referable          TN = 3                    FP = 3
Actual Referable (2+)         FN = 7                    TP = 2
```

---

## 3. Sample-by-Sample Breakdown

| File ID | True Grade | True Status | Model Pred | Referable Score | Pred Status | Result |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `Level0/000c1434d8d7.png` | No DR (0) | Non-Referable | Level 2 | 0.9762 | Referable | **FP** |
| `Level0/0083ee8054ee.png` | No DR (0) | Non-Referable | Level 2 | 0.9203 | Referable | **FP** |
| `Level0/0097f532ac9f.png` | No DR (0) | Non-Referable | Level 0 | 0.0072 | Non-Referable | **TN** |
| `Level1/7f39c36469b5.png` | Mild (1) | Non-Referable | Level 0 | 0.1179 | Non-Referable | **TN** |
| `Level1/7f43becd3e83.png` | Mild (1) | Non-Referable | Level 0 | 0.0113 | Non-Referable | **TN** |
| `Level1/7f60f2a083d3.png` | Mild (1) | Non-Referable | Level 2 | 0.8741 | Referable | **FP** |
| `Level2/99132193eaa0.png` | Moderate (2) | Referable | Level 1 | 0.2388 | Referable | **TP** |
| `Level2/991a0b7a8c87.png` | Moderate (2) | Referable | Level 0 | 0.0023 | Non-Referable | **FN** |
| `Level2/99240ee00485.png` | Moderate (2) | Referable | Level 0 | 0.0577 | Non-Referable | **FN** |
| `Level3/dcc6c0ad5cad.png` | Severe (3) | Referable | Level 0 | 0.0172 | Non-Referable | **FN** |
| `Level3/dccdf750c962.png` | Severe (3) | Referable | Level 0 | 0.0437 | Non-Referable | **FN** |
| `Level3/dce73d90c00c.png` | Severe (3) | Referable | Level 0 | 0.1047 | Non-Referable | **FN** |
| `Level4/e9f3c85a2a02.png` | Proliferative (4) | Referable | Level 0 | 0.0016 | Non-Referable | **FN** |
| `Level4/e9f82b5bbaf4.png` | Proliferative (4) | Referable | Level 2 | 0.9669 | Referable | **TP** |
| `Level4/e9faf0296643.png` | Proliferative (4) | Referable | Level 0 | 0.0136 | Non-Referable | **FN** |

---

## 4. Methodological Transparency & Limitations

1. **Sample Cohort:** Evaluated on the 15 held-out verification fundus photographs from the APTOS development split.
2. **False Negative Risk:** The empirical evaluation reveals that several high-grade cases (Levels 3 and 4) were predicted as Level 0 by the fine-tuned checkpoint on this small sample, yielding a sensitivity of 22.2% on this split.
3. **No Metric Fabrication:** Unlike academic targets ($93\%$ sensitivity), these empirical metrics reflect the actual output of `DR_EfficientNetB0_V2.keras`.
4. **Clinical Governance:** This objective finding proves the necessity of the **Doctor-in-the-Loop** model: AI predictions must serve strictly as assistive triage guidance, and every case must receive certified ophthalmologist review.
