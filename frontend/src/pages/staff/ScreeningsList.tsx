import React, { useEffect, useState } from 'react';
import { staffScreeningApi } from '../../services/api/staffScreeningApi';
import type { ScreeningTask } from '../../types/staff';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2, ArrowRight } from 'lucide-react';

export const ScreeningsList: React.FC<{ status: 'IN_PROGRESS' | 'COMPLETED' }> = ({ status }) => {
  const [screenings, setScreenings] = useState<ScreeningTask[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await staffScreeningApi.getScreenings(status);
        setScreenings(res);
      } catch {
        setScreenings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [status]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {status === 'IN_PROGRESS' ? 'In Progress Screenings' : 'Completed Screenings'}
      </h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : screenings && screenings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No {status.toLowerCase().replace('_', ' ')} screenings found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screening ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {screenings?.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.patientName || s.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(s.date || s.createdAt) ? new Date(s.date || s.createdAt || '').toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {status === 'COMPLETED' ? (
                      <button onClick={() => navigate(`/staff/screenings/${s.id}/result`)} className="text-blue-600 hover:text-blue-900 flex items-center">
                        View Result <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    ) : (
                      <button onClick={() => navigate('/staff/screenings/new')} className="text-blue-600 hover:text-blue-900 flex items-center">
                        Continue <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
