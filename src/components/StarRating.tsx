import { Star } from 'lucide-react';

import { cn } from '../lib/cn';

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  className?: string;
};

export default function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  className,
}: StarRatingProps) {
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `별점 ${value}점` : '별점'}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const selected = starValue <= value;
        const star = (
          <Star
            size={28}
            className={selected ? 'fill-[#FFD310] text-[#FFD310]' : 'text-gray-3'}
            strokeWidth={1.5}
            aria-hidden
          />
        );

        if (readOnly) {
          return (
            <span key={starValue} className="px-px">
              {star}
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${starValue}점`}
            onClick={() => onChange?.(starValue)}
            className="px-px"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
