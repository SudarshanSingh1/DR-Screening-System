import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../services/api/doctorApi';
import { EvidenceImageViewer } from '../../components/common/EvidenceImageViewer';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  ArrowLeft, CheckCircle, FileText, Download, AlertTriangle,
  User, Activity
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EyeResult {
  prediction: {
    label: string;
    confidence: number;
  };
  probabilities: number[];
  isReferable: boolean;
  isLowConfidence?: boolean;
  gradCam?: string;
  evidence?: any;
}

interface AiResult {
  leftEye: EyeResult | null;
  rightEye: EyeResult | null;
  isReferable?: boolean;
}

interface ScreeningImage {
  eye: 'LEFT' | 'RIGHT';
  storageKey?: string;
  status: string;
}

interface Screening {
  id: string;
  status: string;
  createdAt: string;
  aiResult: AiResult | null;
  images: ScreeningImage[];
  patient: {
    id: string;
    firstName: string;
    lastName?: string;
    age?: number;
    gender?: string;
    aadhaarReference?: string;
  };
  clinicalReview?: {
    doctorDecision: string;
    clinicalNotes?: string;
    reviewedAt: string;
  };
  clinicalReport?: {
    id: string;
    storageKey: string;
    generatedAt: string;
  };
}

// ── DR Classes ────────────────────────────────────────────────────────────────

const DR_CLASSES = ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR'];

const CLASS_COLORS = [
  'bg-green-500',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-500',
  'bg-red-700',
];

const CLASS_TEXT_COLORS = [
  'text-green-700',
  'text-yellow-700',
  'text-orange-700',
  'text-red-700',
  'text-red-900',
];

