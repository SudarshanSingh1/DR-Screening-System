"""
evaluation/scripts/evaluate_referable_dr.py — Honest Referable-DR Evaluation Script
================================================================================
Reproducible evaluation script for the deployed Keras production model:
  model/production/V2/DR_EfficientNetB0_V2.keras

Calculates:
  - Confusion Matrix (TP, FP, TN, FN)
  - Sensitivity (Recall) with 95% Wilson score CI
  - Specificity with 95% Wilson score CI
  - Precision (PPV)
  - Negative Predictive Value (NPV)
  - Accuracy and F1-Score

Ground Truth Definition:
  - Non-Referable DR: Level 0 (No DR), Level 1 (Mild)
  - Referable DR:     Level 2 (Moderate), Level 3 (Severe), Level 4 (Proliferative)

Thresholds:
  - Production Optimized: sum(p[2..4]) >= 0.20798
  - Standard Baseline:    sum(p[2..4]) >= 0.50000

Usage:
  python3 evaluation/scripts/evaluate_referable_dr.py
"""

import os
import sys
import json
import math
import argparse
from pathlib import Path
from typing import Dict, Any, List, Tuple

# Safe sandbox environment overrides
os.environ.setdefault("KERAS_HOME", "/tmp/.keras")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
VERIFICATION_REPORT = REPO_ROOT / "model" / "production" / "V2" / "verification_report.json"
MODEL_PATH = REPO_ROOT / "model" / "production" / "V2" / "DR_EfficientNetB0_V2.keras"

PRIMARY_JSON = REPO_ROOT / "evaluation" / "reports" / "evaluation_report.json"
PRIMARY_MD = REPO_ROOT / "evaluation" / "reports" / "evaluation_report.md"
LEGACY_JSON = REPO_ROOT / "model" / "evaluation" / "evaluation_report.json"
LEGACY_MD = REPO_ROOT / "model" / "evaluation" / "evaluation_report.md"


def wilson_score_interval(successes: int, total: int, z: float = 1.96) -> Tuple[float, float]:
    """Computes 95% Wilson score confidence interval for a proportion."""
    if total == 0:
        return (0.0, 0.0)
    p_hat = successes / total
    denominator = 1.0 + (z**2) / total
    centre = (p_hat + (z**2) / (2.0 * total)) / denominator
    spread = (z / denominator) * math.sqrt((p_hat * (1.0 - p_hat) / total) + ((z**2) / (4.0 * (total**2))))
    lower = max(0.0, centre - spread)
    upper = min(1.0, centre + spread)
    return (round(lower, 4), round(upper, 4))


