# Model Evaluation Framework — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Reproducible Evaluation Guide  

---

## 1. Directory Structure

```text
evaluation/
├── scripts/
│   └── evaluate_referable_dr.py     # Standalone reproducible evaluation runner
├── tests/
│   └── test_evaluation_pipeline.py # Unit tests for Wilson CIs and metric math
├── reports/
│   ├── evaluation_report.md         # Evaluated Markdown report for N=15 benchmark split
│   └── evaluation_report.json       # Structured machine-readable JSON metrics
└── README.md                        # This documentation
```

---

## 2. Quick Execution

To evaluate the production classifier on the held-out verification benchmark:

```bash
python3 evaluation/scripts/evaluate_referable_dr.py
```

To run the evaluation unit tests:
```bash
python3 -m unittest discover -s evaluation/tests
```

---

## 3. Metrics Calculated

- **Contingency Matrix:** True Positives (TP), False Positives (FP), True Negatives (TN), False Negatives (FN).
- **Referable Decision Rule:** $P(\text{Referable}) = \sum_{c=2}^4 p_c \ge 0.20798$
- **Sensitivity & Specificity:** With 95% asymmetric Wilson score confidence intervals.
- **Precision (PPV) & Negative Predictive Value (NPV).**
- **Accuracy and Binary F1-score.**
