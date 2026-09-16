import React, { useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, disabled }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        // Clear current char
        const newValue = value.substring(0, index) + ' ' + value.substring(index + 1);
        onChange(newValue.trimEnd());
      } else if (index > 0) {
        // Move to previous and clear
        inputRefs.current[index - 1]?.focus();
        const newValue = value.substring(0, index - 1) + ' ' + value.substring(index);
        onChange(newValue.trimEnd());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const val = (e.target as HTMLInputElement).value;
    // only accept digit
    if (!/^\d*$/.test(val)) return;

    const char = val.slice(-1);
    if (char) {
      let newValue = value.padEnd(length, ' ').split('');
      newValue[index] = char;
      onChange(newValue.join('').trimEnd());
      
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 max-w-sm mx-auto">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={2}
          value={value[i] || ''}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onInput={(e) => handleInput(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-50 transition-all"
        />
      ))}
    </div>
  );
};
