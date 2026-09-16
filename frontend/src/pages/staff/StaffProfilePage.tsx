import React, { useEffect, useState } from 'react';
import { staffApi } from '../../services/api/staffApi';
import type { StaffProfile } from '../../types/staff';
import { User, Building2, Loader2, ShieldCheck } from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffApi.getProfile().then(p => { setProfile(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  if (!profile) return <div className="p-6 bg-red-50 text-red-600 rounded-xl">Profile unavailable.</div>;

  const displayName = profile.professionalName && profile.professionalName !== 'Vision AI Platform' 
    ? profile.professionalName 
    : 'Staff Member';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
        <div className="px-8 pb-8 relative">
           <div className="absolute -top-12 h-24 w-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-700">
             {displayName.charAt(0)}
           </div>
           
           <div className="pt-16">
             <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
             <p className="text-blue-600 font-medium">{profile.designation || 'Screening Staff'}</p>
             
             <div className="mt-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <ShieldCheck className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Employment Status</p>
                    <p className="font-medium">{profile.employmentStatus}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Building2 className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Facility Name</p>
                    <p className="font-medium">{profile.facilityName || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">System ID</p>
                    <p className="font-medium text-xs">{profile.id}</p>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
