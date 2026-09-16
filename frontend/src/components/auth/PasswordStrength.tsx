interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'Uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Number', test: (pw) => /\d/.test(pw) },
  { label: 'Special character (!@#$%^&*…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  return (
    <ul className="space-y-1 mt-2" aria-label="Password requirements">
      {REQUIREMENTS.map((req) => {
        const met = req.test(password);
        return (
          <li key={req.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                met
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              ✓
            </span>
            <span
              className={`text-xs transition-colors ${
                met ? 'text-green-700' : 'text-[#475569]'
              }`}
            >
              {req.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Returns true when all password requirements are satisfied */
export function isPasswordStrong(password: string): boolean {
  return REQUIREMENTS.every((req) => req.test(password));
}
