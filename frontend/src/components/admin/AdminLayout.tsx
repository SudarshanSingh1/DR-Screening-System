import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Search, Bell, ChevronDown, User as UserIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { LoadingState } from '../common/LoadingState';

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { error } = useToast();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch {
      error('Logout failed');
    }
  };

  if (loading) return <LoadingState />;
  if (!user || (user.role !== 'engineer_admin' && user.role !== 'admin')) return <Navigate to="/login" replace />;

  const formatAdminName = () => {
    const name = user?.firstName || 'Admin';
    const lastName = user?.lastName ? ` ${user.lastName}` : '';
    return (name + lastName).toUpperCase();
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || 'A';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Patients', path: '/admin/patients' },
    { label: 'Screenings', path: '/admin/screenings' },
    { label: 'Doctors', path: '/admin/doctors' },
    { label: 'Staff', path: '/admin/staff' },
    { label: 'Facilities', path: '/admin/facilities' },
    { label: 'Users', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Top Header */}
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                <img src="/VisionAi.png" alt="Vision AI" className="h-8 w-8 object-contain" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#2663eb] leading-tight tracking-tight uppercase">Vision AI Platform</span>
                </div>
              </div>
            </div>

            {/* Horizontal Navigation */}
            <nav className="hidden md:flex space-x-1 lg:space-x-4">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${
                      isActive ? 'text-[#2663eb] bg-blue-50' : 'text-gray-600 hover:text-[#2663eb] hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Action / Branding Right */}
            <div className="hidden md:flex items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Admin Portal</span>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-50">
              <nav className="px-4 py-2 space-y-1">
                {navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-colors ${
                        isActive ? 'text-[#2663eb] bg-blue-50' : 'text-gray-600 hover:text-[#2663eb] hover:bg-gray-50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* Sub Header (Search & Profile) */}
          <div className="flex justify-between items-center h-14 border-t border-gray-100">
            {/* Search */}
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search patients, screenings, doctors, staff or facilities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              />
            </div>

            {/* Profile & Notifications */}
            <div className="flex items-center gap-5 pl-4">
              <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    {/* Assuming no avatar image exists, fallback to initials in a clean white circle or blue */}
                    <img src={`https://ui-avatars.com/api/?name=${getInitials()}&background=2663eb&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-xs font-bold text-gray-900 tracking-tight leading-tight">{formatAdminName()}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase">Administrator</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <button 
                      onClick={() => { setDropdownOpen(false); navigate('/admin/profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};
