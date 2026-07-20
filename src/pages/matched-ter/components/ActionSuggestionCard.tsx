import heart from '../../../assets/matched-ter/heart.svg';
import { cn } from '../../../lib/cn';
import type { OhaengMeta } from '../../../lib/ohaeng';

interface ActionSuggestionCardProps {
  /** 오행 메타 (카드 배경색) */
  meta: OhaengMeta;
  /** 행동 제안 문구 (개행 포함) */
  suggestion: string;
}

/** 나와 어울리는 터 "오늘의 행동제안" 카드. */
export default function ActionSuggestionCard({ meta, suggestion }: ActionSuggestionCardProps) {
  return (
    <div className={cn('flex flex-col gap-2.5 rounded-[20px] p-5', meta.bg)}>
      <div className="flex items-center gap-1">
        <img src={heart} alt="" className="size-4" />
        <p className="text-[10px] font-bold text-white">오늘의 행동제안</p>
      </div>
      <p className="whitespace-pre-line text-base font-bold leading-[22px] text-white">
        {suggestion}
      </p>
    </div>
  );
}
