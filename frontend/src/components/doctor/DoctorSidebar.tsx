import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckCircle, Clock, Users, FileText,
  User as UserIcon, Bell, LogOut
} from 'lucide-react';

interface DoctorSidebarProps {
  onLogout: () => void;
  pendingCount?: number;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ onLogout, pendingCount }) => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col justify-between overflow-y-auto">
      <div className="py-6 px-4 space-y-1">

        <NavLink to="/doctor/dashboard" className={navClass}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>

        {/* Clinical Review */}
        <div className="pt-6 pb-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Clinical Review
          </p>
        </div>

        <NavLink to="/doctor/reviews/pending" className={navClass}>
          <Clock className="w-5 h-5" />
          <span className="flex-1">Pending Reviews</span>
          {pendingCount ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          ) : null}
        </NavLink>

        <NavLink to="/doctor/reviews/completed" className={navClass}>
          <CheckCircle className="w-5 h-5" />
          Reviewed Screenings
        </NavLink>

        <NavLink to="/doctor/patients" className={navClass}>
          <Users className="w-5 h-5" />
          My Patients
        </NavLink>

        {/* Reports */}
        <div className="pt-6 pb-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Reports
          </p>
        </div>

        <NavLink to="/doctor/reports" className={navClass}>
          <FileText className="w-5 h-5" />
          Clinical Reports
        </NavLink>

        {/* Account */}
        <div className="pt-6 pb-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Account
          </p>
        </div>

        <NavLink to="/doctor/profile" className={navClass}>
          <UserIcon className="w-5 h-5" />
          My Profile
        </NavLink>

        <NavLink to="/doctor/notifications" className={navClass}>
          <Bell className="w-5 h-5" />
          Notifications
        </NavLink>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Bottom disclaimer — informational only, not a feature link */}
      <div className="p-4 mx-4 mb-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-[10px] text-gray-400 leading-relaxed text-center">
          AI results support clinical judgment and do not replace professional medical assessment.
        </p>
      </div>
    </div>
  );
};
