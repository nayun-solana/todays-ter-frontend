interface MatchChipsProps {
  /** 오행 글자 (수/토/화/목/금) */
  element: string;
  /** 매칭률(%) */
  matchRate: number;
  /** 해시태그 라벨 */
  hashtag: string;
}

/** 나와 어울리는 터 매칭 요약 칩 행 — 오행/매칭률/해시태그. */
export default function MatchChips({ element, matchRate, hashtag }: MatchChipsProps) {
  return (
    <div className="flex gap-1">
      <span className="flex h-9 items-center gap-1 rounded-[20px] bg-primary px-4 text-sm font-bold text-white">
        {element}
        <span className="size-4 border border-white" />
      </span>
      <span className="flex h-9 items-center gap-1 rounded-[20px] border border-gray-3 bg-white px-4 text-sm font-bold">
        <span className="text-gray-5">매칭</span>
        <span className="text-primary">{matchRate}%</span>
      </span>
      <span className="flex h-9 items-center gap-1 rounded-[20px] border border-gray-3 bg-white px-4 text-sm font-bold text-gray-5">
        <span>#</span>
        <span>{hashtag}</span>
      </span>
    </div>
  );
}
