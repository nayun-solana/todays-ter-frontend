import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

/**
 * 공용 CTA. Figma: 높이 48px, radius 20px, typo-body-3, 그림자 없음.
 * disabled는 gray-3 배경 + gray-4 글자 (Figma 비활성 CTA 실측).
 */
export default function Button({
  variant = 'primary',
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'typo-body-3 flex h-12 w-full items-center justify-center rounded-btn',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'border border-gray-3 bg-gray-1 text-primary',
        disabled && 'cursor-not-allowed bg-gray-3 text-gray-4',
        className,
      )}
      {...rest}
    />
  );
}
