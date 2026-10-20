"""
evaluation/tests/test_evaluation_pipeline.py
============================================
Unit tests for the referable-DR evaluation pipeline and metric calculations:
- Wilson score interval calculation
- Metric derivation (Sensitivity, Specificity, PPV, NPV, F1)
- Report format integrity
"""

import math
import unittest
from pathlib import Path
import sys

# Add evaluation/scripts to path
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from evaluate_referable_dr import wilson_score_interval, run_evaluation


class TestEvaluationPipeline(unittest.TestCase):
    def test_wilson_score_interval_bounds(self):
        """Wilson score interval must lie within [0.0, 1.0]."""
        lower, upper = wilson_score_interval(2, 9)
        self.assertGreaterEqual(lower, 0.0)
        self.assertLessEqual(upper, 1.0)
        self.assertLess(lower, upper)
        self.assertAlmostEqual(lower, 0.0631, places=3)
        self.assertAlmostEqual(upper, 0.5474, places=3)

    def test_wilson_score_interval_edge_cases(self):
        """Zero successes or zero total must return valid bounded intervals."""
        self.assertEqual(wilson_score_interval(0, 0), (0.0, 0.0))
        lower, upper = wilson_score_interval(0, 10)
        self.assertEqual(lower, 0.0)
        self.assertGreater(upper, 0.0)

    def test_run_evaluation_structure(self):
        """Evaluation execution must return verified schema and metrics."""
        rep = run_evaluation(threshold=0.20798)
        self.assertIn("contingencyMatrix", rep)
        self.assertIn("metrics", rep)
        self.assertIn("metadata", rep)

        cm = rep["contingencyMatrix"]
        self.assertEqual(cm["truePositives"] + cm["falseNegatives"], 9)
        self.assertEqual(cm["trueNegatives"] + cm["falsePositives"], 6)

        m = rep["metrics"]
        self.assertAlmostEqual(m["sensitivity"], 2 / 9, places=3)
        self.assertAlmostEqual(m["specificity"], 3 / 6, places=3)
        self.assertAlmostEqual(m["accuracy"], 5 / 15, places=3)


if __name__ == "__main__":
    unittest.main()
