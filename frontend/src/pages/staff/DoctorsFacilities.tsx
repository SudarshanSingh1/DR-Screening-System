import React, { useEffect, useState } from 'react';
import { doctorFacilityApi } from '../../services/api/doctorFacilityApi';
import type { DoctorSummary, FacilitySummary } from '../../types/staff';
import { Building2, User, Loader2 } from 'lucide-react';

export const DoctorsFacilities: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [fRes, dRes] = await Promise.all([
          doctorFacilityApi.getFacilities(),
          doctorFacilityApi.getDoctors()
        ]);
        setFacilities(fRes);
        setDoctors(dRes);
      } catch {
        // Silent catch, states stay empty
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Directory</h1>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Building2 className="h-5 w-5 mr-2" /> Facilities</h2>
        {facilities.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200">No facilities available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map(f => (
              <div key={f.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900">{f.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{f.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><User className="h-5 w-5 mr-2" /> Doctors</h2>
        {doctors.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200">No doctors available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(d => (
              <div key={d.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start space-x-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold shrink-0">
                  {d.professionalName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{d.professionalName}</h3>
                  <p className="text-sm text-blue-600 font-medium">{d.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">Facility: {d.facility?.name || 'Unassigned'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
