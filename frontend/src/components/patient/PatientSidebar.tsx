import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, MessageSquare, Bell, User, Settings, HelpCircle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PatientSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { t } = useLanguage();

  const navItems = [
    { label: t('dashboard'), icon: Home, path: '/patient/dashboard' },
    { label: t('my_screenings'), icon: ClipboardList, path: '/patient/screenings' },
    { label: t('feedback'), icon: MessageSquare, path: '/patient/feedback' },
    { label: t('notifications'), icon: Bell, path: '/patient/notifications' },
    { label: t('my_profile'), icon: User, path: '/patient/profile' },
    { label: t('settings'), icon: Settings, path: '/patient/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-6 flex items-center justify-between">
        <img src="/VisionAi.png" alt="Vision AI Logo" className="h-8 object-contain" />
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700" 
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="mx-auto bg-white w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-sm">
             <HelpCircle className="h-5 w-5 text-blue-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('need_help')}</h4>
          <p className="text-xs text-gray-600 mb-3">{t('support_team')}</p>
          <button className="w-full bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {t('get_support')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        {sidebarContent}
      </div>
    </>
  );
};
