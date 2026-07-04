import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

interface StatusViewProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function StatusView({ title, description, actions, className }: StatusViewProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 px-5 py-10 text-center', className)}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-bg text-primary">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>

      <div className="flex flex-col gap-1">
        <p className="font-sans text-lg font-extrabold text-gray-6">{title}</p>
        {description && <p className="font-sans text-sm text-gray-4">{description}</p>}
      </div>

      {actions && <div className="flex w-full flex-col gap-2">{actions}</div>}
    </div>
  );
}
