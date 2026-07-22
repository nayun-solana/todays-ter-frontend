import { cn } from '../../../lib/cn';

interface CategoryCardProps {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * 온보딩3 고민 유형 선택 카드 (다중 선택 토글).
 * 온보딩3 화면 전용 로컬 컴포넌트 — 공용화 여부는 Step6에서 판단.
 */
export default function CategoryCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex h-[100px] flex-col items-start gap-3 rounded-btn bg-white px-4 py-3 text-left shadow-btn transition-colors',
        selected ? 'border-[1.2px] border-primary' : 'border border-gray-3',
      )}
    >
      {/* 아이콘: 시안이 회색 플레이스홀더라 동일 처리 — 에셋 확정 후 교체 */}
      <img src={icon} alt={title} className="h-6 w-6" />
      <span className="flex flex-col gap-1.5">
        <span
          className={cn('text-[15px] font-extrabold', selected ? 'text-primary' : 'text-gray-5')}
        >
          {title}
        </span>
        <span className="text-[10px] font-normal text-gray-4">{description}</span>
      </span>
    </button>
  );
}
