import type { TextareaHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type TextInputProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextInput({ className, ...rest }: TextInputProps) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-2xl bg-gray-1 px-4 py-3 font-sans text-xs text-gray-6 outline-none placeholder:text-gray-4 border border-gray-3',
        className,
      )}
      {...rest}
    />
  );
}
