import { cn } from '../lib/cn';

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
}

export default function OhaengBadge({ element, className }: OhaengBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 font-sans text-sm font-bold text-white',
        OHAENG_CLASS[element],
        className,
      )}
    >
      {element}
    </span>
  );
}
