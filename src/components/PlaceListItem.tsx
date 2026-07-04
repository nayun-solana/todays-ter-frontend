import OhaengOrb from './OhaengOrb';
import { cn } from '../lib/cn';
import type { OhaengMeta } from '../lib/ohaeng';

interface PlaceListItemProps {
  name: string;
  description: string;
  tags: string[];
  rating: number;
  distance: string;
  element: OhaengMeta;
  onClick?: () => void;
}

/** 탐색/기록 리스트의 장소 한 줄. 좌측 썸네일 + 오행 배지 + 별점/거리. */
export default function PlaceListItem({
  name,
  description,
  tags,
  rating,
  distance,
  element,
  onClick,
}: PlaceListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full overflow-hidden rounded-xl border border-gray-3/60 bg-white text-left"
    >
      {/* ponytail: 장소 사진 asset 미확보 → 회색 placeholder, asset 연동 시 img 교체 */}
      <div className="relative h-21 w-21 shrink-0 bg-gray-3">
        <span className="absolute top-1.5 left-1.5 flex h-5 items-center gap-1 rounded-full bg-white pr-1 pl-1.5">
          <span className={cn('font-sans text-[10px] font-bold', element.text)}>
            {element.label}
          </span>
          <OhaengOrb color={element.cssVar} size={12} />
        </span>
      </div>

      <div className="flex flex-1 items-end justify-between px-3 py-2.5">
        <div className="flex flex-col">
          <p className="font-sans text-base font-bold text-gray-6">{name}</p>
          <p className="mt-1.5 font-sans text-[11px] text-gray-4">{description}</p>
          <p className={cn('mt-3 font-sans text-[11px] font-bold', element.text)}>
            {tags.map((tag) => `#${tag}`).join(' ')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 font-sans text-[11px] text-gray-5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-amber-400"
            aria-hidden="true"
          >
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2l-6.2 3.7 1.6-7L2 9.2l7.1-.6z" />
          </svg>
          <span className="font-bold">{rating.toFixed(1)}</span>
          <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-gray-4" />
          <span>{distance}</span>
        </div>
      </div>
    </button>
  );
}
