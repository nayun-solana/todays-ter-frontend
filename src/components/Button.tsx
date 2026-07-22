import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'flex h-12 w-full items-center justify-center rounded-btn text-sm font-bold shadow-btn',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'border border-gray-3 bg-gray-1 text-primary',
        fullWidth && 'w-full',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    />
  );
}
