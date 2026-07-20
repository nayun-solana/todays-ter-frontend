import { Star } from 'lucide-react';

import { cn } from '../../../lib/cn';

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
};

export default function StarRating({
  value,
  onChange,
  max = 5,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)} role="radiogroup" aria-label="별점">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const selected = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${starValue}점`}
            onClick={() => onChange(starValue)}
            className="px-0.25"
          >
            <Star
              size={28}
              className={selected ? 'fill-[#FFD310] text-[#FFD310]' : 'text-gray-3'}
              strokeWidth={1.5}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
