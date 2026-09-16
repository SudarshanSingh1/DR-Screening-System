import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { Loader2, Building2, Plus } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminFacilities: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, success } = useToast();

  const load = async () => {
    try {
      const data = await adminApi.getFacilities();
      setFacilities(data || []);
    } catch {
      error('Failed to load facilities');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    
    try {
      await adminApi.createFacility({ name, location });
      success('Facility created');
      load();
    } catch {
      error('Failed to create facility');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Create New Facility</h2>
        <form onSubmit={handleCreate} className="flex space-x-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" required className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Facility Name" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input name="location" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Location" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Create
          </button>
        </form>
      </div>

      {facilities.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No facilities available yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facilities.map(f => (
                <tr key={f.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{f.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.location || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f._count?.doctors || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f._count?.staff || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
