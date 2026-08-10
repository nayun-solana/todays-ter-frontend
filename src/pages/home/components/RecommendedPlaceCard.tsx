import star from '../../../assets/home/star.svg';

interface RecommendedPlaceCardProps {
  image: string;
  badge: string;
  name: string;
  /** BE에 대응 필드가 없어 optional. 시안 싱크에서 문구를 확정할 것. */
  subtitle?: string;
  description: string;
  /** "3.5km". 서버가 거리를 안 주면 빈 문자열. */
  distance: string;
  rating: number;
  onClick?: () => void;
}

/** 홈 "오늘 가장 잘 맞는 터" 추천 장소 카드 1장. (섹션 제목·리스트·게이트는 HomePage가 관리) */
export default function RecommendedPlaceCard({
  image,
  badge,
  name,
  subtitle,
  description,
  distance,
  rating,
  onClick,
}: RecommendedPlaceCardProps) {
  return (
    <a onClick={onClick} className="block w-full cursor-pointer">
      {/* 이미지 + 그라데이션 오버레이 */}
      <div className="relative flex h-[120px] flex-col justify-between rounded-t-[20px] px-[18px] py-4">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 size-full rounded-t-[20px] object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-[85px] rounded-t-[20px] bg-gradient-to-b from-transparent to-black/80" />
        <span className="relative self-start rounded-md bg-gray-4/90 px-2.5 py-1.5 text-xs font-bold text-white">
          {badge}
        </span>
        <div className="relative flex flex-col gap-1 text-white">
          <p className="text-base font-bold">{name}</p>
          {subtitle && <p className="text-xs font-normal">{subtitle}</p>}
        </div>
      </div>
      {/* 하단 설명 영역 */}
      <div className="flex flex-col gap-2.5 rounded-b-[20px] bg-white/90 p-[15px] shadow-[0_0_15px_0_rgba(0,0,0,0.05)]">
        <p className="whitespace-pre-line text-xs font-normal leading-4 text-gray-5">
          {description}
        </p>
        <div className="flex items-center gap-1 text-xs font-normal">
          <span className="text-gray-4">{distance}</span>
          <span className="size-0.5 rounded-full bg-gray-4" />
          <span className="flex items-center gap-0.5">
            <img src={star} alt="" className="size-4" />
            <span className="text-gray-4">{rating}</span>
          </span>
        </div>
      </div>
    </a>
  );
}