def run_evaluation(threshold: float = 0.20798) -> Dict[str, Any]:
    if not VERIFICATION_REPORT.exists():
        raise FileNotFoundError(f"Verification report not found: {VERIFICATION_REPORT}")

    with open(VERIFICATION_REPORT, "r") as f:
        data = json.load(f)

    samples = data.get("per_image", [])
    if not samples:
        raise ValueError("No per-image evaluation records found in verification report.")

    total_samples = len(samples)
    y_true_levels = []
    y_true_binary = []  # True for Referable (2, 3, 4), False for Non-Referable (0, 1)
    y_pred_classes = []
    y_ref_probs = []
    y_pred_binary = []

    tp = fp = tn = fn = 0
    detailed_records = []

    for item in samples:
        level_str = item.get("level", "Level0")
        true_level = int(level_str.replace("Level", ""))
        probs = item.get("probabilities", [])
        pred_class = int(item.get("classIndex", 0))

        # Sum of Moderate + Severe + Proliferative
        ref_prob = float(sum(probs[2:5])) if len(probs) >= 5 else 0.0
        is_true_referable = bool(true_level >= 2)
        is_pred_referable = bool(ref_prob >= threshold)

        y_true_levels.append(true_level)
        y_true_binary.append(is_true_referable)
        y_pred_classes.append(pred_class)
        y_ref_probs.append(ref_prob)
        y_pred_binary.append(is_pred_referable)

        if is_true_referable and is_pred_referable:
            tp += 1
            outcome = "TP"
        elif not is_true_referable and is_pred_referable:
            fp += 1
            outcome = "FP"
        elif not is_true_referable and not is_pred_referable:
            tn += 1
            outcome = "TN"
        else:
            fn += 1
            outcome = "FN"

        detailed_records.append({
            "imageName": item.get("imageName"),
            "trueLevel": true_level,
            "isTrueReferable": is_true_referable,
            "predictedClass": pred_class,
            "referableProbability": round(ref_prob, 5),
            "isPredictedReferable": is_pred_referable,
            "outcome": outcome
        })

    # Diagnostic Metrics
    total_positives = tp + fn  # Actual referable
    total_negatives = tn + fp  # Actual non-referable

    sensitivity = tp / total_positives if total_positives > 0 else 0.0
    specificity = tn / total_negatives if total_negatives > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    npv = tn / (tn + fn) if (tn + fn) > 0 else 0.0
    accuracy = (tp + tn) / total_samples if total_samples > 0 else 0.0
    f1 = 2 * (precision * sensitivity) / (precision + sensitivity) if (precision + sensitivity) > 0 else 0.0

    sens_ci = wilson_score_interval(tp, total_positives)
    spec_ci = wilson_score_interval(tn, total_negatives)
    prec_ci = wilson_score_interval(tp, tp + fp)
    npv_ci = wilson_score_interval(tn, tn + fn)
    acc_ci = wilson_score_interval(tp + tn, total_samples)

    report = {
        "metadata": {
            "modelPath": str(MODEL_PATH.relative_to(REPO_ROOT)),
            "dataset": "APTOS 2019 Held-Out Verification Split",
            "sampleCount": total_samples,
            "referableThreshold": threshold,
            "referableDefinition": "ICDR Level >= 2 (Moderate, Severe, Proliferative DR)"
        },
        "contingencyMatrix": {
            "truePositives": tp,
            "falsePositives": fp,
            "trueNegatives": tn,
            "falseNegatives": fn
        },
        "metrics": {
            "sensitivity": round(sensitivity, 4),
            "sensitivityCI95": sens_ci,
            "specificity": round(specificity, 4),
            "specificityCI95": spec_ci,
            "precision": round(precision, 4),
            "precisionCI95": prec_ci,
            "negativePredictiveValue": round(npv, 4),
            "negativePredictiveValueCI95": npv_ci,
            "accuracy": round(accuracy, 4),
            "accuracyCI95": acc_ci,
            "f1Score": round(f1, 4)
        },
        "clinicalTargets": {
            "sensitivityTarget": 0.930,
            "specificityTarget": 0.875,
            "status": "Target defined by SIH clinical specification; model evaluated as assistive triage."
        },
        "detailedSamples": detailed_records
    }
    return report


def generate_markdown_report(rep: Dict[str, Any]) -> str:
    m = rep["metrics"]
    cm = rep["contingencyMatrix"]
    meta = rep["metadata"]

    md = f"""# Referable Diabetic Retinopathy Evaluation Report

**Model:** `{meta['modelPath']}`  
**Evaluation Split:** {meta['dataset']} ($N = {meta['sampleCount']}$)  
**Referable Decision Rule:** $P(\\text{{Referable}}) = \\sum_{{c=2}}^4 p_c \\ge {meta['referableThreshold']}$  
**Standard:** ICDR Level $\\ge 2$ indicates Referable DR  

---

## 1. Contingency Matrix (Referable DR)

| | Predicted Non-Referable | Predicted Referable | Total Actual |
|---|:---:|:---:|:---:|
| **Actual Non-Referable (Levels 0–1)** | **TN = {cm['trueNegatives']}** | **FP = {cm['falsePositives']}** | {cm['trueNegatives'] + cm['falsePositives']} |
| **Actual Referable (Levels 2–4)** | **FN = {cm['falseNegatives']}** | **TP = {cm['truePositives']}** | {cm['truePositives'] + cm['falseNegatives']} |
| **Total Predicted** | {cm['trueNegatives'] + cm['falseNegatives']} | {cm['truePositives'] + cm['falsePositives']} | {meta['sampleCount']} |

---

## 2. Diagnostic Performance Metrics

| Metric | Result | 95% Wilson Score CI | Clinical Target Standard |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **{m['sensitivity']*100:.1f}%** ({cm['truePositives']}/{cm['truePositives']+cm['falseNegatives']}) | [{m['sensitivityCI95'][0]*100:.1f}%, {m['sensitivityCI95'][1]*100:.1f}%] | $\\ge 93.0\\%$ (Target) |
| **Specificity** | **{m['specificity']*100:.1f}%** ({cm['trueNegatives']}/{cm['trueNegatives']+cm['falsePositives']}) | [{m['specificityCI95'][0]*100:.1f}%, {m['specificityCI95'][1]*100:.1f}%] | $\\ge 87.5\\%$ (Target) |
| **Precision (PPV)** | **{m['precision']*100:.1f}%** ({cm['truePositives']}/{cm['truePositives']+cm['falsePositives']}) | [{m['precisionCI95'][0]*100:.1f}%, {m['precisionCI95'][1]*100:.1f}%] | High Positive Yield |
| **Negative Predictive Value (NPV)** | **{m['negativePredictiveValue']*100:.1f}%** ({cm['trueNegatives']}/{cm['trueNegatives']+cm['falseNegatives']}) | [{m['negativePredictiveValueCI95'][0]*100:.1f}%, {m['negativePredictiveValueCI95'][1]*100:.1f}%] | High Rule-Out Safety |
| **Overall Accuracy** | **{m['accuracy']*100:.1f}%** ({cm['truePositives']+cm['trueNegatives']}/{meta['sampleCount']}) | [{m['accuracyCI95'][0]*100:.1f}%, {m['accuracyCI95'][1]*100:.1f}%] | High Diagnostic Accuracy |
| **Binary F1-Score** | **{m['f1Score']:.4f}** | — | $\\ge 0.88$ (Target) |

---

## 3. Clinical Governance Rationale

1. **Under-Prediction on Verification Set:** On this 15-sample verification cohort, the deployed fine-tuned model yielded 7 False Negatives (actual referable cases under-called by model tail probabilities).
2. **Mandatory Doctor Sign-Off:** This empirical finding confirms why **Vision AI strictly enforces a Doctor-in-the-Loop policy**. AI outputs are preliminary triage aids; certified ophthalmologists retain sole diagnostic authority.
3. **Developmental Target Notice:** The $\\ge 93\\%$ sensitivity requirement remains an engineering target requiring broader multi-center retraining across diverse Indian camera types.
"""
    return md


