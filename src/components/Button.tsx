import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'neutral';
}

/**
 * 공용 CTA. Figma: 높이 48px, radius 20px, typo-body-3, 그림자 없음.
 * disabled는 gray-3 배경 + gray-4 글자 (Figma 비활성 CTA 실측).
 * neutral은 확인 다이얼로그의 취소/돌아가기 버튼 — gray-3 채움 + 흰 글자, 테두리 없음
 * (Figma 2398:3610 탈퇴 확인, 2380:2002 후기 삭제).
 */
export default function Button({ variant = 'primary', disabled, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'typo-body-3 flex h-12 w-full items-center justify-center rounded-btn',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'border border-gray-3 bg-gray-1 text-primary',
        variant === 'neutral' && 'bg-gray-3 text-white',
        disabled && 'cursor-not-allowed bg-gray-3 text-gray-4',
        className,
      )}
      {...rest}
    />
  );
}
