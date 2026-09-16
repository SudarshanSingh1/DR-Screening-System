import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../services/api/doctorApi';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Search, Users, ArrowRight } from 'lucide-react';

export const DoctorPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    doctorApi.getPatients()
      .then(setPatients)
      .catch((err: any) => setError(err.message ?? 'Failed to load patients.'))
      .finally(() => setLoading(false));
  }, []);

  // Local filter (data is already authorized server-side)
  const filteredPatients = patients.filter((p) => {
    if (!query.trim()) return true;
    const term = query.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (p.id && p.id.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term))
    );
  });

  const getStatusBadge = (screening: any) => {
    if (!screening) return null;
    const { status } = screening;
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 ring-1 ring-green-200">
          Reviewed
        </span>
      );
    }
    if (status === 'PENDING_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
          Awaiting Review
        </span>
      );
    }
    if (['PROCESSING', 'IMAGES_UPLOADED', 'READY_FOR_PROCESSING'].includes(status)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          AI Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  if (loading) return <LoadingState message="Loading patients..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Patients registered at your facility ({patients.length} total).
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by name or ID..."
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold">
              {query ? 'No patients match your search' : 'No patients found'}
            </p>
            {query && (
              <button
                onClick={() => setSearchParams({})}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/70">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Patient</th>
                  <th className="px-6 py-3.5 font-semibold">Patient ID</th>
                  <th className="px-6 py-3.5 font-semibold">Age / Gender</th>
                  <th className="px-6 py-3.5 font-semibold">Contact</th>
                  <th className="px-6 py-3.5 font-semibold">Screenings</th>
                  <th className="px-6 py-3.5 font-semibold">Latest Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((p) => {
                  const lastScreening = p.screenings?.[0] ?? null;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Patient */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {p.firstName.charAt(0)}{(p.lastName || '').charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">
                            {p.firstName} {p.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Patient ID */}
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-mono text-gray-500">{p.id}</span>
                      </td>

                      {/* Age / Gender */}
                      <td className="px-6 py-3.5 text-gray-600">
                        {p.age ?? '—'} / {p.gender ?? '—'}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-3.5 text-gray-600">
                        {p.phone || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Screening count */}
                      <td className="px-6 py-3.5 text-gray-600">
                        {p.screenings?.length ?? 0}
                      </td>

                      {/* Latest screening status */}
                      <td className="px-6 py-3.5">
                        {lastScreening ? (
                          <div className="space-y-1">
                            {getStatusBadge(lastScreening)}
                            <div className="text-[10px] text-gray-400">
                              {new Date(lastScreening.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No screenings</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-3.5 text-right">
                        {lastScreening?.status === 'PENDING_REVIEW' ? (
                          <button
                            onClick={() => navigate(`/doctor/screenings/${lastScreening.id}/review`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Review <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : lastScreening?.status === 'COMPLETED' ? (
                          <button
                            onClick={() => navigate(`/doctor/screenings/${lastScreening.id}/review`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : null}
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
  );
};
