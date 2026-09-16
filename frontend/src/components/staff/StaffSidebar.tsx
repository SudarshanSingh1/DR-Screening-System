import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, UserPlus, Building2, Search, 
  Activity, Clock, CheckCircle, 
  
  
  User, X 
} from 'lucide-react';


interface StaffSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ mobileOpen, setMobileOpen }) => {

  const navGroups = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: Home, path: '/staff/dashboard' }
      ]
    },
    {
      title: 'Patient Management',
      items: [
        { label: 'Find Patient', icon: Search, path: '/staff/patients/search' },
        { label: 'Register Patient', icon: UserPlus, path: '/staff/patients/register' }
      ]
    },
    {
      title: 'Screening',
      items: [
        { label: 'New Screening', icon: Activity, path: '/staff/screenings/new' },
        { label: 'In Progress', icon: Clock, path: '/staff/screenings/in-progress' },
        { label: 'Completed', icon: CheckCircle, path: '/staff/screenings/completed' }
      ]
    },
    {
      title: 'Directory',
      items: [
        { label: 'Doctors & Facilities', icon: Building2, path: '/staff/directory' }
      ]
    },
    {
      title: 'Profile',
      items: [
        { label: 'My Profile', icon: User, path: '/staff/profile' }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-6 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <img src="/VisionAi.png" alt="Vision AI Logo" className="h-8 object-contain" />
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700" 
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {group.title !== 'Main' && (
              <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        {sidebarContent}
      </div>
    </>
  );
};
