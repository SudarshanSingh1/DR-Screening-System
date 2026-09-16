import React from 'react';
import { Bell } from 'lucide-react';

export const DoctorNotifications: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">
          System and workflow notifications will appear here.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 opacity-40" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No notifications</p>
          <p className="text-xs mt-1 text-gray-400 max-w-xs text-center">
            You're all caught up. Notifications for new screenings, reviews, and system updates
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};
