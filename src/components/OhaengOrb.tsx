import { cn } from '../lib/cn';
import { ohaengByKey, type OhaengKey } from '../lib/ohaeng';

interface OhaengOrbProps {
  element: OhaengKey;
  /** px 단위 지름 */
  size?: number;
  className?: string;
}

/** 오행 기운 구슬 (Figma export asset). 이미지는 lib/ohaeng의 `orb`가 단일 소스다. */
export default function OhaengOrb({ element, size = 36, className }: OhaengOrbProps) {
  const orb = ohaengByKey(element)?.orb;
  if (!orb) return null;

  return (
    <span
      aria-hidden="true"
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <img
        src={orb}
        alt=""
        className="pointer-events-none absolute max-w-none"
        style={{ inset: 0, width: '100%', height: '100%' }}
      />
    </span>
  );
}
