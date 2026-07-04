import star from '../../../assets/home/star.svg';

interface RecommendedPlaceCardProps {
  image: string;
  badge: string;
  name: string;
  subtitle: string;
  description: string;
  distance: string;
  rating: number;
}

/** 홈 "오늘 가장 잘 맞는 터" 추천 장소 카드. */
export default function RecommendedPlaceCard({
  image,
  badge,
  name,
  subtitle,
  description,
  distance,
  rating,
}: RecommendedPlaceCardProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-extrabold text-gray-6">오늘 가장 잘 맞는 터</h2>
      <a className="block w-full cursor-pointer">
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
            <p className="text-xs font-normal">{subtitle}</p>
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
              <img src={star} alt="" className="size-3" />
              <span className="text-primary">{rating}</span>
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}
