import { useState } from 'react';

import OhaengBadge from '../../../components/OhaengBadge';
import { cn } from '../../../lib/cn';
import { ohaengByLabel, type OhaengLabel } from '../../../lib/ohaeng';

/** 화·수·목·금·토 (오행 한글 표시명) */
export type PlaceDay = OhaengLabel;

export type RecordPlaceCardProps = {
  name: string;
  categories: readonly string[];
  dateLabel: string;
  day: PlaceDay;
  imageUrl?: string;
  className?: string;
  onClick?: () => void;
};

export default function RecordPlaceCard({
  name,
  categories,
  dateLabel,
  day,
  imageUrl,
  className,
  onClick,
}: RecordPlaceCardProps) {
  const dayTextClass = ohaengByLabel(day)?.text;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showPlaceholder = !imageUrl || failedUrl === imageUrl;

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'flex justify-between rounded-btn bg-white p-3 shadow-xs',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex gap-2.5">
        <div
          className={cn(
            'flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl',
            showPlaceholder ? '' : 'bg-gray-3',
          )}
        >
          {showPlaceholder ? (
            <div className="size-full bg-placeholder" />
          ) : (
            <img
              src={imageUrl}
              alt=""
              className="size-full object-cover"
              onError={() => {
                if (imageUrl) setFailedUrl(imageUrl);
              }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1 py-2.5">
          <h2 className="mb-2.5 truncate text-sm font-bold text-gray-6">{name}</h2>
          <p className={cn('truncate text-[10px] font-bold', dayTextClass)}>
            {categories.join('/')} • {dateLabel}
          </p>
        </div>
      </div>

      <OhaengBadge
        element={day}
        className="shrink-0 self-end px-2 py-1.5 text-[10px]"
        orbSize={14}
      />
    </article>
  );
}
