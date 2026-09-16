import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi } from '../../services/api/doctorApi';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';

export const DoctorReviewsPending: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    doctorApi.getPendingReviews()
      .then(setPending)
      .catch((err: any) => setError(err.message ?? 'Failed to load pending reviews.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading pending reviews..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">
            Screenings with completed AI analysis awaiting your clinical assessment.
          </p>
        </div>
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            {pending.length} pending
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Clock className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold">No pending reviews</p>
            <p className="text-xs mt-1">All screenings have been reviewed, or none are ready yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/70">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Patient</th>
                  <th className="px-6 py-3.5 font-semibold">Screening ID</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold">AI Result</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((p) => {
                  const aiResult = p.aiResult;
                  // Overall referable: either eye referable
                  const leftReferable = aiResult?.leftEye?.isReferable;
                  const rightReferable = aiResult?.rightEye?.isReferable;
                  const isReferable = leftReferable || rightReferable;
                  const hasAi = !!aiResult;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/doctor/screenings/${p.id}/review`)}
                    >
                      {/* Patient */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {p.patient.firstName.charAt(0)}{(p.patient.lastName || '').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {p.patient.firstName} {p.patient.lastName}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">{p.patient.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Screening ID */}
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-mono text-gray-500" title={p.id}>
                          {p.id.substring(0, 12)}…
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-3.5">
                        <div className="text-gray-900 font-medium">
                          {new Date(p.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(p.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* AI Result */}
                      <td className="px-6 py-3.5">
                        {!hasAi ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Awaiting AI
                          </span>
                        ) : isReferable ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Referable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Non-referable
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/screenings/${p.id}/review`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Review <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
};
