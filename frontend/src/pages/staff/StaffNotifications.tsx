import React from 'react';
import { Bell } from 'lucide-react';

export const StaffNotifications: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
        <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>No new notifications.</p>
      </div>
    </div>
  );
};
