import { cn } from '../lib/cn';

interface SectionErrorProps {
  message: string;
  onRetry: () => void;
  /** 배경 그라데이션 위(홈 인사말 영역)에서 쓰는 흰 글씨 버전. */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * 영역 단위 실패 안내 + 재시도.
 *
 * 화면 전체를 실패로 덮지 않고 실패한 영역만 바꿔 끼운다 — 홈처럼 독립적인 API가 여럿인
 * 화면에서 한 곳이 죽어도 나머지는 그대로 보여주기 위한 것이다.
 * 재시도 버튼이 있어야 하는 이유: `viewStateOf`가 'failed'로 보는 상태에는 오프라인 판정으로
 * **멈춘**(paused) 쿼리가 포함되는데, 그건 사용자가 다시 눌러야 풀린다.
 */
export default function SectionError({
  message,
  onRetry,
  tone = 'dark',
  className,
}: SectionErrorProps) {
  const isLight = tone === 'light';

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center justify-between gap-3 rounded-[20px] px-5 py-4',
        isLight ? 'bg-white/20 text-white' : 'bg-white text-gray-5',
        className,
      )}
    >
      <p className="text-sm font-bold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 typo-body-4',
          isLight ? 'bg-white/30 text-white' : 'bg-gray-1 text-primary',
        )}
      >
        다시 시도
      </button>
    </div>
  );
}
