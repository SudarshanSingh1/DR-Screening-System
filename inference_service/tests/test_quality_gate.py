"""
inference_service/tests/test_quality_gate.py — Unit Tests for Image Quality Gate
"""

import unittest
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

from inference_service.quality_gate import (
    evaluate_image_quality,
    DEFAULT_QUALITY_CONFIG,
)


class TestImageQualityGate(unittest.TestCase):
    def setUp(self):
        # Create a realistic synthetic fundus image (256x256 RGB)
        self.good_img = np.zeros((256, 256, 3), dtype=np.uint8)
        y, x = np.ogrid[:256, :256]
        # Retinal disc mask
        mask = (x - 128)**2 + (y - 128)**2 <= 110**2
        self.good_img[mask] = [170, 75, 30]
        # Optic disc (bright structure with sharp edges)
        od_mask = (x - 80)**2 + (y - 128)**2 <= 25**2
        self.good_img[od_mask] = [245, 220, 140]
        # Retinal vessel lines (sharp dark edges)
        self.good_img[126:130, 80:200] = [70, 20, 10]
        self.good_img[100:180, 138:142] = [65, 20, 10]

    def test_good_quality_synthetic_image_passes(self):
        result = evaluate_image_quality(self.good_img)
        self.assertTrue(result["passed"])
        self.assertEqual(result["status"], "PASS")
        self.assertIsNone(result["reason"])
        self.assertEqual(result["action"], "PROCEED")
        self.assertGreater(result["metrics"]["sharpness"], DEFAULT_QUALITY_CONFIG["min_sharpness"])

    def test_blurry_image_fails(self):
        # Deliberately degrade by applying severe Gaussian blur
        pil_img = Image.fromarray(self.good_img)
        blurred_pil = pil_img.filter(ImageFilter.GaussianBlur(radius=8))
        blurred_arr = np.array(blurred_pil)

        result = evaluate_image_quality(blurred_arr)
        self.assertFalse(result["passed"])
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(result["action"], "RECAPTURE_REQUIRED")
        self.assertIn("Defocus/motion blur detected", result["reason"])

    def test_dark_image_fails(self):
        dark_img = np.zeros((256, 256, 3), dtype=np.uint8)
        # Retinal field with very low brightness (above 15 to register foreground, but below 30)
        y, x = np.ogrid[:256, :256]
        mask = (x - 128)**2 + (y - 128)**2 <= 110**2
        dark_img[mask] = [24, 20, 18]

        result = evaluate_image_quality(dark_img)
        self.assertFalse(result["passed"])
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(result["action"], "RECAPTURE_REQUIRED")
        self.assertIn("underexposure", result["reason"].lower())

    def test_overexposed_image_fails(self):
        bright_img = np.full((256, 256, 3), 245, dtype=np.uint8)

        result = evaluate_image_quality(bright_img)
        self.assertFalse(result["passed"])
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(result["action"], "RECAPTURE_REQUIRED")
        self.assertIn("overexposure", result["reason"].lower())

    def test_tiny_dimension_fails(self):
        tiny_img = np.zeros((100, 100, 3), dtype=np.uint8)

        result = evaluate_image_quality(tiny_img)
        self.assertFalse(result["passed"])
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(result["action"], "RECAPTURE_REQUIRED")
        self.assertIn("dimensions", result["reason"].lower())

    def test_unsuitable_aspect_ratio_fails(self):
        wide_img = np.zeros((200, 700, 3), dtype=np.uint8)

        result = evaluate_image_quality(wide_img)
        self.assertFalse(result["passed"])
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(result["action"], "RECAPTURE_REQUIRED")
        self.assertIn("aspect ratio", result["reason"].lower())

    def test_custom_thresholds_override(self):
        custom_cfg = {"min_sharpness": 10000.0}  # Unrealistically high
        result = evaluate_image_quality(self.good_img, config=custom_cfg)
        self.assertFalse(result["passed"])
        self.assertIn("blur", result["reason"].lower())

    def test_all_reference_fundus_images_pass(self):
        fundus_dir = Path("frontend/public/images/fundus")
        for level in range(5):
            path = fundus_dir / f"level{level}.png"
            if path.exists():
                img = Image.open(path).convert("RGB")
                arr = np.array(img, dtype=np.uint8)
                res = evaluate_image_quality(arr)
                self.assertTrue(
                    res["passed"],
                    f"Sample {path.name} failed quality check: {res.get('reason')}"
                )
                self.assertEqual(res["status"], "PASS")


if __name__ == "__main__":
    unittest.main()
