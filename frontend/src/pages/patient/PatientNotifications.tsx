import React from 'react';
import { useNotifications } from '../../hooks/usePatient';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const PatientNotifications: React.FC = () => {
  const { notifications, loading, error } = useNotifications();
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('notifications')}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <LoadingState message={t('loading_notifications')} />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
             <ErrorState message={t('error_load_notifications')} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState 
              icon={<Bell className="h-12 w-12 text-gray-400 mb-4" />}
              title={t('no_notifications')} 
              message={t('no_notifications_desc')}
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
             {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                       <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                     </div>
                     <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{notification.date}</span>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
