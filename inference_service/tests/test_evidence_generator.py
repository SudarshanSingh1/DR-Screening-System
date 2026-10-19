import unittest
import numpy as np
from inference_service.evidence_generator import (
    generate_quality_evidence,
    generate_disc_fovea_evidence,
    generate_lesion_evidence,
)

class TestEvidenceGenerator(unittest.TestCase):
    def setUp(self):
        # Create a synthetic 224x224 RGB image array (uint8)
        self.synthetic_img = np.zeros((224, 224, 3), dtype=np.uint8)
        # Add central simulated circular retinal field
        y, x = np.ogrid[:224, :224]
        mask = (x - 112)**2 + (y - 112)**2 <= 100**2
        self.synthetic_img[mask] = [180, 80, 40]
        # Add bright spot for optic disc
        self.synthetic_img[100:120, 50:70] = [240, 220, 150]

    def test_quality_evidence_returns_base64_data_uri(self):
        res = generate_quality_evidence(self.synthetic_img)
        self.assertIsInstance(res, str)
        self.assertTrue(res.startswith("data:image/png;base64,"))
        self.assertGreater(len(res), 100)

    def test_disc_fovea_evidence_returns_base64_data_uri(self):
        res = generate_disc_fovea_evidence(self.synthetic_img)
        self.assertIsInstance(res, str)
        self.assertTrue(res.startswith("data:image/png;base64,"))
        self.assertGreater(len(res), 100)

    def test_lesion_evidence_returns_base64_data_uri(self):
        res = generate_lesion_evidence(self.synthetic_img)
        self.assertIsInstance(res, str)
        self.assertTrue(res.startswith("data:image/png;base64,"))
        self.assertGreater(len(res), 100)

if __name__ == "__main__":
    unittest.main()
