import iconStar from '../assets/icon-star.svg';
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
      className="flex w-full text-left drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"
    >
      {/* ponytail: 장소 사진 asset 미확보 → 회색 placeholder(디자인 원본도 회색), 사진 연동 시 img 교체 */}
      <div className="flex h-21 w-21 shrink-0 items-start rounded-l-xl bg-[#d6d6d6] p-1.5">
        <span className={cn('flex items-center gap-1 rounded-lg px-1.5 py-1', element.bg)}>
          <span className="font-sans text-[10px] font-bold text-white">{element.label}</span>
          <OhaengOrb element={element.key} size={12} />
        </span>
      </div>

      <div className="flex h-21 flex-1 items-end justify-between rounded-r-xl bg-white px-3 py-2.5">
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <p className="font-sans text-base font-bold text-black1">{name}</p>
            <p className="font-sans text-[10px] font-normal text-gray-4">{description}</p>
          </div>
          <p className={cn('flex gap-1 font-sans text-[10px] font-normal', element.text)}>
            {tags.map((tag) => `#${tag}`).join(' ')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 font-sans text-[10px] font-bold text-gray-4">
          <span className="flex items-end gap-0.5">
            <img src={iconStar} alt="" className="size-[13px]" />
            {rating.toFixed(1)}
          </span>
          <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-gray-4" />
          <span>{distance}</span>
        </div>
      </div>
    </button>
  );
}
