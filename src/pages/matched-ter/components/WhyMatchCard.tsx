import info from '../../../assets/matched-ter/info.svg';

interface WhyMatchCardProps {
  /** 매칭 이유 설명 (개행 포함) */
  reason: string;
  /** 사주 매칭 포인트 칩 목록 */
  points: string[];
}

/** 나와 어울리는 터 "왜 나에게 맞나요?" 카드 + 사주 매칭 포인트. */
export default function WhyMatchCard({ reason, points }: WhyMatchCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-gray-3 bg-white p-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <img src={info} alt="" className="size-4" />
          <p className="text-[10px] font-bold text-primary">왜 나에게 맞나요?</p>
        </div>
        <p className="whitespace-pre-line text-xs font-normal leading-[18px] text-gray-5">
          {reason}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-[20px] border border-primary px-4 py-3.5">
        <p className="text-sm font-bold text-primary">사주 매칭 포인트</p>
        <div className="flex gap-1">
          {points.map((point) => (
            <span
              key={point}
              className="rounded-[20px] border border-gray-3 bg-white px-3 py-1.5 text-xs font-normal text-primary"
            >
              {point}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
