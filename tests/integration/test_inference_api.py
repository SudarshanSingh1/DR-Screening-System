"""
tests/integration/test_inference_api.py
=======================================
Integration tests for FastAPI inference microservice endpoints:
- GET /health
- POST /quality-check (Valid vs Defective input)
- POST /analyze validation
"""

import os
import io
import sys
import unittest
from pathlib import Path
from PIL import Image

os.environ.setdefault("KERAS_HOME", "/tmp/.keras")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

INFERENCE_DIR = Path(__file__).resolve().parent.parent.parent / "inference_service"
sys.path.insert(0, str(INFERENCE_DIR))

from fastapi.testclient import TestClient
import main
from main import app


class TestInferenceAPIIntegration(unittest.TestCase):
    def test_health_endpoint(self):
        """GET /health must return status ok when provider is loaded."""
        with TestClient(app) as client:
            response = client.get("/health")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("status"), "healthy")
            self.assertIn("model", data)

    def test_quality_check_identifies_defective_images(self):
        """POST /quality-check must detect defective undersized images and return RECAPTURE_REQUIRED."""
        img = Image.new("RGB", (100, 100), color=(128, 128, 128))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        with TestClient(app) as client:
            response = client.post(
                "/quality-check",
                files={"file": ("tiny.png", buf.getvalue(), "image/png")}
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertFalse(data.get("passed"))
            self.assertEqual(data.get("status"), "FAIL")
            self.assertEqual(data.get("action"), "RECAPTURE_REQUIRED")
            self.assertIn("minimum diagnostic requirement", data.get("reason", ""))

    def test_analyze_requires_files(self):
        """POST /analyze must reject requests missing required files with 422."""
        with TestClient(app) as client:
            response = client.post("/analyze")
            self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
