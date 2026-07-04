import { cn } from '../lib/cn';

interface OhaengOrbProps {
  /** CSS color 값 (예: var(--color-ohaeng-wood)) */
  color: string;
  /** px 단위 지름 */
  size?: number;
  className?: string;
}

/** 오행 기운 구슬. ponytail: Figma 유리구슬 asset을 radial-gradient로 근사, asset export되면 img로 교체 */
export default function OhaengOrb({ color, size = 36, className }: OhaengOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 30%, ${color} 72%)`,
      }}
    />
  );
}
