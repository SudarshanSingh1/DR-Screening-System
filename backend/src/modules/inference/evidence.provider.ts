import path from 'path';
import crypto from 'crypto';

export interface StructuredEvidence {
  grade: number;
  gradeLabel: string;
  referable: boolean;
  confidence: number;
  probabilities: Record<number, number>;
  qualityEvidence: string;
  vesselEvidence: string;
  discFoveaEvidence: string;
  lesionEvidence: string;
  gradCamEvidence: string;
}

const CLASS_NAMES = [
  "No DR",
  "Mild DR",
  "Moderate DR",
  "Severe DR",
  "Proliferative DR"
];

export async function provideEvidence(filePath: string, fileName: string, overrideClass?: number): Promise<StructuredEvidence> {
  const { analyzeImage } = await import('./inference.service');
  
  // Call the Python inference service
  const result = await analyzeImage(filePath, fileName, 'image/jpeg', overrideClass);
  
  if (!result || !result.success) {
    if (result?.qualityGate && !result.qualityGate.passed) {
      throw Object.assign(
        new Error(`Image Quality Check Failed: ${result.qualityGate.reason}`),
        { status: 422, code: 'QUALITY_CHECK_FAILED', qualityGate: result.qualityGate }
      );
    }
    throw new Error(result?.detail || 'Inference failed to return success');
  }

  // The python service has been modified to return all 5 evidence assets as base64
  return {
    grade: result.prediction.classIndex,
    gradeLabel: result.prediction.label,
    referable: result.isReferable,
    confidence: result.prediction.confidence,
    probabilities: result.probabilities,
    qualityEvidence: result.qualityEvidence,
    vesselEvidence: result.vesselEvidence,
    discFoveaEvidence: result.discFoveaEvidence,
    lesionEvidence: result.lesionEvidence,
    gradCamEvidence: result.gradCam,
    qualityGate: result.qualityGate,
  } as any;
}
