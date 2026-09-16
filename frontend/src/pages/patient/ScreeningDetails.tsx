import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../services/api/patientApi';
import type { Screening } from '../../types/patient';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, Calendar, MapPin, Activity, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const ScreeningDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;
        const data = await patientApi.getScreeningById(id);
        if (!data) {
           throw new Error('Screening not found');
        }
        setScreening(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load screening details'));
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <LoadingState message={t('loading_details')} />;
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/patient/screenings')}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('back_to_screenings')}
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('screening_details')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('id')}: {screening.id}</p>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
               screening.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
             }`}>
               {screening.status === 'Processing' ? t('in_progress') : t('completed')}
            </span>
         </div>

         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" /> {t('date_time')}
                  </h3>
                  <p className="text-gray-700">{screening.date}</p>
               </div>
               <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" /> {t('facility')}
                  </h3>
                  <p className="text-gray-700">{screening.facility}</p>
               </div>
            </div>

            <div className="space-y-6">
               <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-gray-400" /> {t('status')}
                  </h3>
                  <p className="text-gray-700">{t('review_status_prefix')} {screening.status.toLowerCase()}.</p>
               </div>
               <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-400" /> {t('report')}
                  </h3>
                  {screening.reportAvailable ? (
                    <a href={screening.reportUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('download_report')}</a>
                  ) : (
                    <p className="text-gray-500 italic text-sm">{t('report_not_available')}</p>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
