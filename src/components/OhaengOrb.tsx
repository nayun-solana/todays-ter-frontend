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
  fire: {
    src: orbFire,
    img: { width: '117.17%', height: '116.37%', left: '-6.99%', top: '-11.58%' },
  },
  earth: { src: orbEarth },
  wood: {
    src: orbWood,
    img: { width: '117.54%', height: '117.54%', left: '-7.11%', top: '-12.56%' },
  },
  water: {
    src: orbWater,
    img: { width: '117.17%', height: '117.17%', left: '-6.93%', top: '-12.52%' },
  },
  metal: {
    src: orbMetal,
    img: { width: '117.54%', height: '117.54%', left: '-7.11%', top: '-12.48%' },
  },
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
