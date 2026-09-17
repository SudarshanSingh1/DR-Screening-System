# Vision AI — Python Inference Service
# Pure Python ML container — no MATLAB required for production inference.
# MATLAB files are retained in the repository but not installed here.

FROM python:3.11-slim

# Install OS-level image processing libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (TensorFlow, FastAPI, Pillow, etc.)
COPY inference_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy inference service source code
COPY inference_service/main.py .

# Copy the production V2 model and model config
# model/production/V2/DR_EfficientNetB0_V2.keras — converted from MATLAB .mat
# model/config/model_config.json                  — class names, thresholds
COPY model/production/V2 ./model/production/V2
COPY model/config        ./model/config

# Default inference provider: python_v2
# Override with: docker run -e ACTIVE_PROVIDER=matlab_v2 ... (future)
ENV ACTIVE_PROVIDER=python_v2

EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