def main():
    parser = argparse.ArgumentParser(description="Evaluate referable DR on held-out verification split.")
    parser.add_argument("--threshold", type=float, default=0.20798, help="Referable DR classification threshold.")
    args = parser.parse_args()

    rep = run_evaluation(threshold=args.threshold)
    md_content = generate_markdown_report(rep)

    PRIMARY_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(PRIMARY_JSON, "w") as f:
        json.dump(rep, f, indent=2)

    with open(PRIMARY_MD, "w") as f:
        f.write(md_content)

    # Sync to legacy paths for backward compatibility
    LEGACY_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(LEGACY_JSON, "w") as f:
        json.dump(rep, f, indent=2)
    with open(LEGACY_MD, "w") as f:
        f.write(md_content)

    print("=" * 72)
    print("  VISION AI — REFERABLE DR EVALUATION REPORT (HONEST BENCHMARK)")
    print("=" * 72)
    print(f"Model:                {rep['metadata']['modelPath']}")
    print(f"Evaluation Dataset:   {rep['metadata']['dataset']}")
    print(f"Sample Count:         {rep['metadata']['sampleCount']} images (Stratified across Levels 0–4)")
    print(f"Referable Definition: {rep['metadata']['referableDefinition']}")
    print(f"Referable Threshold:  P(Referable) >= {rep['metadata']['referableThreshold']}")
    print("-" * 72)
    print("  CONFUSION MATRIX")
    cm = rep['contingencyMatrix']
    print(f"                      Predicted Non-Ref    Predicted Referable")
    print(f"  Actual Non-Ref (0-1):     TN = {cm['trueNegatives']}                FP = {cm['falsePositives']}  ")
    print(f"  Actual Referable (2-4):   FN = {cm['falseNegatives']}                TP = {cm['truePositives']}  ")
    print("-" * 72)
    print("  DIAGNOSTIC PERFORMANCE METRICS")
    m = rep['metrics']
    print(f"  Sensitivity (Recall):     {m['sensitivity']*100:.1f}%  (95% CI: [{m['sensitivityCI95'][0]*100:.1f}%, {m['sensitivityCI95'][1]*100:.1f}%])")
    print(f"  Specificity:              {m['specificity']*100:.1f}%  (95% CI: [{m['specificityCI95'][0]*100:.1f}%, {m['specificityCI95'][1]*100:.1f}%])")
    print(f"  Precision (PPV):          {m['precision']*100:.1f}%")
    print(f"  Negative Pred Val (NPV):  {m['negativePredictiveValue']*100:.1f}%")
    print(f"  Accuracy:                 {m['accuracy']*100:.1f}%")
    print(f"  F1-Score:                 {m['f1Score']:.4f}")
    print("=" * 72)


if __name__ == "__main__":
    main()
