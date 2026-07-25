import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  /**
   * @deprecated 아무 효과 없음 — 기본 스타일에 이미 w-full이 있다.
   * 기존 호출부(온보딩·matched-ter) 호환용으로만 남겨둔 값.
   */
  fullWidth?: boolean;
}

/**
 * 공용 CTA. Figma: 높이 48px, radius 20px, typo-body-3, 그림자 없음.
 * disabled는 gray-3 배경 + gray-4 글자 (Figma 비활성 CTA 실측).
 */
export default function Button({
  variant = 'primary',
  fullWidth,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  void fullWidth; // deprecated — DOM으로 새어나가지 않게 구조분해만 하고 버린다

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
