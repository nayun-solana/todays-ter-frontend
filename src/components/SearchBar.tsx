import type { InputHTMLAttributes } from 'react';

import iconSearch from '../assets/icon-search.svg';
import { cn } from '../lib/cn';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/** 돋보기 아이콘이 붙은 검색 입력. */
export default function SearchBar({ className, ...rest }: SearchBarProps) {
  return (
    <label
      className={cn(
        'flex h-10 items-center gap-1.5 rounded-btn border border-gray-3 bg-white px-4 py-2',
        className,
      )}
    >
      <img src={iconSearch} alt="" className="size-5 shrink-0" />
      <input
        type="search"
        className="w-full bg-transparent font-sans text-sm font-normal text-gray-6 outline-none placeholder:text-gray-3"
        {...rest}
      />
    </label>
  );
}
