import React, { useEffect, useState } from 'react';
import { staffApi } from '../../services/api/staffApi';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, CheckCircle, Search, UserPlus } from 'lucide-react';
import type { StaffProfile } from '../../types/staff';

export const StaffDashboard: React.FC = () => {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [p, m] = await Promise.all([
          staffApi.getProfile(),
          staffApi.getDashboardMetrics()
        ]);
        setProfile(p);
        setMetrics(m);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-gray-200 rounded w-1/4"></div><div className="h-40 bg-gray-200 rounded"></div></div>;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-red-700 font-bold text-lg mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">
          Retry
        </button>
      </div>
    );
  }

  const displayName = profile?.professionalName && profile.professionalName !== 'Vision AI Platform' 
    ? profile.professionalName 
    : '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good Morning{displayName ? `, ${displayName}` : ''}!</h1>
          <p className="text-gray-500 mt-1">{profile?.designation || 'Screening Staff'}{profile?.facilityName ? ` • Facility: ${profile.facilityName}` : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Patients Registered Today', value: metrics?.patientsRegisteredToday ?? 0, icon: Users, color: 'blue' },
          { label: 'Screenings In Progress', value: metrics?.screeningsInProgress ?? 0, icon: Activity, color: 'yellow' },
          { label: 'Completed Screenings', value: metrics?.screeningsCompleted ?? 0, icon: CheckCircle, color: 'green' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Attention / Work Queue</h2>
          {metrics?.workQueue?.length ? (
             <ul className="space-y-3">
               {metrics.workQueue.map((item: any, i: number) => (
                 <li key={i} onClick={() => navigate(item.path)} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
                   <div>
                     <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                     <p className="text-xs text-gray-500">{item.description}</p>
                   </div>
                   <button className="text-blue-600 text-sm font-medium hover:underline">Review</button>
                 </li>
               ))}
             </ul>
          ) : (
            <div className="py-8 text-center">
              <Activity className="mx-auto h-8 w-8 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No items require immediate attention.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => navigate('/staff/patients/search')} className="w-full bg-blue-50 text-blue-700 p-3 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center">
              <Search className="h-5 w-5 mr-2" /> Find Patient
            </button>
            <button onClick={() => navigate('/staff/patients/register')} className="w-full border border-gray-200 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center">
              <UserPlus className="h-5 w-5 mr-2" /> Register Patient
            </button>
            <button onClick={() => navigate('/staff/screenings/new')} className="w-full border border-gray-200 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center">
              <Activity className="h-5 w-5 mr-2" /> Start New Screening
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
