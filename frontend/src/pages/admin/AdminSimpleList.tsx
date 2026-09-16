import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api/adminApi';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminSimpleList: React.FC<{ type: 'users' | 'doctors' | 'staff' | 'patients' | 'screenings' }> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetcher = adminApi[`get${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof adminApi] as any;
    fetcher().then((res: any[]) => {
      setData(res || []);
    }).catch(() => {
      error(`Failed to load ${type}`);
    }).finally(() => setLoading(false));
  }, [type]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  const getColumns = () => {
    switch (type) {
      case 'users': return ['Email', 'Role', 'Status', 'Joined'];
      case 'doctors': return ['Name', 'Specialty', 'Email', 'Facility', 'Joined'];
      case 'staff': return ['Name', 'Designation', 'Email', 'Facility', 'Joined'];
      case 'patients': return ['Name', 'Phone', 'Facility (Creator)', 'Joined'];
      case 'screenings': return ['ID', 'Patient', 'Status', 'Staff', 'Date'];
      default: return [];
    }
  };

  const renderRow = (item: any) => {
    switch (type) {
      case 'users': return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.role}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
      case 'doctors': return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.professionalName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.specialty || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user?.email || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.facility?.name || 'Unassigned'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
      case 'staff': return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.professionalName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.designation || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user?.email || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.facility?.name || 'Unassigned'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
      case 'patients': return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${item.firstName} ${item.lastName || ''}`.trim()}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.phone || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.creator?.staffProfile?.facility?.name || 'Unassigned'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
      case 'screenings': return (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.patient ? `${item.patient.firstName} ${item.patient.lastName || ''}`.trim() : '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.initiatingStaff?.staffProfile?.professionalName || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 capitalize">{type}</h1>
      
      {data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <p>No {type} found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {getColumns().map(c => <th key={c} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{c}</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, i) => <tr key={item.id || i}>{renderRow(item)}</tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
