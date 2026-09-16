import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StaffSettings: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Basic logout simulation for frontend since auth API relies on session cookie clearing
    document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Language Preferences</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="lang" value="en" checked={language === 'en'} onChange={() => setLanguage('en')} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              <span className="ml-3 font-medium text-gray-900">English</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="lang" value="hi" checked={language === 'hi'} onChange={() => setLanguage('hi')} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              <span className="ml-3 font-medium text-gray-900">हिंदी (Hindi)</span>
            </label>
          </div>
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className="flex items-center text-red-600 font-medium hover:text-red-800 transition">
            <LogOut className="h-5 w-5 mr-2" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
