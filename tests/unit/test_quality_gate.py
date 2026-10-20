"""
tests/unit/test_quality_gate.py
===============================
Root-level unit tests for the Vision AI Image Quality Gate.
"""

import sys
import unittest
from pathlib import Path

# Add inference_service to path
INFERENCE_DIR = Path(__file__).resolve().parent.parent.parent / "inference_service"
sys.path.insert(0, str(INFERENCE_DIR))

from tests.test_quality_gate import TestImageQualityGate


if __name__ == "__main__":
    unittest.main()
