import info from '../../../assets/matched-ter/info.svg';
import { cn } from '../../../lib/cn';
import type { OhaengMeta } from '../../../lib/ohaeng';

interface WhyMatchCardProps {
  /** 오행 메타 (사주 매칭 포인트 강조색) */
  meta: OhaengMeta;
  /** 매칭 이유 설명 (개행 포함) */
  reason: string;
  /** 사주 매칭 포인트 칩 목록 */
  points: string[];
}

/** 나와 어울리는 터 "왜 나에게 맞나요?" 카드 + 사주 매칭 포인트. */
export default function WhyMatchCard({ meta, reason, points }: WhyMatchCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-gray-2 bg-white p-5 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <img src={info} alt="" className="size-4" />
          <p className="text-[10px] font-bold text-primary">왜 나에게 맞나요?</p>
        </div>
        <p className="whitespace-pre-line text-xs font-normal leading-[18px] text-gray-5">
          {reason}
        </p>
      </div>
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-[20px] border px-4 py-3.5',
          meta.border,
        )}
      >
        <p className={cn('text-sm font-bold', meta.text)}>사주 매칭 포인트</p>
        <div className="flex gap-1">
          {points.map((point) => (
            <span
              key={point}
              className={cn(
                'rounded-[20px] border border-gray-2 bg-white px-3 py-1.5 typo-sub-2',
                meta.text,
              )}
            >
              {point}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
