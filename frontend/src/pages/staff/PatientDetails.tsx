import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffPatientApi } from '../../services/api/staffPatientApi';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, User, Activity, FileText } from 'lucide-react';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (!id) return;
        const data = await staffPatientApi.getPatientDetails(id);
        if (!data) throw new Error('Patient not found');
        setPatient(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !patient) return <ErrorState message={error || 'Patient not found'} onRetry={() => navigate('/staff/patients')} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/staff/patients')}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Patients
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {patient.id}</p>
          </div>
          <button
            onClick={() => navigate('/staff/screenings/new', { state: { patient } })}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Create Screening
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-400" /> Patient Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><p className="text-sm text-gray-500">Age</p><p className="font-medium text-gray-900">{patient.age || '—'}</p></div>
            <div><p className="text-sm text-gray-500">Gender</p><p className="font-medium text-gray-900">{patient.gender || '—'}</p></div>
            <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-900">{patient.email || '—'}</p></div>
            <div><p className="text-sm text-gray-500">Status</p><p className="font-medium text-green-700">Active</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900">Screening History</h3>
        </div>
        <div className="p-0">
          {(!patient.screenings || patient.screenings.length === 0) ? (
            <div className="p-6 text-center text-gray-500">No screenings found for this patient.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-3">Screening ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patient.screenings.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      {['COMPLETED', 'PENDING_REVIEW'].includes(s.status) && (
                        <button onClick={() => navigate(`/staff/screenings/${s.id}/result`)} className="text-blue-600 hover:text-blue-900">View Screening</button>
                      )}
                      {s.clinicalReport && (
                        <a href={`/api/storage/${s.clinicalReport.storageKey}`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-900 inline-flex items-center">
                          <FileText className="h-4 w-4 mr-1"/> Report
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
