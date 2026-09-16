import React from 'react';
import { usePatient, useScreenings } from '../../hooks/usePatient';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ClipboardList, CheckCircle2, Clock, FileWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const PatientDashboard: React.FC = () => {
  const { patient, loading: patientLoading, error: patientError } = usePatient();
  const { screenings, loading: screeningsLoading, error: screeningsError } = useScreenings();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (patientError) {
    return <ErrorState message={t('error_load_profile')} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-10 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            {patientLoading ? t('loading_profile') : (patient?.fullName ? `${t('welcome_back')}, ${patient.fullName}` : t('welcome_default'))}
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            {t('dashboard_subtitle')}
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm border border-white/30">
            {t('dashboard_quote')}
          </div>
        </div>
        
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none hidden md:block">
           <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="40" strokeDasharray="10 20"/>
              <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="20"/>
           </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('total_screenings'), value: screeningsLoading ? '-' : screenings.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: t('completed'), value: screeningsLoading ? '-' : screenings.filter(s => s.status === 'Completed').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
          { label: t('in_progress'), value: screeningsLoading ? '-' : screenings.filter(s => s.status === 'Processing').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: t('referral'), value: '-', icon: FileWarning, color: 'text-purple-600', bg: 'bg-purple-100' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{t('latest_screening')}</h2>
              <button 
                onClick={() => navigate('/patient/screenings')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                {t('view_all')} <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
            
            <div className="p-6">
              {screeningsLoading ? (
                <LoadingState message={t('loading_screenings')} />
              ) : screeningsError ? (
                 <ErrorState message={t('error_load_screenings')} />
              ) : screenings.length === 0 ? (
                <EmptyState 
                  title={t('no_screening_records')} 
                  message={t('no_screening_records_desc')}
                />
              ) : (
                <div className="text-sm text-gray-500">Screening details will appear here.</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('quick_actions')}</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/patient/screenings')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex justify-between items-center transition-colors">
                {t('view_my_screenings')} <span className="text-gray-400">&rarr;</span>
              </button>
              <button onClick={() => navigate('/patient/feedback')} className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium text-green-700 flex justify-between items-center transition-colors">
                {t('give_feedback')} <span className="text-green-500">&rarr;</span>
              </button>
              <button onClick={() => navigate('/patient/profile')} className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 flex justify-between items-center transition-colors">
                {t('update_profile')} <span className="text-purple-400">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
