# Medical AI Evaluation Protocol — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Standard Operating Procedure (SOP)  

---

## 1. Clinical Objectives & Target Standards

The primary clinical objective of diabetic retinopathy screening in community health camps is to identify individuals requiring specialist referral (**Referable DR**) while minimizing false negatives that could lead to preventable blindness.

### Clinical Target Standards (SIH Requirements):
- **Sensitivity (Recall for Referable DR):** $> 90.0\%$ (Target: $\ge 93.0\%$)
- **Specificity (Non-referable rule-out):** $> 85.0\%$ (Target: $\ge 87.5\%$)
- **Quadratic Weighted Kappa (QWK):** $> 0.85$

> [!IMPORTANT]
> These metrics represent **developmental targets**. Autonomous diagnostic claims are prohibited until confirmed by prospective multi-center clinical trials.

---

## 2. Mathematical Metric Definitions

Let the binary contingency table for Referable DR (Level $\ge 2$) be defined as:
- $\text{TP}$: True Positives (Actual Referable, Predicted Referable)
- $\text{FP}$: False Positives (Actual Non-referable, Predicted Referable)
- $\text{TN}$: True Negatives (Actual Non-referable, Predicted Non-referable)
- $\text{FN}$: False Negatives (Actual Referable, Predicted Non-referable)

### 2.1 Diagnostic Sensitivity
$$\text{Sensitivity} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

### 2.2 Diagnostic Specificity
$$\text{Specificity} = \frac{\text{TN}}{\text{TN} + \text{FP}}$$

### 2.3 Positive Predictive Value (Precision)
$$\text{PPV} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$

### 2.4 Negative Predictive Value (NPV)
$$\text{NPV} = \frac{\text{TN}}{\text{TN} + \text{FN}}$$

### 2.5 Wilson Score 95% Confidence Interval
For small sample sizes ($N < 100$), standard asymptotic Gaussian intervals severely under-cover true variance. We enforce the asymmetric Wilson score interval with continuity correction:
$$\text{CI}_{95\%} = \frac{p + \frac{z^2}{2n} \pm z \sqrt{\frac{p(1-p)}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$
where $z = 1.95996$ for a two-sided $95\%$ confidence level.

---

## 3. Empirical Verification Benchmark ($N=15$)

The production model `DR_EfficientNetB0_V2.keras` was evaluated on the held-out verification split using [`evaluation/scripts/evaluate_referable_dr.py`](file:///Users/sudarshankumar/DR-Screening-System/evaluation/scripts/evaluate_referable_dr.py).

### 3.1 Contingency Table
```text
                             Predicted Non-Referable     Predicted Referable
Actual Non-Referable (0–1)           TN = 3                    FP = 3
Actual Referable (2–4)               FN = 7                    TP = 2
```

### 3.2 Evaluated Diagnostic Metrics

| Metric | Score ($N=15$) | 95% Wilson Score CI | Clinical Target |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **22.2%** (2/9) | [6.3%, 54.7%] | $\ge 93.0\%$ |
| **Specificity** | **50.0%** (3/6) | [18.8%, 81.2%] | $\ge 87.5\%$ |
| **Precision (PPV)** | **40.0%** (2/5) | [11.8%, 76.9%] | High yield |
| **Negative Predictive Value (NPV)** | **30.0%** (3/10) | [10.8%, 60.3%] | High rule-out |
| **Overall Accuracy** | **33.3%** (5/15) | [15.2%, 58.3%] | High multi-class |
| **Binary F1-Score** | **0.2857** | — | $\ge 0.8800$ |

### 3.3 Clinical Implications
- **High False Negative Rate:** The fine-tuned checkpoint under-predicts advanced disease on this challenge split.
- **Mandatory Doctor Review:** This empirical proof justifies the strict **Doctor-in-the-Loop** policy: the AI model must never be used as a standalone authority.
