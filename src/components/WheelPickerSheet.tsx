import { useEffect, useRef } from 'react';

import Button from './Button';

const ROW_H = 48;

export interface WheelColumnSpec {
  options: readonly number[];
  value: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}

/** 단일 스크롤 휠 컬럼. 스냅 스크롤로 가운데 행을 선택한다. */
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
      className="h-36 snap-y snap-mandatory overflow-y-auto py-12 text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={(event) => {
        if (ignoreScroll.current) return;
        const index = Math.max(
          0,
          Math.min(options.length - 1, Math.round(event.currentTarget.scrollTop / ROW_H)),
        );
        if (options[index] !== value) onChange(options[index]);
      }}
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

interface WheelPickerSheetProps {
  open: boolean;
  /** 시트 제목 (예: '생년월일 입력') */
  title: string;
  columns: WheelColumnSpec[];
  /** '확인' — 지금 맞춰둔 값을 확정한다. */
  onConfirm: () => void;
  /** 배경 탭 — 값을 버리고 닫는다. */
  onClose: () => void;
}

/**
 * 생년월일·태어난 시간을 고르는 바텀시트 휠 피커. (Figma 3354:3104 · 3354:3276)
 *
 * 값은 '확인'을 눌러야 확정된다. 휠을 돌리는 동안의 값은 호출부가 임시(draft) 상태로 들고 있고,
 * 배경을 탭해 닫으면 호출부가 그 임시값을 되돌린다 — 연·월에 따라 일 목록이 달라지는 것처럼
 * 컬럼끼리 얽힌 계산이 호출부에 있어서, 시트는 값을 보관하지 않는다.
 */
export default function WheelPickerSheet({
  open,
  title,
  columns,
  onConfirm,
  onClose,
}: WheelPickerSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative w-full rounded-t-btn bg-white px-5 pb-8 pt-8">
        <h2 className="text-xl font-extrabold text-gray-6">{title}</h2>

        <div className="relative mt-6">
          {/* 가운데 선택 행 강조 — 휠 뒤에 깔린다. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-12 h-12 rounded-btn bg-gray-2"
          />
          <div
            className="relative z-10 grid"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((column, index) => (
              <WheelColumn key={index} {...column} />
            ))}
          </div>
        </div>

        <Button variant="primary" className="mt-6" onClick={onConfirm}>
          확인
        </Button>
      </div>
    </div>
  );
}
