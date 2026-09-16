import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '../../services/api/staffApi';

interface StaffHeaderProps {
  onMenuClick: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [initial, setInitial] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    staffApi.getProfile().then(p => {
      if (p && p.professionalName && p.professionalName !== 'Vision AI Platform') {
        setInitial(p.professionalName.charAt(0).toUpperCase());
      }
    }).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/staff/patients/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center flex-1">
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-3"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 max-w-md hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Search patients by name, phone or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            type="button" 
            className="p-2 text-gray-400 hover:text-gray-500 relative"
            onClick={() => navigate('/staff/notifications')}
            aria-label="View notifications"
          >
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/staff/profile')}>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold border border-blue-200 overflow-hidden">
               {initial ? initial : <UserIcon className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
