import React, { useEffect, useState } from 'react';
import { doctorApi } from '../../services/api/doctorApi';
import { LoadingState } from '../../components/common/LoadingState';

export const DoctorProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    professionalName: '',
    specialty: '',
    registrationNumber: ''
  });

  const loadProfile = async () => {
    try {
      const data = await doctorApi.getProfile();
      setProfile(data);
      setFormData({
        firstName: data?.user?.firstName || '',
        lastName: data?.user?.lastName || '',
        phone: data?.user?.phone || '',
        professionalName: data?.professionalName || '',
        specialty: data?.specialty || '',
        registrationNumber: data?.registrationNumber || ''
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await doctorApi.updateProfile(formData);
      setSuccessMsg('Profile updated successfully.');
      await loadProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  const formatDoctorName = () => {
    let name = profile?.professionalName || profile?.user?.firstName || '';
    if (!name.toLowerCase().startsWith('dr.') && !name.toLowerCase().startsWith('dr ')) {
      name = `Dr. ${name}`;
    }
    return name;
  };

  const getInitials = () => {
    let name = profile?.professionalName || profile?.user?.firstName || '';
    name = name.replace(/^Dr\.\s*|^Dr\s*/i, '').trim();
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-3xl">
            {getInitials()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formatDoctorName()}</h2>
            <p className="text-gray-500">{profile?.specialty || 'Doctor'}</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Read-only)</label>
                <input type="email" readOnly disabled value={profile?.user?.email || ''} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Display Name</label>
                <input type="text" name="professionalName" value={formData.professionalName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Dr. Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization</label>
                <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Medical Registration Number</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Facility (Read-only)</label>
                <input type="text" readOnly disabled value={profile?.facility?.name || 'No facility assigned'} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
