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

export async function provideEvidence(filePath: string, fileName: string): Promise<StructuredEvidence> {
  const { analyzeImage } = await import('./inference.service');
  
  // Call the Python inference service
  const result = await analyzeImage(filePath, fileName, 'image/jpeg');
  
  if (!result || !result.success) {
    throw new Error('Inference failed to return success');
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
  } as any;
}
