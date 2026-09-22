import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Info, Activity, FileText } from 'lucide-react';

import { EvidenceImageViewer } from '../../../components/common/EvidenceImageViewer';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import type { BilateralInferenceResult, EyeInferenceResult } from '../../../types/staff';

export const ScreeningResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    result?: BilateralInferenceResult;
    screeningId?: string;
    patientName?: string;
    leftEyeOriginalUrl?: string;
    rightEyeOriginalUrl?: string;
  } | null;

  const [screening, setScreening] = useState<any>(state?.result ? {
    id: state.screeningId || id,
    aiResult: state.result,
    patient: { firstName: state.patientName },
    images: [
      { eye: 'LEFT', storageKey: state.leftEyeOriginalUrl },
      { eye: 'RIGHT', storageKey: state.rightEyeOriginalUrl }
    ]
  } : null);
  const [loading, setLoading] = useState(!state?.result && Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<{isOpen: boolean, url: string, title: string}>({isOpen: false, url: '', title: ''});

  useEffect(() => {
    if (state?.result || !id) {
      setLoading(false);
      return;
    }

    const fetchScreening = async () => {
      try {
        const response = await fetch(`/api/staff/screenings/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to load screening');
        const data = await response.json();
        setScreening(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScreening();
  }, [id, state]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/staff/screenings/new')} />;

  if (!screening || !screening.aiResult) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-gray-200 rounded-xl text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Result Not Available</h2>
          <p className="text-gray-500 mt-2">
            This temporary screening result is no longer available. Images and results are not stored in Local Testing Mode.
          </p>
        </div>
        <button
          onClick={() => navigate('/staff/screenings/new')}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 mx-auto"
        >
          Start New Screening
        </button>
      </div>
    );
  }

  const result = screening.aiResult;
  const screeningId = screening.id || id;
  const patientName = screening.patient ? `${screening.patient.firstName} ${screening.patient.lastName || ''}`.trim() : state?.patientName || '—';
  
  const leftEyeImg = screening.images?.find((img: any) => img.eye === 'LEFT');
  const rightEyeImg = screening.images?.find((img: any) => img.eye === 'RIGHT');
  const leftEyeOriginalUrl = leftEyeImg?.storageKey ? (leftEyeImg.storageKey.startsWith('http') || leftEyeImg.storageKey.startsWith('data:') ? leftEyeImg.storageKey : `/api/storage/${leftEyeImg.storageKey}`) : state?.leftEyeOriginalUrl;
  const rightEyeOriginalUrl = rightEyeImg?.storageKey ? (rightEyeImg.storageKey.startsWith('http') || rightEyeImg.storageKey.startsWith('data:') ? rightEyeImg.storageKey : `/api/storage/${rightEyeImg.storageKey}`) : state?.rightEyeOriginalUrl;

  const renderEyeResult = (title: string, eyeResult: EyeInferenceResult, originalUrl?: string) => {
    if (!eyeResult) return <div className="p-4 text-gray-500">No data available.</div>;
    const { prediction, probabilities, isLowConfidence, isReferable } = eyeResult;

    const CLASS_NAMES: Record<number, string> = {
      0: 'No DR',
      1: 'Mild',
      2: 'Moderate',
      3: 'Severe',
      4: 'Proliferative DR',
    };
    const REFERABLE_CLASSES = [2, 3, 4];

    const classIndex = prediction?.classIndex ?? -1;
    const confidence = prediction?.confidence ?? 0;
    const displayLabel = prediction?.label || CLASS_NAMES[classIndex] || `Class ${classIndex}`;

    return (
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-gray-900 border-b pb-2">{title}</h3>
        
        {/* Primary prediction */}
        <div className={`rounded-xl border-2 p-5 ${
          isReferable ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
        }`}>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Prediction</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className={`text-2xl font-bold ${isReferable ? 'text-red-800' : 'text-green-800'}`}>
                {displayLabel}
              </p>
              <p className={`text-sm mt-1 ${isReferable ? 'text-red-600' : 'text-green-600'}`}>
                {isReferable ? 'Referable DR — Ophthalmologist review recommended' : 'Non-Referable — Routine follow-up'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Model Confidence</p>
              <p className={`text-2xl font-bold mt-0.5 ${isLowConfidence ? 'text-yellow-600' : 'text-gray-900'}`}>
                {(confidence * 100).toFixed(1)}%
              </p>
              {isLowConfidence && (
                <p className="text-xs text-yellow-600 font-medium">LOW CONFIDENCE — Interpret with caution</p>
              )}
            </div>
          </div>
        </div>

        {/* Class probabilities */}
        {probabilities && Object.keys(probabilities).length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Class Probabilities</p>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => {
                const prob = (probabilities as any)[i.toString()] || (probabilities as any)[i] || 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-sm w-32 font-medium ${i === classIndex ? 'text-blue-700' : 'text-gray-600'}`}>
                      {CLASS_NAMES[i] ?? `Class ${i}`}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          i === classIndex ? 'bg-blue-600' :
                          REFERABLE_CLASSES.includes(i) ? 'bg-red-400' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(prob * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-14 text-right font-mono">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Presentation Evidence Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Original */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <p className="text-xs font-bold text-gray-700">Original</p>
              {originalUrl && <button onClick={() => setViewerState({isOpen: true, url: originalUrl, title: title + ' - Original Fundus Image'})} className="text-xs text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
            </div>
            <div className="p-2 flex items-center justify-center bg-gray-900 h-32 flex-1">
              {originalUrl ? <img src={originalUrl} alt="Original" className="max-h-full object-contain rounded" /> : <p className="text-xs text-gray-400">N/A</p>}
            </div>
          </div>
          {/* 1.5 Quality */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <p className="text-xs font-bold text-gray-700">Quality</p>
              {eyeResult?.evidence?.quality?.image && <button onClick={() => setViewerState({isOpen: true, url: eyeResult?.evidence?.quality?.image || '', title: title + ' - Image Quality'})} className="text-xs text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
            </div>
            <div className="p-2 flex items-center justify-center bg-gray-900 h-32 flex-1">
              {eyeResult?.evidence?.quality?.image ? <img src={eyeResult?.evidence?.quality?.image} alt="Quality" className="max-h-full object-contain rounded" /> : <p className="text-xs text-gray-400">N/A</p>}
            </div>
          </div>
          {/* 2. Vessel */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <p className="text-xs font-bold text-gray-700">Vessel</p>
              {eyeResult?.evidence?.vessel?.image && <button onClick={() => setViewerState({isOpen: true, url: eyeResult?.evidence?.vessel?.image || '', title: title + ' - Retinal Vessel Segmentation'})} className="text-xs text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
            </div>
            <div className="p-2 flex items-center justify-center bg-gray-900 h-32 flex-1">
              {eyeResult?.evidence?.vessel?.image ? <img src={eyeResult?.evidence?.vessel?.image} alt="Vessel" className="max-h-full object-contain rounded" /> : <p className="text-xs text-gray-400">N/A</p>}
            </div>
          </div>
          {/* 3. Disc/Fovea */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <p className="text-xs font-bold text-gray-700">Disc/Fovea</p>
              {eyeResult?.evidence?.discFovea?.image && <button onClick={() => setViewerState({isOpen: true, url: eyeResult?.evidence?.discFovea?.image || '', title: title + ' - Optic Disc + Fovea'})} className="text-xs text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
            </div>
            <div className="p-2 flex items-center justify-center bg-gray-900 h-32 flex-1">
              {eyeResult?.evidence?.discFovea?.image ? <img src={eyeResult?.evidence?.discFovea?.image} alt="Disc/Fovea" className="max-h-full object-contain rounded" /> : <p className="text-xs text-gray-400">N/A</p>}
            </div>
          </div>
          {/* 4. Lesion */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <p className="text-xs font-bold text-gray-700">Lesion Map</p>
              {eyeResult?.evidence?.lesion?.image && <button onClick={() => setViewerState({isOpen: true, url: eyeResult?.evidence?.lesion?.image || '', title: title + ' - Lesion Map'})} className="text-xs text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
            </div>
            <div className="p-2 flex items-center justify-center bg-gray-900 h-32 flex-1">
              {eyeResult?.evidence?.lesion?.image ? <img src={eyeResult?.evidence?.lesion?.image} alt="Lesion" className="max-h-full object-contain rounded" /> : <p className="text-xs text-gray-400">N/A</p>}
            </div>
          </div>
          {/* 5. Grad-CAM */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <p className="text-xs font-bold text-gray-700">Grad-CAM</p>
              {eyeResult?.evidence?.gradCam?.image && <button onClick={() => setViewerState({isOpen: true, url: eyeResult?.evidence?.gradCam?.image?.startsWith('data:') || eyeResult?.evidence?.gradCam?.image?.startsWith('/') ? eyeResult?.evidence?.gradCam?.image || '' : `data:image/jpeg;base64,${eyeResult?.evidence?.gradCam?.image || ''}`, title: title + ' - Grad-CAM Attention'})} className="text-xs text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
            </div>
            <div className="p-2 flex items-center justify-center bg-gray-900 h-32 flex-1">
              {eyeResult?.evidence?.gradCam?.image ? <img src={eyeResult?.evidence?.gradCam?.image?.startsWith('data:') || eyeResult?.evidence?.gradCam?.image?.startsWith('/') ? eyeResult?.evidence?.gradCam?.image || '' : `data:image/jpeg;base64,${eyeResult?.evidence?.gradCam?.image || ''}`} alt="Grad-CAM" className="max-h-full object-contain rounded" /> : <p className="text-xs text-gray-400">N/A</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <EvidenceImageViewer 
        isOpen={viewerState.isOpen} 
        onClose={() => setViewerState(prev => ({...prev, isOpen: false}))} 
        imageUrl={viewerState.url} 
        title={viewerState.title} 
      />
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/staff/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
        <div className="text-xs text-gray-400">Screening: {screeningId}</div>
      </div>

      {screening.status === 'COMPLETED' && screening.clinicalReport && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <p className="font-bold text-green-800">CLINICAL REVIEW COMPLETED</p>
            <p className="text-green-700 mt-0.5">
              Doctor {screening.clinicalReview?.reviewer?.doctorProfile?.professionalName} has reviewed this screening.
            </p>
            <div className="mt-2">
              <a href={`/api/storage/${screening.clinicalReport.storageKey}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-700 font-medium hover:underline">
                View PDF Report
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-amber-800">BILATERAL DR SCREENING RESULT — requires clinical review</p>
          <p className="text-amber-700 mt-0.5">
            This output is generated by an AI model for screening support only. Grad-CAM indicates model attention and is not a diagnostic lesion map. A qualified ophthalmologist must review all cases before any clinical decision is made.
          </p>
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Bilateral AI Screening Result
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">Patient: {patientName || '—'}</p>
          </div>
        </div>

        <div className="p-6 space-y-12">
          {renderEyeResult('LEFT EYE (OS)', result?.leftEye, leftEyeOriginalUrl)}
          {renderEyeResult('RIGHT EYE (OD)', result?.rightEye, rightEyeOriginalUrl)}
        </div>
      </div>

      {/* Action Row */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-gray-900">What's next?</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Referral and report generation will be available in a future phase.
          </p>
        </div>
        <button
          onClick={() => navigate('/staff/screenings/new')}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
        >
          <Activity className="h-4 w-4" />
          Start New Screening
        </button>
      </div>

    </div>
    </>
  );
};
