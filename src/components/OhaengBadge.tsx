import { cn } from '../lib/cn';
import { ohaengByLabel, type OhaengLabel } from '../lib/ohaeng';
import OhaengOrb from './OhaengOrb';

/** @deprecated 표시명 대신 `OhaengLabel`을 쓸 것. 남은 호출부 호환용 별칭. */
export type OhaengElement = OhaengLabel;

interface OhaengBadgeProps {
  element: OhaengLabel;
  className?: string;
  /** 구슬 크기(px). 기본 16 */
  orbSize?: number;
}

export default function OhaengBadge({ element, className, orbSize = 16 }: OhaengBadgeProps) {
  const ohaeng = ohaengByLabel(element);
  if (!ohaeng) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-sans text-sm font-bold text-white',
        ohaeng.bg,
        className,
      )}
    >
      <span>{element}</span>
      <OhaengOrb element={ohaeng.key} size={orbSize} />
    </span>
  );
}
