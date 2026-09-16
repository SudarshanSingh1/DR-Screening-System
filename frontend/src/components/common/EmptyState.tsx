import React from 'react';
import { FileQuestion } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title,
  message,
  icon = <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title || t('no_screening_records')}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{message || t('no_screening_records_desc')}</p>
    </div>
  );
};
