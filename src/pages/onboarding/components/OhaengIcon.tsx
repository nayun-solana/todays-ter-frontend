import { cn } from '../../../lib/cn';
import { ohaengByCode, type OhaengCode } from '../../../lib/ohaeng';

type OhaengIconType = 'primary' | 'complementary' | 'secondary';

type Props = {
  /** BE 오행 코드. 표시명이 아니라 코드로 받는다 — 한글은 BE가 문구를 다듬으면 깨진다. */
  element: OhaengCode;
  type: OhaengIconType;
  /** complementary일 때 테두리 색 클래스. 기본 primary. */
  border?: string;
  /** complementary일 때 글자 색 클래스. 기본 primary. */
  textColor?: string;
};

const SURFACE: Record<OhaengIconType, string> = {
  primary: 'bg-primary border border-primary',
  complementary: 'bg-white border',
  secondary: 'bg-primary border border-white',
};

/** 주 오행 / 보완 오행 배지. (온보딩 리포트) */
export default function OhaengIcon({ element, type, border, textColor }: Props) {
  const ohaeng = ohaengByCode(element);
  if (!ohaeng) return null;

  const isComplementary = type === 'complementary';

  return (
    <div
      className={cn(
        'typo-body-4 flex w-fit items-center justify-center gap-1 rounded-btn px-3 py-2',
        SURFACE[type],
        isComplementary ? (border ?? 'border-primary') : undefined,
        isComplementary ? (textColor ?? 'text-primary') : 'text-white',
      )}
    >
      <p>{isComplementary ? '보완 할 오행' : '주 오행'}</p>
      <p>:</p>
      <p>{ohaeng.label}</p>
      {/* OhaengOrb를 쓰지 않는다 — 그쪽은 rounded-full 클리핑 래퍼가 붙어 이 배지의 시안과 다르다. */}
      <img src={ohaeng.orb} alt={element} className="h-4 w-4" />
    </div>
  );
}
