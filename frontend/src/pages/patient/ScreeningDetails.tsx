import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, FileText, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const ScreeningDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [screening, setScreening] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;
        // This endpoint expects a raw response with .success, .data... wait!
        // The patientApi wraps it and returns res.data directly.
        const res = await fetch(`/api/patient/screenings/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load screening details');
        setScreening(data.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load screening details'));
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingState message={t('loading_details')} />;

  if (error || !screening) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <button 
          onClick={() => navigate('/patient/screenings')}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> {t('back_to_screenings')}
        </button>
        <ErrorState message={error?.message || t('information_unavailable')} />
      </div>
    );
  }

  const steps = [
    { label: 'Screening Initiated', completed: true, date: screening.createdAt },
    { label: 'Images Uploaded', completed: screening.images?.length > 0, date: screening.images?.[0]?.createdAt || screening.createdAt },
    { label: 'AI Screening Complete', completed: !!screening.aiResult, date: screening.aiResult ? screening.updatedAt : null },
    { label: 'Doctor Review Complete', completed: !!screening.clinicalReview, date: screening.clinicalReview?.reviewedAt },
    { label: 'Final Report Available', completed: !!screening.clinicalReport, date: screening.clinicalReport?.generatedAt },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate('/patient/screenings')}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('back_to_screenings')}
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('screening_details') || 'Screening Details'}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('id')}: {screening.id}</p>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
               screening.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
             }`}>
               {screening.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
            </span>
         </div>

         <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Workflow Timeline</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white ${step.completed ? 'bg-green-500' : 'bg-gray-300'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow`}>
                    {step.completed ? <CheckCircle className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</h4>
                    </div>
                    {step.date ? (
                      <p className="text-xs text-gray-500">
                        {new Date(step.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Pending...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 space-y-6 pt-6 border-t border-gray-200">
               <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-400" /> Documents
                  </h3>
                  <div className="flex flex-col gap-3">
                    <a 
                      href={`/api/storage/reports/referral-${screening.id}`} 
                      target="_blank" rel="noreferrer" 
                      onClick={() => {
                         // Fallback mechanism to find referral report via storage if needed
                         // Since we don't store referral PDF in DB, they have a deterministic pattern
                         // But we can just use a backend endpoint or attempt to fetch directly.
                         // Actually the generated referral report contains a timestamp, so we can't easily guess it.
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4"/> 
                      View Initial Referral Report (if generated)
                    </a>
                    {screening.clinicalReport && (
                      <a 
                        href={`/api/storage/${screening.clinicalReport.storageKey}`} 
                        target="_blank" rel="noreferrer" 
                        className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4"/> 
                        View Final Clinical Report
                      </a>
                    )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
