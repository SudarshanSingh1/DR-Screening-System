import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import { LoadingState } from '../common/LoadingState';
import { DoctorSidebar } from './DoctorSidebar';
import { Search, Bell, ChevronDown, User as UserIcon, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import { doctorApi } from '../../services/api/doctorApi';

export const DoctorLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{patients: any[], screenings: any[]} | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          
          if (data.data && data.data.role === 'doctor') {
            const [profData, metricsData] = await Promise.all([
              doctorApi.getProfile(),
              doctorApi.getDashboardMetrics()
            ]);
            setProfile(profData);
            setMetrics(metricsData);
          }
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await doctorApi.search(searchQuery);
        setSearchResults(results);
        setSearchOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!user || user.role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }

  const formatDoctorName = () => {
    let name = profile?.professionalName || user?.firstName || '';
    if (!name.toLowerCase().startsWith('dr.') && !name.toLowerCase().startsWith('dr ')) {
      name = `Dr. ${name}`;
    }
    return name;
  };

  const getInitials = () => {
    let name = profile?.professionalName || user?.firstName || '';
    name = name.replace(/^Dr\.\s*|^Dr\s*/i, '').trim();
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-gray-200 flex-none z-20">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 w-64 cursor-pointer" onClick={() => navigate('/doctor')}>
            <img src="/VisionAi.png" alt="Vision AI" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight">Vision AI Platform</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Better Vision. Healthier Tomorrow.</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl px-8">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onClick={() => { if (searchQuery) setSearchOpen(true); }}
                placeholder="Search by patient name, patient ID or screening ID..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              />
              {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
              
              {searchOpen && searchResults && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  {searchResults.patients.length === 0 && searchResults.screenings.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto py-2">
                      {searchResults.patients.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Patients</div>
                          {searchResults.patients.map(p => (
                            <Link 
                              key={p.id} 
                              to={`/doctor/patients?q=${p.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{p.firstName} {p.lastName}</div>
                                <div className="text-xs text-gray-500">{p.id}</div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.screenings.length > 0 && (
                        <div>
                          <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Screenings</div>
                          {searchResults.screenings.map(s => (
                            <Link 
                              key={s.id} 
                              to={s.status === 'PENDING_REVIEW' ? `/doctor/screenings/${s.id}/review` : `/doctor/reviews/completed`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {s.patient.firstName} {s.patient.lastName} <span className="text-xs text-gray-500 ml-1">({s.patient.id})</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500">SCR-{s.id.substring(0,6)}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                                    {formatStatus(s.status)}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell className="w-6 h-6" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {getInitials()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{formatDoctorName()}</span>
                  <span className="text-xs text-gray-500">{profile?.specialty || 'Doctor'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
              </div>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate('/doctor/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Profile
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <DoctorSidebar onLogout={logout} pendingCount={metrics?.pendingReviews} />
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <Outlet context={{ user, profile, metrics }} />
        </main>
      </div>
    </div>
  );
};
