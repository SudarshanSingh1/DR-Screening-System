import { useRef } from 'react';

interface OtpInputGroupProps {
  value: string[];
  onChange: (v: string[]) => void;
  length?: number;
}

export function OtpInputGroup({ value, onChange, length = 6 }: OtpInputGroupProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusIndex = (idx: number) => {
    if (idx >= 0 && idx < length) {
      inputRefs.current[idx]?.focus();
    }
  };

  const handleChange = (idx: number, raw: string) => {
    // Only accept single digit
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[idx] = digit;
    onChange(next);
    if (digit && idx < length - 1) {
      focusIndex(idx + 1);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[idx]) {
        const next = [...value];
        next[idx] = '';
        onChange(next);
      } else {
        focusIndex(idx - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusIndex(idx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusIndex(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array<string>(length).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    onChange(next);
    // Focus last filled or end
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="One-time password input"
    >
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] ?? ''}
          aria-label={`OTP digit ${idx + 1} of ${length}`}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-[#bfdbfe] focus:border-[#2663eb] focus:ring-2 focus:ring-[#2663eb]/20 outline-none transition-colors bg-white text-[#1e3a8a] caret-[#2663eb]"
        />
      ))}
    </div>
  );
}
