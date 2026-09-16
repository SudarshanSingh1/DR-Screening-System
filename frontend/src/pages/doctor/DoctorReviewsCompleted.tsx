import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi } from '../../services/api/doctorApi';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { CheckCircle, FileText, Download } from 'lucide-react';

export const DoctorReviewsCompleted: React.FC = () => {
  const [completed, setCompleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    doctorApi.getCompletedReviews()
      .then(setCompleted)
      .catch((err: any) => setError(err.message ?? 'Failed to load reviewed screenings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading reviewed screenings..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviewed Screenings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Screenings you have clinically reviewed, with associated reports.
          </p>
        </div>
        {completed.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 ring-1 ring-green-200 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            {completed.length} reviewed
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {completed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CheckCircle className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold">No reviewed screenings</p>
            <p className="text-xs mt-1">Reviews you complete will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/70">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Patient</th>
                  <th className="px-6 py-3.5 font-semibold">Screening ID</th>
                  <th className="px-6 py-3.5 font-semibold">Review Date</th>
                  <th className="px-6 py-3.5 font-semibold">Clinical Decision</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completed.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/doctor/screenings/${p.id}/review`)}
                  >
                    {/* Patient */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
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

                    {/* Review date */}
                    <td className="px-6 py-3.5">
                      {p.clinicalReview ? (
                        <>
                          <div className="text-gray-900 font-medium">
                            {new Date(p.clinicalReview.reviewedAt).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(p.clinicalReview.reviewedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Clinical decision badge */}
                    <td className="px-6 py-3.5">
                      {p.clinicalReview ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.clinicalReview.doctorDecision === 'DR_DETECTED'
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            : 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.clinicalReview.doctorDecision === 'DR_DETECTED' ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          {p.clinicalReview.doctorDecision === 'DR_DETECTED' ? 'DR Detected' : 'No DR Detected'}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Report actions */}
                    <td className="px-6 py-3.5 text-right">
                      {p.clinicalReport ? (
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`/api/storage/${p.clinicalReport.storageKey}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold hover:text-blue-800 transition-colors"
                            title="View report PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </a>
                          <span className="text-gray-200">|</span>
                          <a
                            href={`/api/storage/${p.clinicalReport.storageKey}`}
                            download
                            className="inline-flex items-center gap-1 text-gray-500 text-xs font-semibold hover:text-gray-800 transition-colors"
                            title="Download report PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No report</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
