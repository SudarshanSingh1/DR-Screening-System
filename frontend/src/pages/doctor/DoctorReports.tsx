import React, { useEffect, useState } from 'react';
import { doctorApi } from '../../services/api/doctorApi';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { FileText, Download } from 'lucide-react';

export const DoctorReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    doctorApi.getReports()
      .then(setReports)
      .catch((err: any) => setError(err.message ?? 'Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading clinical reports..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Reports generated after your clinical reviews.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold">No reports generated yet</p>
            <p className="text-xs mt-1">Reports are created automatically after each clinical review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/70">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Patient</th>
                  <th className="px-6 py-3.5 font-semibold">Screening ID</th>
                  <th className="px-6 py-3.5 font-semibold">Report Date</th>
                  <th className="px-6 py-3.5 font-semibold">Clinical Decision</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Patient */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {r.screening.patient.firstName.charAt(0)}
                          {(r.screening.patient.lastName || '').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {r.screening.patient.firstName} {r.screening.patient.lastName}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {r.screening.patient.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Screening ID */}
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-mono text-gray-500" title={r.screeningId}>
                        {r.screeningId.substring(0, 12)}…
                      </span>
                    </td>

                    {/* Report date */}
                    <td className="px-6 py-3.5">
                      <div className="text-gray-900 font-medium">
                        {new Date(r.generatedAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(r.generatedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Clinical decision */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.review.doctorDecision === 'DR_DETECTED'
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          : 'bg-green-50 text-green-700 ring-1 ring-green-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          r.review.doctorDecision === 'DR_DETECTED' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        {r.review.doctorDecision === 'DR_DETECTED' ? 'DR Detected' : 'No DR Detected'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={`/api/storage/${r.storageKey}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:text-blue-800 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View PDF
                        </a>
                        <a
                          href={`/api/storage/${r.storageKey}`}
                          download
                          className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-semibold hover:text-gray-800 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
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
