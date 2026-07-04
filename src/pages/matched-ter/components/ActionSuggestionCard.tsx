import heart from '../../../assets/matched-ter/heart.svg';

/** 나와 어울리는 터 "오늘의 행동제안" 카드. */
export default function ActionSuggestionCard({ suggestion }: { suggestion: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] bg-primary p-5">
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