// ── Sub-components ────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value?: string | number | null; mono?: boolean }> = ({
  label, value, mono
}) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
    <span className={`text-sm font-semibold text-gray-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>
      {value ?? <span className="text-gray-400 font-normal italic">N/A</span>}
    </span>
  </div>
);

const ConfidenceBar: React.FC<{
  label: string;
  probability: number;
  colorClass: string;
  textColorClass: string;
}> = ({ label, probability, colorClass, textColorClass }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className={`text-xs font-medium ${textColorClass}`}>{label}</span>
      <span className={`text-xs font-bold ${textColorClass}`}>{(probability * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`${colorClass} h-1.5 rounded-full transition-all duration-500`}
        style={{ width: `${probability * 100}%` }}
      />
    </div>
  </div>
);

const EyePanel: React.FC<{
  title: string;
  eyeLabel: string;
  result: EyeResult | null;
  originalImageKey?: string;
  onViewImage: (url: string, title: string) => void;
}> = ({ title, eyeLabel, result, originalImageKey, onViewImage: _onViewImage }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
          <p className="text-[10px] text-gray-500">{eyeLabel}</p>
        </div>
        {result && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            result.isReferable
              ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
              : 'bg-green-50 text-green-700 ring-1 ring-green-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${result.isReferable ? 'bg-red-500' : 'bg-green-500'}`} />
            {result.isReferable ? 'Referable' : 'Non-referable'}
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {!result ? (
          <div className="flex items-center gap-2 text-gray-400 py-4">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">No AI result available for this eye.</span>
          </div>
        ) : (
          <>
            {/* Images row */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {/* 1. Original */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Original</p>
                  {originalImageKey && <button onClick={() => _onViewImage(`/api/storage/${originalImageKey}`, title + ' - Original Fundus Image')} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-900 h-28 flex-1">
                  {originalImageKey ? <img src={`/api/storage/${originalImageKey}`} alt="Original" className="max-h-full object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <p className="text-[10px] text-gray-400">N/A</p>}
                </div>
              </div>
              {/* 1.5 Quality */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Quality</p>
                  {result?.evidence?.quality?.image && <button onClick={() => _onViewImage(result.evidence!.quality!.image, title + ' - Image Quality')} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-900 h-28 flex-1">
                  {result?.evidence?.quality?.image ? <img src={result.evidence.quality.image} alt="Quality" className="max-h-full object-contain rounded" /> : <p className="text-[10px] text-gray-400">N/A</p>}
                </div>
              </div>
              {/* 2. Vessel */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Vessel</p>
                  {result?.evidence?.vessel?.image && <button onClick={() => _onViewImage(result.evidence!.vessel!.image, title + ' - Retinal Vessel Segmentation')} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-900 h-28 flex-1">
                  {result?.evidence?.vessel?.image ? <img src={result.evidence.vessel.image} alt="Vessel" className="max-h-full object-contain rounded" /> : <p className="text-[10px] text-gray-400">N/A</p>}
                </div>
              </div>
              {/* 3. Disc/Fovea */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Disc/Fovea</p>
                  {result?.evidence?.discFovea?.image && <button onClick={() => _onViewImage(result.evidence!.discFovea!.image, title + ' - Optic Disc + Fovea')} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-900 h-28 flex-1">
                  {result?.evidence?.discFovea?.image ? <img src={result.evidence.discFovea.image} alt="Disc/Fovea" className="max-h-full object-contain rounded" /> : <p className="text-[10px] text-gray-400">N/A</p>}
                </div>
              </div>
              {/* 4. Lesion */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Lesion Map</p>
                  {result?.evidence?.lesion?.image && <button onClick={() => _onViewImage(result.evidence!.lesion!.image, title + ' - Lesion Map')} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-900 h-28 flex-1">
                  {result?.evidence?.lesion?.image ? <img src={result.evidence.lesion.image} alt="Lesion" className="max-h-full object-contain rounded" /> : <p className="text-[10px] text-gray-400">N/A</p>}
                </div>
              </div>
              {/* 5. Grad-CAM */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-2 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Grad-CAM</p>
                  {result?.evidence?.gradCam?.image && <button onClick={() => _onViewImage(result.evidence!.gradCam!.image.startsWith('data:') || result.evidence!.gradCam!.image.startsWith('/') ? result.evidence!.gradCam!.image : `data:image/jpeg;base64,${result.evidence!.gradCam!.image}`, title + ' - Grad-CAM Attention')} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium" title="View full image">View</button>}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-900 h-28 flex-1">
                  {result?.evidence?.gradCam?.image ? <img src={result.evidence.gradCam.image.startsWith('data:') || result.evidence.gradCam.image.startsWith('/') ? result.evidence.gradCam.image : `data:image/jpeg;base64,${result.evidence.gradCam.image}`} alt="Grad-CAM" className="max-h-full object-contain rounded" /> : <p className="text-[10px] text-gray-400">N/A</p>}
                </div>
              </div>
            </div>

            {/* Grad-CAM disclaimer */}
            <p className="text-[10px] text-gray-400 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
              <strong>Note:</strong> The Grad-CAM heatmap highlights regions that influenced the AI prediction.
              It is a <strong>model attention visualization</strong>, not a clinically validated lesion segmentation map.
            </p>

            {/* AI Prediction summary */}
            <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">AI Prediction</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{result.prediction.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Confidence</p>
                  <p className={`text-xl font-black mt-0.5 ${
                    result.isLowConfidence ? 'text-amber-600' : 'text-gray-900'
                  }`}>
                    {(result.prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {result.isLowConfidence && (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Low confidence result — clinical judgment is especially important.
                </div>
              )}
            </div>

            {/* Class probabilities */}
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Class Probabilities
              </p>
              <div className="space-y-2.5">
                {DR_CLASSES.map((cls, i) => (
                  <ConfidenceBar
                    key={cls}
                    label={cls}
                    probability={result.probabilities?.[i] ?? 0}
                    colorClass={CLASS_COLORS[i]}
                    textColorClass={CLASS_TEXT_COLORS[i]}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const DoctorReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<{isOpen: boolean, url: string, title: string}>({isOpen: false, url: '', title: ''});

  const [decision, setDecision] = useState<'DR_DETECTED' | 'NO_DR_DETECTED' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await doctorApi.getScreeningDetails(id);
      setScreening(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load screening.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    setSubmitError(null);
    try {
      await doctorApi.reanalyzeScreening(id);
      await load();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to analyze screening');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    if (!decision || !id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await doctorApi.submitReview(id, decision, notes);
      // Reload to get the completed state and report link
      setLoading(true);
      await load();
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading screening..." />;
  if (error) return (
    <ErrorState
      title="Screening unavailable"
      message={error}
      onRetry={() => navigate('/doctor/reviews/pending')}
    />
  );
  if (!screening) return null;

  const aiResult = screening.aiResult;
  const leftImage = screening.images?.find((img) => img.eye === 'LEFT' && img.storageKey);
  const rightImage = screening.images?.find((img) => img.eye === 'RIGHT' && img.storageKey);

  const isCompleted = screening.status === 'COMPLETED';
  const hasReport = !!screening.clinicalReport;

  const maskedAadhaar = screening.patient.aadhaarReference
    ? 'XXXX XXXX ' + screening.patient.aadhaarReference.replace(/\s/g, '').slice(-4)
    : null;

  return (
    <>
      <EvidenceImageViewer 
        isOpen={viewerState.isOpen} 
        onClose={() => setViewerState(prev => ({...prev, isOpen: false}))} 
        imageUrl={viewerState.url} 
        title={viewerState.title} 
      />
      <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/doctor/reviews/pending')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Pending Reviews
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">
          {screening.patient.firstName} {screening.patient.lastName}
        </span>
      </div>

      {/* Page title + status badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Review</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review AI screening results and provide your clinical assessment.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isCompleted
              ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}`} />
            {isCompleted ? 'COMPLETED' : 'PENDING REVIEW'}
          </span>
          {!isCompleted && (
            <button 
              onClick={handleAnalyze} 
              disabled={analyzing}
              className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              {analyzing ? 'Analyzing...' : 'Re-run AI Analysis'}
            </button>
          )}
        </div>
      </div>

      {/* ── Patient Information ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Patient Information</h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoRow
            label="Patient Name"
            value={[screening.patient.firstName, screening.patient.lastName].filter(Boolean).join(' ')}
          />
          <InfoRow label="Patient ID" value={screening.patient.id} mono />
          <InfoRow label="Age" value={screening.patient.age} />
          <InfoRow label="Gender" value={screening.patient.gender} />
        </div>
        <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Aadhaar Ref.</span>
            <span className="text-sm font-mono font-semibold text-gray-900 mt-0.5">
              {maskedAadhaar ?? <span className="text-gray-400 font-normal italic font-sans">Not on record</span>}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Screening ID</span>
            <span className="text-xs font-mono font-semibold text-gray-700 mt-0.5 truncate" title={screening.id}>
              {screening.id}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Screening Date</span>
            <span className="text-sm font-semibold text-gray-900 mt-0.5">
              {new Date(screening.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">AI Analysis</span>
            <span className={`text-sm font-bold mt-0.5 ${aiResult ? 'text-blue-700' : 'text-gray-400'}`}>
              {aiResult ? 'Available' : 'Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Eye Analysis Panels ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">AI Screening Results</h2>
        </div>
        {!aiResult && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">AI result not available</p>
              <p className="text-xs text-amber-700 mt-1">
                The AI analysis may not have completed for this screening.
                You may still proceed with a clinical review based on the fundus images.
              </p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EyePanel
            title="Left Eye"
            eyeLabel="OS — Oculus Sinister"
            result={aiResult?.leftEye ?? null}
            originalImageKey={leftImage?.storageKey}
            onViewImage={(url, title) => setViewerState({isOpen: true, url, title})}
          />
          <EyePanel
            title="Right Eye"
            eyeLabel="OD — Oculus Dexter"
            result={aiResult?.rightEye ?? null}
            originalImageKey={rightImage?.storageKey}
            onViewImage={(url, title) => setViewerState({isOpen: true, url, title})}
          />
        </div>
      </div>

      {/* ── Clinical Assessment ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Doctor's Clinical Assessment
          </h2>
        </div>

        <div className="p-6">
          {isCompleted && screening.clinicalReview ? (
            /* ── Completed state ── */
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="h-5 w-5" />
                <span>Clinical review submitted</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Clinical Decision
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                    screening.clinicalReview.doctorDecision === 'DR_DETECTED'
                      ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                      : 'bg-green-50 text-green-700 ring-1 ring-green-200'
                  }`}>
                    {screening.clinicalReview.doctorDecision === 'DR_DETECTED'
                      ? 'DR Detected'
                      : 'No DR Detected'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Reviewed At
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(screening.clinicalReview.reviewedAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {screening.clinicalReview.clinicalNotes && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">
                    Clinical Notes
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-100 leading-relaxed">
                    {screening.clinicalReview.clinicalNotes}
                  </p>
                </div>
              )}

              {hasReport && screening.clinicalReport && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-3">
                    Clinical Report
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/api/storage/${screening.clinicalReport.storageKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      View Report PDF
                    </a>
                    <a
                      href={`/api/storage/${screening.clinicalReport.storageKey}`}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Generated:{' '}
                    {new Date(screening.clinicalReport.generatedAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── Pending state ── */
            <div className="space-y-6">
              {/* Separator notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold">Clinical Decision Required</p>
                <p className="text-xs mt-1 text-blue-700">
                  Your decision is independent of the AI classification above. Based on your clinical judgment,
                  does this patient have diabetic retinopathy?
                </p>
              </div>

              {/* Decision buttons */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Does the patient have diabetic retinopathy?
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => setDecision('DR_DETECTED')}
                    className={`px-5 py-3.5 border-2 rounded-xl text-sm font-bold transition-all ${
                      decision === 'DR_DETECTED'
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/50'
                    }`}
                  >
                    DR Detected
                  </button>
                  <button
                    onClick={() => setDecision('NO_DR_DETECTED')}
                    className={`px-5 py-3.5 border-2 rounded-xl text-sm font-bold transition-all ${
                      decision === 'NO_DR_DETECTED'
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    No DR Detected
                  </button>
                </div>
              </div>

              {/* Clinical notes */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Clinical Notes <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] p-3 text-sm resize-none outline-none transition-shadow"
                  placeholder="Enter any clinical observations, findings, or follow-up recommendations..."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{notes.length} / 5000</p>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!decision || submitting}
                  className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
                {!decision && (
                  <p className="text-xs text-gray-500">
                    Select a clinical decision above to enable submission.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
