import React, { useState } from 'react';
import { staffPatientApi } from '../../services/api/staffPatientApi';
import { useNavigate } from 'react-router-dom';
import type { PatientRegistrationPayload } from '../../types/staff';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const RegisterPatient: React.FC = () => {
  const [formData, setFormData] = useState<PatientRegistrationPayload>({
    firstName: '', lastName: '', age: undefined, gender: '', phone: '', email: '', aadhaarReference: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Data cleanup
      const payload = { ...formData };
      if (!payload.lastName) delete payload.lastName;
      if (!payload.phone) delete payload.phone;
      if (!payload.email) delete payload.email;
      if (!payload.aadhaarReference) delete payload.aadhaarReference;
      
      const res = await staffPatientApi.registerPatient(payload);
      
      const patientName = [payload.firstName, payload.lastName].filter(Boolean).join(' ');
      toast.success(`Patient ${patientName} registered successfully. ID: ${res.id}`);
      
      // Reset form on true success
      setFormData({ firstName: '', lastName: '', age: undefined, gender: '', phone: '', email: '', aadhaarReference: '' });
      
      // Leave plenty of time for toast to be read before navigating
      navigate(`/staff/patients/${res.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Patient</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.age || ''} onChange={e => setFormData({...formData, age: parseInt(e.target.value, 10)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <hr className="border-gray-100" />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (Optional for login)</label>
          <input type="tel" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional for login)</label>
          <input type="email" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Reference (Last 4 digits / Virtual ID)</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.aadhaarReference} onChange={e => setFormData({...formData, aadhaarReference: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center">
          {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
          Register Patient
        </button>
      </form>
    </div>
  );
};
