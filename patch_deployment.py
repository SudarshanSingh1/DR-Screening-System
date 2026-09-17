import re

with open('README.md', 'r') as f:
    content = f.read()

deployment_section = """
---

## Deployment

### Render

**Architecture:**
- **Frontend**: Vite React SPA (Nginx Container)
- **Backend API**: Node.js Express Server
- **PostgreSQL**: Managed Render Database
- **Inference Service**: Python FastAPI

The core platform (Frontend, Backend, Database, and Python Inference Service) is fully configured for deployment on Render via the included `render.yaml` Blueprint.

> **MATLAB Engine Limitation:**
> The current production V2 inference pipeline utilizes a standalone translated Keras model (`DR_EfficientNetB0_V2.keras`) running strictly in Python (TensorFlow + FastAPI) to provide DR classification and Grad-CAM explainability. MATLAB Engine deployment requires additional interactive licensing/runtime infrastructure and is not claimed as Render-hosted until validated. MATLAB files remain in `matlab/` for simulation and reference.

See [RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md) for full deployment instructions, environment variables, and persistent storage configurations.
"""

# Replace the existing Docker Deployment section with the new Deployment section
content = re.sub(
    r'## Docker Deployment.*?---',
    deployment_section.strip() + '\n\n---',
    content,
    flags=re.DOTALL
)

with open('README.md', 'w') as f:
    f.write(content)

print("Updated README with Deployment section")
