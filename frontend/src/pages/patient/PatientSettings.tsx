import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Lock, LogOut } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const PatientSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{t('language_preferences')}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">{t('language_desc')}</p>
              
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md max-w-xs border"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mr-4">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{t('password')}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">{t('password_desc')}</p>
              
              <button 
                onClick={() => navigate('/reset-password')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('reset_password')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-lg text-red-600 mr-4">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{t('log_out')}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">{t('logout_desc')}</p>
              
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('log_out')}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
