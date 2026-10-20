#!/usr/bin/env python3
"""
scripts/verify_environment.py
=============================
Verifies development environment prerequisites and model artifacts for Vision AI:
- Python 3.10+
- Key packages (fastapi, PIL, numpy, tensorflow/torch where available)
- Model artifact presence
- Node and Docker environment readiness
"""

import sys
import shutil
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

print("=" * 60)
print("  VISION AI — ENVIRONMENT & ARTIFACT VERIFICATION")
print("=" * 60)

# 1. Python Check
py_version = sys.version_info
print(f"Python Version: {py_version.major}.{py_version.minor}.{py_version.micro} ... ", end="")
if py_version >= (3, 10):
    print("OK")
else:
    print("WARNING (Recommended: Python 3.10+)")

# 2. Package Checks
packages = ["fastapi", "uvicorn", "PIL", "numpy"]
for pkg in packages:
    try:
        __import__(pkg)
        print(f"Package '{pkg}': OK")
    except ImportError:
        print(f"Package '{pkg}': NOT INSTALLED (Required for inference service)")

# 3. Model Artifacts Check
model_path = REPO_ROOT / "model" / "production" / "V2" / "DR_EfficientNetB0_V2.keras"
ref_mat_path = REPO_ROOT / "model" / "reference" / "DR_EfficientNetB0_V2.mat"
config_path = REPO_ROOT / "model" / "config" / "model_config.json"

print(f"Production Model ({model_path.name}): {'EXISTS' if model_path.exists() else 'MISSING'}")
print(f"Reference MATLAB Model ({ref_mat_path.name}): {'EXISTS' if ref_mat_path.exists() else 'MISSING'}")
print(f"Model Configuration ({config_path.name}): {'EXISTS' if config_path.exists() else 'MISSING'}")

# 4. Tooling
docker_bin = shutil.which("docker")
node_bin = shutil.which("node")
print(f"Docker CLI: {'AVAILABLE (' + docker_bin + ')' if docker_bin else 'NOT FOUND'}")
print(f"Node.js CLI: {'AVAILABLE (' + node_bin + ')' if node_bin else 'NOT FOUND'}")

print("=" * 60)
print("Environment check complete.")
print("=" * 60)
