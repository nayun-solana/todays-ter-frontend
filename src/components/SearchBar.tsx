import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/** 돋보기 아이콘이 붙은 검색 입력. */
export default function SearchBar({ className, ...rest }: SearchBarProps) {
  return (
    <label className={cn('flex h-10 items-center gap-2 rounded-full bg-white px-4', className)}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="shrink-0 text-gray-4"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        className="w-full bg-transparent font-sans text-sm text-gray-6 outline-none placeholder:text-gray-4"
        {...rest}
      />
    </label>
  );
}
