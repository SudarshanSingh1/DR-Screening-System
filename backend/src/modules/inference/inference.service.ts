import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const INFERENCE_SERVICE_URL = process.env.INFERENCE_SERVICE_URL || 'http://localhost:8000';
// Inference can take time for a cold model load; default 60s
const INFERENCE_TIMEOUT_MS = parseInt(process.env.INFERENCE_TIMEOUT_MS ?? '60000', 10);

export async function analyzeImage(filePath: string, fileName: string, mimeType: string = 'application/octet-stream'): Promise<any> {
  if (!fs.existsSync(filePath)) {
    throw Object.assign(new Error('Temp file not found for inference'), { status: 500, code: 'INTERNAL_ERROR' });
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), {
    filename: fileName,
    contentType: mimeType,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INFERENCE_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${INFERENCE_SERVICE_URL}/analyze/single`, {
      method: 'POST',
      body: formData,
      signal: controller.signal as any,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw Object.assign(
        new Error(`Inference timed out after ${INFERENCE_TIMEOUT_MS / 1000}s`),
        { status: 504, code: 'INFERENCE_TIMEOUT' }
      );
    }
    throw Object.assign(
      new Error(`Cannot reach inference service at ${INFERENCE_SERVICE_URL}: ${err.message}`),
      { status: 503, code: 'INFERENCE_SERVICE_UNAVAILABLE' }
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as any;
    const detail = body?.detail || response.statusText;
    throw Object.assign(
      new Error(`Inference service returned ${response.status}: ${detail}`),
      {
        status: response.status === 503 ? 503 : 502,
        code: response.status === 503 ? 'INFERENCE_SERVICE_UNAVAILABLE' : 'INFERENCE_FAILED',
      }
    );
  }

  const result = await response.json();
  return result;
}
