import type { CSSProperties } from 'react';

import orbEarth from '../assets/orb-earth.png';
import orbFire from '../assets/orb-fire.png';
import orbMetal from '../assets/orb-metal.png';
import orbWater from '../assets/orb-water.png';
import orbWood from '../assets/orb-wood.png';
import { cn } from '../lib/cn';
import type { OhaengKey } from '../lib/ohaeng';

/** Figma 원본 asset의 crop 오프셋 (mask 36px 기준 백분율) */
const ORBS: Record<OhaengKey, { src: string; img?: CSSProperties }> = {
  fire: { src: orbFire },
  earth: { src: orbEarth },
  wood: { src: orbWood },
  water: { src: orbWater },
  metal: { src: orbMetal },
};

interface OhaengOrbProps {
  element: OhaengKey;
  /** px 단위 지름 */
  size?: number;
  className?: string;
}

/** 오행 기운 구슬 (Figma export asset). */
export default function OhaengOrb({ element, size = 36, className }: OhaengOrbProps) {
  const orb = ORBS[element];
  return (
    <span
      aria-hidden="true"
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <img
        src={orb.src}
        alt=""
        className="pointer-events-none absolute max-w-none"
        style={orb.img ?? { inset: 0, width: '100%', height: '100%' }}
      />
    </span>
  );
}
