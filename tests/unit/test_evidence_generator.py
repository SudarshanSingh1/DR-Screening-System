"""
tests/unit/test_evidence_generator.py
=====================================
Root-level unit tests for visual evidence generation.
"""

import sys
import unittest
from pathlib import Path

INFERENCE_DIR = Path(__file__).resolve().parent.parent.parent / "inference_service"
sys.path.insert(0, str(INFERENCE_DIR))

from tests.test_evidence_generator import TestEvidenceGenerator


if __name__ == "__main__":
    unittest.main()
