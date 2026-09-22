import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle, X, AlertCircle, Activity, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { staffScreeningApi } from '../../../services/api/staffScreeningApi';

type AnalysisStage = 'UPLOADING' | 'VALIDATING' | 'INFERENCING' | 'GENERATING_GRADCAM' | 'DONE' | 'ERROR';

const STAGE_MESSAGES: Record<AnalysisStage, string> = {
  UPLOADING: 'Uploading images to temporary secure storage...',
  VALIDATING: 'Validating image quality and dimensions...',
  INFERENCING: 'Running V2 AI inference models...',
  GENERATING_GRADCAM: 'Generating Grad-CAM attention maps...',
  DONE: 'Analysis complete.',
  ERROR: 'An error occurred during analysis.'
};

export const NewScreeningWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPatient = location.state?.patient;
  
  const [step, setStep] = useState(1);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leftEyeFile, setLeftEyeFile] = useState<File | null>(null);
  const [rightEyeFile, setRightEyeFile] = useState<File | null>(null);
  const [leftPreviewUrl, setLeftPreviewUrl] = useState<string | null>(null);
  const [rightPreviewUrl, setRightPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('UPLOADING');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPatient) {
      navigate('/staff/patients');
    }
  }, [selectedPatient, navigate]);

  const handleStartScreening = async () => {
    if (!selectedPatient) return;
    setCreating(true);
    setError(null);
    try {
      const res = await staffScreeningApi.createScreening(selectedPatient.id);
      setScreeningId(res.id);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to start screening');
    } finally {
      setCreating(false);
    }
  };

  const validateFile = (file: File) => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/jpg'];
    if (!ALLOWED.includes(file.type)) {
      setFileError('Eye images must be JPEG, PNG, or BMP.');
      return false;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size must be under 15MB.');
      return false;
    }
    return true;
  };

  const handleFileChange = (eye: 'left' | 'right', file: File | null) => {
    setFileError(null);
    if (!file) return;
    if (!validateFile(file)) return;

    const url = URL.createObjectURL(file);
    if (eye === 'left') {
      setLeftEyeFile(file);
      setLeftPreviewUrl(url);
    } else {
      setRightEyeFile(file);
      setRightPreviewUrl(url);
    }
  };

  const clearFile = (eye: 'left' | 'right') => {
    if (eye === 'left') {
      setLeftEyeFile(null);
      setLeftPreviewUrl(null);
      if (leftFileInputRef.current) leftFileInputRef.current.value = '';
    } else {
      setRightEyeFile(null);
      setRightPreviewUrl(null);
      if (rightFileInputRef.current) rightFileInputRef.current.value = '';
    }
    setFileError(null);
  };

  const handleAnalyze = async () => {
    if (!leftEyeFile || !rightEyeFile) {
      setFileError('BOTH_EYE_IMAGES_REQUIRED: You must provide images for both eyes to proceed.');
      return;
    }
    if (!screeningId) return;

    setStep(3);
    setAnalysisStage('UPLOADING');
    setAnalysisError(null);

    try {
      setTimeout(() => setAnalysisStage('VALIDATING'), 1000);
      setTimeout(() => setAnalysisStage('INFERENCING'), 2000);
      
      const formData = new FormData();
      formData.append('leftEyeImage', leftEyeFile);
      formData.append('rightEyeImage', rightEyeFile);

      const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api/staff';
      const res = await fetch(`${API_BASE}/screenings/${screeningId}/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      let resJson: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resJson = await res.json();
      }

      setAnalysisStage('GENERATING_GRADCAM');
      
      if (!res.ok) {
        if (res.status === 413) throw new Error('The uploaded images are too large. Please reduce the file size.');
        throw new Error(resJson?.error || 'Failed to analyze images');
      }

      setAnalysisStage('DONE');
      setTimeout(() => {
        navigate(`/staff/screenings/${screeningId}/result`);
      }, 1000);
    } catch (err: any) {
      setAnalysisStage('ERROR');
      setAnalysisError(err.message);
    }
  };

  const resetAnalysis = () => {
    setStep(2);
    setAnalysisStage('UPLOADING');
    setAnalysisError(null);
  };

  if (!selectedPatient) return null;

  // Redirect to patient search if accessed directly without a patient
  useEffect(() => {
    if (!selectedPatient) {
      navigate('/staff/patients');
    }
  }, [selectedPatient, navigate]);

  if (!selectedPatient) {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Screening Workspace</h1>
          <p className="text-sm text-gray-500">
            {selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.id})
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {step === 1 && (
          <div className="p-8 text-center space-y-6">
            <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Activity className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Initiate Screening</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                You are about to start a new bilateral DR screening for {selectedPatient.firstName} {selectedPatient.lastName}.
                This will generate a new screening record.
              </p>
            </div>
            {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm max-w-md mx-auto">{error}</div>}
            <button
              onClick={handleStartScreening}
              disabled={creating}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating Workspace...' : 'Start Workspace'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Bilateral Fundus Capture</h2>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                SCR-{screeningId?.substring(0, 8)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-gray-700">LEFT EYE (OS)</h3>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition h-64 flex flex-col items-center justify-center ${leftEyeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  {!leftEyeFile ? (
                    <>
                      <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Drag & drop Left Eye</p>
                      <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 inline-block mt-4">
                        Browse
                        <input
                          ref={leftFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                          onChange={e => handleFileChange('left', e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </>
                  ) : (
                    <div className="w-full">
                      {leftPreviewUrl && <img src={leftPreviewUrl} alt="Left" className="h-40 mx-auto rounded-lg object-contain mb-3" />}
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium text-xs truncate max-w-[120px]">{leftEyeFile.name}</span>
                        <button onClick={() => clearFile('left')} className="text-red-400 hover:text-red-600 ml-1"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-700">RIGHT EYE (OD)</h3>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition h-64 flex flex-col items-center justify-center ${rightEyeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  {!rightEyeFile ? (
                    <>
                      <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Drag & drop Right Eye</p>
                      <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 inline-block mt-4">
                        Browse
                        <input
                          ref={rightFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                          onChange={e => handleFileChange('right', e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </>
                  ) : (
                    <div className="w-full">
                      {rightPreviewUrl && <img src={rightPreviewUrl} alt="Right" className="h-40 mx-auto rounded-lg object-contain mb-3" />}
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium text-xs truncate max-w-[120px]">{rightEyeFile.name}</span>
                        <button onClick={() => clearFile('right')} className="text-red-400 hover:text-red-600 ml-1"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {fileError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-6">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {fileError}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                disabled={!leftEyeFile || !rightEyeFile || !!fileError}
                onClick={handleAnalyze}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Activity className="h-5 w-5" />
                Analyze Both Eyes
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            {analysisStage !== 'ERROR' && analysisStage !== 'DONE' && (
              <>
                <Loader2 className="h-14 w-14 text-blue-600 animate-spin" />
                <div>
                  <p className="text-lg font-bold text-gray-900">Processing…</p>
                  <p className="text-gray-500 text-sm mt-1">{STAGE_MESSAGES[analysisStage]}</p>
                </div>
              </>
            )}

            {analysisStage === 'ERROR' && (
              <>
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-red-700">Analysis Failed</p>
                  <p className="text-gray-500 text-sm mt-1 max-w-md">{analysisError}</p>
                </div>
                <button
                  onClick={resetAnalysis}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
