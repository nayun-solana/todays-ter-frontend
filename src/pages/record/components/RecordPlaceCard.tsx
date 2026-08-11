import { useState } from 'react';

import waterOrb from '../../../assets/ohaeng/water-orb.png';
import OhaengBadge from '../../../components/OhaengBadge';
import { cn } from '../../../lib/cn';

/** 화·수·목·금·토 (오행) */
export type PlaceDay = '화' | '수' | '목' | '금' | '토';

const DAY_TEXT_CLASS: Record<PlaceDay, string> = {
  화: 'text-ohaeng-fire',
  수: 'text-ohaeng-water',
  목: 'text-ohaeng-wood',
  금: 'text-ohaeng-metal',
  토: 'text-ohaeng-earth',
};

/** thumbnailUrl이 없을 때 쓰는 폴백 이미지 */
const LOGO_FALLBACK = waterOrb;

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
  const dayTextClass = DAY_TEXT_CLASS[day];
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showLogo = !imageUrl || failedUrl === imageUrl;
  const src = showLogo ? LOGO_FALLBACK : imageUrl;

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
            showLogo ? 'bg-primary-bg p-2.5' : 'bg-gray-3',
          )}
        >
          <img
            src={src}
            alt=""
            className={cn('size-full', showLogo ? 'object-contain' : 'object-cover')}
            onError={() => {
              if (imageUrl) setFailedUrl(imageUrl);
            }}
          />
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
