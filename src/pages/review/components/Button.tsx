import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../../lib/cn';

type ReviewButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export default function Button({
  variant = 'primary',
  disabled,
  className,
  ...rest
}: ReviewButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full rounded-btn py-4 text-sm font-bold',
        variant === 'primary' &&
          (disabled
            ? 'cursor-not-allowed bg-gray-3 text-gray-4'
            : 'bg-primary text-white'),
        variant === 'secondary' &&
          'border border-primary-light bg-primary-bg text-primary',
        className,
      )}
      {...rest}
    />
  );
}
