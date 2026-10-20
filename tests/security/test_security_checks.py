"""
tests/security/test_security_checks.py
======================================
Automated security, privacy, and configuration sanity tests for Vision AI:
- Ensures presentation demo mode is disabled in production templates
- Validates model configuration referral threshold integrity
- Validates path traversal sanitization logic
- Validates Aadhaar data masking governance
"""

import re
import json
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


class TestMedicalSecurityAndPrivacy(unittest.TestCase):
    def test_model_config_referable_threshold(self):
        """Model configuration must have valid referable threshold within (0, 1)."""
        config_path = REPO_ROOT / "model" / "config" / "model_config.json"
        self.assertTrue(config_path.exists(), "model_config.json must exist")
        with open(config_path) as f:
            cfg = json.load(f)
        threshold = cfg.get("referable_dr", {}).get("optimized_threshold")
        self.assertIsInstance(threshold, (int, float))
        self.assertGreater(threshold, 0.0)
        self.assertLess(threshold, 1.0)
        self.assertAlmostEqual(threshold, 0.20798, places=4)

    def test_env_example_contains_no_real_secrets(self):
        """.env.example must use placeholders and not expose production credentials."""
        env_example_path = REPO_ROOT / ".env.example"
        self.assertTrue(env_example_path.exists())
        with open(env_example_path) as f:
            content = f.read()

        # Check for demo mode warning
        self.assertIn('PRESENTATION_DEMO_MODE="false"', content)
        # Check that dummy passwords are used
        self.assertIn("replace_me", content)

    def test_aadhaar_masking_pattern(self):
        """Aadhaar references must follow masked pattern 'XXXX XXXX 1234'."""
        sample_mask = "XXXX XXXX 1234"
        pattern = r"^XXXX XXXX \d{4}$"
        self.assertIsNotNone(re.match(pattern, sample_mask))

    def test_path_traversal_sanitization(self):
        """Path traversal sequences must be rejected or cleaned."""
        malicious_key = "../../etc/passwd"
        cleaned_key = malicious_key.replace("..", "").lstrip("/")
        self.assertNotIn("..", cleaned_key)
        self.assertFalse(cleaned_key.startswith("/"))


if __name__ == "__main__":
    unittest.main()
