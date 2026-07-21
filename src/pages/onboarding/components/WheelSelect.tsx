import { useEffect, useRef } from 'react';

import { cn } from '../../../lib/cn';

const ROW_H = 48;

export interface WheelColumnSpec {
  options: number[];
  value: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}

/** 단일 스크롤 휠 컬럼. 스냅 스크롤로 가운데 행을 선택한다. (Figma 2:715/2:834) */
function WheelColumn({ options, value, format, onChange }: WheelColumnSpec) {
  const ref = useRef<HTMLDivElement>(null);
  const ignoreScroll = useRef(false);

  // 열릴 때(마운트 시) 현재 값 위치로 초기 스크롤. 프로그램 스크롤이 onChange를 유발하지 않도록 가드.
  useEffect(() => {
    const index = options.indexOf(value);
    if (index < 0 || !ref.current) return;
    ignoreScroll.current = true;
    ref.current.scrollTo({ top: index * ROW_H });
    const raf = requestAnimationFrame(() => {
      ignoreScroll.current = false;
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      onScroll={(event) => {
        if (ignoreScroll.current) return;
        const index = Math.max(
          0,
          Math.min(options.length - 1, Math.round(event.currentTarget.scrollTop / ROW_H)),
        );
        if (options[index] !== value) onChange(options[index]);
      }}
      className="h-36 snap-y snap-mandatory overflow-y-auto py-12 text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => (
        <div
          key={option}
          className="flex h-12 snap-center items-center justify-center text-sm font-bold text-gray-5"
        >
          {format(option)}
        </div>
      ))}
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 6" fill="none" aria-hidden className={cn('h-1.5 w-2.5', className)}>
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WheelSelectProps {
  label: string;
  /** 접힘 상태에 보일 값(선택됨) 또는 placeholder */
  display: string;
  /** 값이 선택되었는지(색상 구분용) */
  filled: boolean;
  open: boolean;
  onToggle: () => void;
  columns: WheelColumnSpec[];
  /** 우측 인라인 슬롯 (예: 태어난 시간의 '시간 모름') — 접힘 상태에서만 노출 */
  trailing?: React.ReactNode;
  /** 오류 문구 (예: 미래 날짜) */
  error?: string;
  /** 오류 시 흔들림 */
  shake?: boolean;
}

/** 온보딩1 생년월일·태어난시간 휠 드롭다운 필드. 접힘=언더라인, 펼침=휠 박스. */
export default function WheelSelect({
  label,
  display,
  filled,
  open,
  onToggle,
  columns,
  trailing,
  error,
  shake,
}: WheelSelectProps) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm font-bold text-gray-6">{label}</p>

      {open ? (
        <div className="overflow-hidden rounded-[20px] border border-primary-light bg-gray-1">
          <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <span className={cn('text-sm font-bold', filled ? 'text-gray-5' : 'text-gray-disabled')}>
              {display}
            </span>
            <ChevronDown className="text-gray-5" />
          </button>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[7px] top-12 h-12 rounded-[20px] bg-gray-2"
            />
            <div
              className="relative z-10 grid"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((col, index) => (
                <WheelColumn key={index} {...col} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(shake && 'animate-onboarding-shake')}>
          <div className="flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                'flex min-w-0 flex-1 border-b pb-2 text-left text-sm font-bold outline-none',
                error
                  ? 'border-[#ff5353] text-[#ff5353]'
                  : filled
                    ? 'border-primary text-primary'
                    : 'border-gray-3 text-gray-disabled',
              )}
            >
              {display}
            </button>
            {trailing}
          </div>
          {error ? <p className="mt-2 text-[10px] font-bold text-gray-4">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
