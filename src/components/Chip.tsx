import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** 필터/태그용 알약 칩. 선택 시 primary 채움. */
export default function Chip({ selected = false, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'shrink-0 rounded-btn border px-4 py-2 font-sans text-sm transition-colors',
        selected
          ? 'border-primary bg-primary font-bold text-white'
          : 'border-gray-3 bg-white font-normal text-gray-4',
        className,
      )}
      {...rest}
    />
  );
}
