import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'neutral';
  /**
   * 높이를 정하는 방식.
   *
   * - `fixed`(기본) — `h-12`로 48px 고정. 시안의 공용 CTA다.
   * - `padded` — `py-4` + `text-sm`(줄높이 20px)로 52px. 후기 흐름의 CTA가 이 규격이다.
   *
   * 두 규격이 왜 다른지는 시안 확인이 필요하다(#164). 확인 전까지는 픽셀을 지키려고
   * 양쪽을 남긴다 — 한쪽으로 몰면 후기 화면 버튼 높이가 4px 바뀐다.
   */
  size?: 'fixed' | 'padded';
}

/**
 * 공용 CTA. Figma: 높이 48px, radius 20px, typo-body-3, 그림자 없음.
 * disabled는 gray-3 배경 + gray-4 글자 (Figma 비활성 CTA 실측).
 * neutral은 확인 다이얼로그의 취소/돌아가기 버튼 — gray-3 채움 + 흰 글자, 테두리 없음
 * (Figma 2398:3610 탈퇴 확인, 2380:2002 후기 삭제).
 */
export default function Button({
  variant = 'primary',
  size = 'fixed',
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full rounded-btn',
        size === 'fixed' && 'typo-body-3 flex h-12 items-center justify-center',
        size === 'padded' && 'py-4 text-sm font-bold',
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
