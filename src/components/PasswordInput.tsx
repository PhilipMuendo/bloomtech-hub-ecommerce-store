import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ value, onChange, className, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        {...props}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput; 