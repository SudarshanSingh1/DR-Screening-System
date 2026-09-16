import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title,
  message,
  onRetry
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100">
      <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
      <h3 className="text-md font-semibold text-red-800 mb-1">{title || t('information_unavailable')}</h3>
      <p className="text-sm text-red-600 mb-4">{message || t('could_not_load')}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
        >
          {t('try_again')}
        </button>
      )}
    </div>
  );
};
