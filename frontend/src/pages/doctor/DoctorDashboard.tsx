import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { doctorApi } from '../../services/api/doctorApi';
import { LoadingState } from '../../components/common/LoadingState';
import { Eye, CheckCircle, Users, FileText, Building2, ArrowRight, ChevronRight } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, profile, metrics } = useOutletContext<any>();
  const navigate = useNavigate();
  const [pending, setPending] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingData, patientsData] = await Promise.all([
          doctorApi.getPendingReviews(),
          doctorApi.getPatients()
        ]);
        setPending(pendingData || []);
        setPatients(patientsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingState />;

  const facilityName = profile?.facility?.name || 'No facility assigned';

  const formatDoctorName = () => {
    let name = profile?.professionalName || user?.firstName || '';
    if (!name.toLowerCase().startsWith('dr.') && !name.toLowerCase().startsWith('dr ')) {
      name = `Dr. ${name}`;
    }
    return name;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hero Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Good Morning, {formatDoctorName()}!
          </h1>
          <p className="text-gray-500 mt-1">Review AI screening results and provide clinical assessment.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm min-w-[240px]">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Your Facility</p>
            <p className="text-sm font-bold text-gray-900 truncate">{facilityName}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Eye className="w-6 h-6 text-blue-600" />} 
          bg="bg-blue-50"
          title="Pending Reviews" 
          value={metrics?.pendingReviews || 0} 
          subtitle="Screenings awaiting your assessment"
          onClick={() => navigate('/doctor/reviews/pending')}
        />
        <MetricCard 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
          bg="bg-green-50"
          title="Reviewed Today" 
          value={metrics?.reviewedToday || 0} 
          subtitle="Screenings reviewed today"
          onClick={() => navigate('/doctor/reviews/completed')}
        />
        <MetricCard 
          icon={<Users className="w-6 h-6 text-purple-600" />} 
          bg="bg-purple-50"
          title="My Patients" 
          value={metrics?.myPatients || 0} 
          subtitle="Total patients reviewed by you"
          onClick={() => navigate('/doctor/patients')}
        />
        <MetricCard 
          icon={<FileText className="w-6 h-6 text-orange-600" />} 
          bg="bg-orange-50"
          title="Reports Generated" 
          value={metrics?.reportsGenerated || 0} 
          subtitle="Clinical reports issued"
          onClick={() => navigate('/doctor/reports')}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Reviews Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Pending Reviews</h2>
              <Link to="/doctor/reviews/pending" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {pending.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending reviews.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-400 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Patient</th>
                      <th className="px-6 py-3 font-semibold">Age / Gender</th>
                      <th className="px-6 py-3 font-semibold">Screening Date</th>
                      <th className="px-6 py-3 font-semibold">AI Result</th>
                      <th className="px-6 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pending.slice(0, 5).map((p) => {
                      const aiResult = p.aiResult || {};
                      const isReferable = aiResult.isReferable;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                  {p.patient.firstName?.charAt(0) || ''}{(p.patient.lastName || '').charAt(0)}
                                </div>
                              <div>
                                <div className="font-bold text-gray-900">{p.patient.firstName} {p.patient.lastName}</div>
                                <div className="text-xs text-gray-500">{p.patient.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {p.patient.age} / {p.patient.gender}
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-gray-900">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-6 py-3">
                            {isReferable !== undefined ? (
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isReferable ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                              }`}>
                                {isReferable ? 'Referable' : 'Non-referable'}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => navigate(`/doctor/screenings/${p.id}/review`)}
                              className="text-blue-600 font-semibold text-sm hover:text-blue-800 flex items-center gap-1 justify-end w-full"
                            >
                              Review <ArrowRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My Patients Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">My Patients</h2>
              <Link to="/doctor/patients" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {patients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No patients found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-400 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Patient</th>
                      <th className="px-6 py-3 font-semibold">Age / Gender</th>
                      <th className="px-6 py-3 font-semibold">Last Screening</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patients.slice(0, 4).map((pt) => {
                      const lastScreening = pt.screenings?.[0];
                      return (
                        <tr key={pt.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                {pt.firstName?.charAt(0) || ''}{(pt.lastName || '').charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{pt.firstName} {pt.lastName}</div>
                                <div className="text-xs text-gray-500">{pt.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {pt.age} / {pt.gender}
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {lastScreening ? new Date(lastScreening.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-3">
                            {lastScreening?.status === 'COMPLETED' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Reviewed</span>
                            )}
                            {lastScreening?.status === 'PENDING_REVIEW' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">Awaiting Review</span>
                            )}
                            {(!lastScreening || lastScreening.status === 'IN_PROGRESS') && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">In Progress</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="text-center text-gray-500 py-8 text-sm">
              No recent activity.
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/doctor/reviews/pending')} className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-200" />
                  <span className="font-semibold text-sm">View Pending Reviews</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/doctor/patients')} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold text-sm">Search Patients</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button onClick={() => navigate('/doctor/reports')} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3 text-gray-700">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold text-sm">View Clinical Reports</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ChevronDown icon component
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const MetricCard = ({ icon, bg, title, value, subtitle, onClick }: any) => (
  <div onClick={onClick} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <div className="text-2xl font-black text-gray-900 my-1">{value}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);
