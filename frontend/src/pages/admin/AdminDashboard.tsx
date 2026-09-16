import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { Users, Activity, CheckCircle, Building2, Stethoscope, Briefcase, FileText, AlertTriangle, Clock, ShieldAlert, Eye, UserPlus, TrendingUp } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminDashboard: React.FC = () => {
  const { user } = useOutletContext<any>();
  const [metrics, setMetrics] = useState<any>(null);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, sRes] = await Promise.all([
        adminApi.getDashboardMetrics(),
        adminApi.getScreenings()
      ]);
      setMetrics(mRes);
      setScreenings(sRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState title="Unable to load dashboard" message={error} onRetry={fetchData} />;

  // DR Distribution Calculation
  let noDR = 0, mild = 0, mod = 0, sev = 0, pro = 0;
  screenings.forEach(s => {
    if (s.aiResult) {
      const l = s.aiResult.prediction?.label;
      if (l === 'No DR') noDR++;
      else if (l === 'Mild') mild++;
      else if (l === 'Moderate') mod++;
      else if (l === 'Severe') sev++;
      else if (l === 'Proliferative') pro++;
    }
  });
  const totalAI = noDR + mild + mod + sev + pro;
  
  const drDistribution = totalAI > 0 ? [
    { label: 'No DR', val: noDR, pct: ((noDR/totalAI)*100).toFixed(1), color: 'bg-[#22c55e]' }, // green
    { label: 'Mild', val: mild, pct: ((mild/totalAI)*100).toFixed(1), color: 'bg-[#eab308]' }, // yellow
    { label: 'Moderate', val: mod, pct: ((mod/totalAI)*100).toFixed(1), color: 'bg-[#f59e0b]' }, // amber
    { label: 'Severe', val: sev, pct: ((sev/totalAI)*100).toFixed(1), color: 'bg-[#f97316]' }, // orange
    { label: 'Proliferative', val: pro, pct: ((pro/totalAI)*100).toFixed(1), color: 'bg-[#ef4444]' }, // red
  ] : [];

  const recentScreenings = screenings.slice(0, 5);
  
  const formatDate = () => {
    const d = new Date();
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  const formatBadge = (status: string) => {
    if (status === 'COMPLETED') return <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-100">Completed</span>;
    if (status === 'PENDING_REVIEW') return <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-md border border-orange-100">Pending Review</span>;
    return <span className="px-2 py-0.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-md border border-gray-200">{status}</span>;
  };

  const formatAiBadge = (label: string | undefined) => {
    if (!label) return '-';
    if (label === 'No DR') return <span className="font-semibold text-green-600">{label}</span>;
    if (label === 'Mild') return <span className="font-semibold text-yellow-600">{label}</span>;
    if (label === 'Moderate') return <span className="font-semibold text-amber-600">{label}</span>;
    if (label === 'Severe') return <span className="font-semibold text-orange-600">{label}</span>;
    if (label === 'Proliferative') return <span className="font-semibold text-red-600">{label}</span>;
    return <span className="font-semibold text-gray-600">{label}</span>;
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Area */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-50"></div>
        <div className="p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Welcome back, {user?.firstName?.toUpperCase() || 'ADMIN'}!</h1>
            <p className="text-[#64748b] mt-1 text-sm font-medium">Here's what's happening with your <span className="font-bold text-[#334155]">Vision AI</span> system today.</p>
          </div>
          <div className="flex items-center text-[#64748b] bg-white/80 px-4 py-2 rounded-lg border border-blue-100 shadow-sm backdrop-blur-sm">
            <Clock className="w-4 h-4 mr-2 text-[#2663eb]" />
            <span className="text-sm font-bold">{formatDate()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Patients', value: metrics?.totalPatients ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Total Screenings', value: metrics?.totalScreenings ?? 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Awaiting Review', value: metrics?.screeningsAwaitingReview ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Total Doctors', value: metrics?.totalDoctors ?? 0, icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Total Staff', value: metrics?.totalScreeningStaff ?? 0, icon: Briefcase, color: 'text-pink-600', bg: 'bg-pink-100' },
          { label: 'Total Facilities', value: metrics?.totalFacilities ?? 0, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">{stat.label}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DR Detection Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-[#2663eb]" />
              AI Prediction Distribution
            </h2>
          </div>
          {totalAI === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                No AI predictions available.
             </div>
          ) : (
            <div className="space-y-4">
              {drDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-semibold text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-medium">{item.val}</span>
                    <span className="font-bold text-gray-900 w-12 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & System Status */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-gray-900 flex items-center">
                 <ShieldAlert className="w-4 h-4 mr-2 text-[#2663eb]" />
                 Upcoming / Alerts
               </h2>
               <span className="text-xs text-[#2663eb] cursor-pointer hover:underline">View all</span>
             </div>
             {metrics?.screeningsAwaitingReview > 0 ? (
               <div className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg">
                 <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-red-900">{metrics.screeningsAwaitingReview} screenings awaiting review</p>
                   <p className="text-xs text-red-700 mt-1">Requires immediate doctor attention.</p>
                 </div>
               </div>
             ) : (
               <div className="flex items-center p-3 bg-green-50 border border-green-100 rounded-lg">
                 <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                 <div>
                   <p className="text-sm font-bold text-green-900">No critical alerts</p>
                   <p className="text-xs text-green-700 mt-1">All systems running normally.</p>
                 </div>
               </div>
             )}
           </div>

           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
             <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
               <TrendingUp className="w-4 h-4 mr-2 text-[#2663eb]" />
               Quick Actions
             </h2>
             <div className="grid grid-cols-2 gap-3">
               <Link to="/admin/patients" className="flex items-center justify-center p-2.5 bg-[#2663eb] text-white rounded-md hover:bg-blue-700 transition">
                 <UserPlus className="w-4 h-4 mr-2" />
                 <span className="text-xs font-bold">Register Patient</span>
               </Link>
               <Link to="/admin/screenings" className="flex items-center justify-center p-2.5 bg-gray-50 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-100 transition">
                 <Eye className="w-4 h-4 mr-2" />
                 <span className="text-xs font-bold">New Screening</span>
               </Link>
               <Link to="/admin/users" className="flex items-center justify-center p-2.5 bg-gray-50 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-100 transition">
                 <Users className="w-4 h-4 mr-2" />
                 <span className="text-xs font-bold">Manage Users</span>
               </Link>
               <Link to="/admin/reports" className="flex items-center justify-center p-2.5 bg-gray-50 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-100 transition">
                 <FileText className="w-4 h-4 mr-2" />
                 <span className="text-xs font-bold">View Reports</span>
               </Link>
             </div>
           </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-[#2663eb]" />
              Recent Activity
            </h2>
            <span className="text-xs text-[#2663eb] cursor-pointer hover:underline">View all</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
             No recent activity available.
          </div>
        </div>
      </div>

      {/* Recent Screenings Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-[#2663eb]" />
            Recent Screenings
          </h2>
          <Link to="/admin/screenings" className="text-xs font-bold text-[#2663eb] hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">AI Result</th>
                <th className="px-6 py-4">Clinical Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentScreenings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No screenings available.</td>
                </tr>
              ) : (
                recentScreenings.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">SCR-{s.id.substring(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{s.patient?.firstName} {s.patient?.lastName || ''}</td>
                    <td className="px-6 py-4 text-gray-500">{s.patient?.age || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{s.patient?.gender?.charAt(0) || '-'}</td>
                    <td className="px-6 py-4">{formatAiBadge(s.aiResult?.prediction?.label)}</td>
                    <td className="px-6 py-4">{formatBadge(s.status)}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
