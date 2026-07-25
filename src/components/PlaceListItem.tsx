import iconStar from '../assets/icon-star.svg';
import OhaengOrb from './OhaengOrb';
import { cn } from '../lib/cn';
import type { OhaengMeta } from '../lib/ohaeng';

interface PlaceListItemProps {
  name: string;
  thumbnailUrl?: string | null;
  description: string;
  tags: string[];
  rating: number;
  distance?: string;
  element: OhaengMeta;
  onClick?: () => void;
}

/** 탐색 리스트의 장소 한 줄. 좌측 썸네일 + 오행 정보 + 별점/거리. */
export default function PlaceListItem({
  name,
  thumbnailUrl,
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
      className="flex w-full overflow-hidden rounded-xl bg-white text-left shadow-card"
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={`${name} 사진`}
          className="h-21 w-21 shrink-0 object-cover"
        />
      ) : (
        <div className="h-21 w-21 shrink-0 bg-placeholder" />
      )}

      <div className="flex h-21 flex-1 items-end justify-between bg-white px-3 py-2.5">
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <p className="font-sans text-[14px] mb-1 leading-none font-bold text-gray-6">{name}</p>
            <p className="font-sans text-[10px] leading-none font-normal text-gray-4">
              {description}
            </p>
          </div>
          <p
            className={cn(
              'flex gap-1 font-sans text-[10px] leading-none font-normal',
              element.text,
            )}
          >
            {tags.map((tag) => `#${tag}`).join(' ')}
          </p>
        </div>

        <div className="flex h-16 shrink-0 flex-col items-end justify-between">
          <span className={cn('flex h-6 items-center gap-1 rounded-full px-2', element.bg)}>
            <span className="text-[10px] font-bold text-white">{element.label}</span>
            <OhaengOrb element={element.key} size={14} />
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-4">
            <span className="flex items-end gap-0.5">
              <img src={iconStar} alt="" className="size-[13px]" />
              {rating.toFixed(1)}
            </span>
            {distance ? (
              <>
                <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-gray-4" />
                <span>{distance}</span>
              </>
            ) : null}
          </span>
        </div>
      </div>
    </button>
  );
}
