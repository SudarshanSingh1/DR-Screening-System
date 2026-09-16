import { User, Activity, Stethoscope, Settings } from 'lucide-react';
import type { UserRole, RoleConfig } from '../../types/auth';

const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'patient',
    label: 'Patient',
    description: 'Get screened and track your health',
    primaryAuth: 'mobile_otp',
    icon: 'User',
  },
  {
    role: 'screening_staff',
    label: 'Screening Staff',
    description: 'Capture and manage screening data',
    primaryAuth: 'mobile_otp',
    icon: 'Activity',
  },
  {
    role: 'doctor',
    label: 'Doctor',
    description: 'Review, validate and diagnose',
    primaryAuth: 'email_password',
    icon: 'Stethoscope',
  },
  {
    role: 'engineer_admin',
    label: 'Engineer / Admin',
    description: 'Manage system and development',
    primaryAuth: 'email_password',
    icon: 'Settings',
  },
];

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  User,
  Activity,
  Stethoscope,
  Settings,
};

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ROLE_CONFIGS.map((config) => {
        const Icon = iconMap[config.icon];
        const isSelected = selectedRole === config.role;
        return (
          <button
            key={config.role}
            type="button"
            onClick={() => onChange(config.role)}
            aria-pressed={isSelected}
            className={`rounded-xl border-2 p-4 cursor-pointer transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#2663eb] focus:ring-offset-1 ${
              isSelected
                ? 'border-[#2663eb] bg-blue-50'
                : 'border-[#bfdbfe] bg-white hover:border-blue-300'
            }`}
          >
            <div
              className={`mb-2 ${isSelected ? 'text-[#2663eb]' : 'text-[#475569]'}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p
              className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${
                isSelected ? 'text-[#2663eb]' : 'text-[#1e3a8a]'
              }`}
            >
              {config.label}
            </p>
            <p className="text-xs text-[#475569] leading-snug">
              {config.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export { ROLE_CONFIGS };
