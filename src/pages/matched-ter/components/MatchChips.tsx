import OhaengOrb from '../../../components/OhaengOrb';
import { cn } from '../../../lib/cn';
import type { OhaengMeta } from '../../../lib/ohaeng';

interface MatchChipsProps {
  /** 오행 메타 (색/라벨/오브) */
  meta: OhaengMeta;
  /** 매칭률(%) */
  matchRate: number;
  /** 해시태그 라벨 */
  hashtag: string;
}

/** 나와 어울리는 터 매칭 요약 칩 행 — 오행(색+오브)/매칭률/해시태그. */
export default function MatchChips({ meta, matchRate, hashtag }: MatchChipsProps) {
  return (
    <div className="flex gap-1">
      <span
        className={cn(
          'flex h-9 items-center gap-1 rounded-[20px] px-4 text-sm font-bold text-white',
          meta.bg,
        )}
      >
        {meta.label}
        <OhaengOrb element={meta.key} size={20} />
      </span>
      <span className="flex h-9 items-center gap-1 rounded-[20px] border border-gray-2 bg-white px-4 text-sm font-bold">
        <span className="text-gray-5">매칭</span>
        <span className={meta.text}>{matchRate}%</span>
      </span>
      <span className="flex h-9 items-center gap-1 rounded-[20px] border border-gray-2 bg-white px-4 text-sm font-bold text-gray-5">
        <span>#</span>
        <span>{hashtag}</span>
      </span>
    </div>
  );
}
