import { cn } from '../lib/cn';
import { ohaengByLabel } from '../lib/ohaeng';
import OhaengOrb from './OhaengOrb';

export type OhaengElement = '목' | '화' | '토' | '금' | '수';

const OHAENG_CLASS: Record<OhaengElement, string> = {
  목: 'bg-ohaeng-wood',
  화: 'bg-ohaeng-fire',
  토: 'bg-ohaeng-earth',
  금: 'bg-ohaeng-metal',
  수: 'bg-ohaeng-water',
};

interface OhaengBadgeProps {
  element: OhaengElement;
  className?: string;
  /** 구슬 크기(px). 기본 16 */
  orbSize?: number;
}

export default function OhaengBadge({
  element,
  className,
  orbSize = 16,
}: OhaengBadgeProps) {
  const ohaeng = ohaengByLabel(element);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-sans text-sm font-bold text-white',
        OHAENG_CLASS[element],
        className,
      )}
    >
      <span>{element}</span>
      {ohaeng ? <OhaengOrb element={ohaeng.key} size={orbSize} /> : null}
    </span>
  );
}
