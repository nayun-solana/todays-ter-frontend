interface ProgressBarProps {
  /** 채울 칸 수. 0이면 하나도 안 찬 상태(첫 단계 진입 시점). */
  step: number;
  /** 전체 칸 수. */
  total: number;
  /**
   * 배경색에 맞춘 색 조합.
   * - `light`(기본): 흰 배경 위 — 채움 primary, 빈 칸 gray-disabled
   * - `onPrimary`: 파란 배경 위(온보딩 2) — 채움 흰색, 빈 칸 반투명 흰색
   */
  tone?: 'light' | 'onPrimary';
}

const FILLED_CLASS = {
  light: 'bg-primary',
  onPrimary: 'bg-white',
} as const;

const EMPTY_CLASS = {
  light: 'bg-gray-disabled',
  onPrimary: 'bg-white/30',
} as const;

/**
 * 온보딩 단계 진행바 — 시안이 연속형 막대가 아니라 **분할 세그먼트**다.
 *
 * 예전에는 연속형(width %) 하나와 페이지마다 복붙한 세그먼트 마크업이 섞여 있어서
 * 같은 진행바가 화면마다 다르게 보였다. 세그먼트 한 벌로 합친다.
 */
export default function ProgressBar({ step, total, tone = 'light' }: ProgressBarProps) {
  const filledCount = Math.min(Math.max(step, 0), total);

  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filledCount}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-1 flex-1 rounded-full ${index < filledCount ? FILLED_CLASS[tone] : EMPTY_CLASS[tone]}`}
        />
      ))}
    </div>
  );
}
