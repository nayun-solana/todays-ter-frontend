import { cn } from '../lib/cn';

/** 화·수·목·금·토 (오행) */
export type PlaceDay = '화' | '수' | '목' | '금' | '토';

const DAY_CLASS: Record<PlaceDay, { text: string; badge: string }> = {
  화: { text: 'text-badge-fire', badge: 'bg-badge-fire' },
  수: { text: 'text-badge-water', badge: 'bg-badge-water' },
  목: { text: 'text-badge-wood', badge: 'bg-badge-wood' },
  금: { text: 'text-badge-metal', badge: 'bg-badge-metal' },
  토: { text: 'text-badge-earth', badge: 'bg-badge-earth' },
};

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
  const dayClass = DAY_CLASS[day];

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
        'flex items-center gap-2.5 rounded-btn bg-white p-3 shadow-btn',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-gray-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold text-gray-6">{name}</h2>
        <p className={cn('mt-0.5 truncate text-xs', dayClass.text)}>
          {categories.join('/')} • {dateLabel}
        </p>
      </div>

      <div
        className={cn(
          'flex items-center justify-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-white',
          dayClass.badge,
        )}
        aria-hidden
      >
        <span>{day}</span>
        <span className="size-2.5 rounded-sm bg-white/80" />
      </div>
    </article>
  );
}
