import { useEffect, useId, type ReactNode } from 'react';
import { Download, Paperclip, Send, X } from 'lucide-react';

import type { PlaceDay } from './RecordPlaceCard';

export type ShareCardPlace = {
  name: string;
  day: PlaceDay;
  shareMessage: string;
  imageUrl: string;
};

type ShareCardModalProps = {
  place: ShareCardPlace;
  onClose: () => void;
};

const DAY_FILL: Record<PlaceDay, string> = {
  화: 'var(--color-ohaeng-fire)',
  수: 'var(--color-ohaeng-water)',
  목: 'var(--color-ohaeng-wood)',
  금: 'var(--color-ohaeng-metal)',
  토: 'var(--color-ohaeng-earth)',
};

/** 물방울 path */
const DROPLET_PATH =
  'M20 1C20 1 5 18 5 30c0 8.3 6.7 15 15 15s15-6.7 15-15C35 18 20 1 20 1Z';

/** 물방울 사이즈 */
const DROPLET_SIZE = 18;
const HOLE_SCALE = 0.45;

/** 단색 물방울 위치 */
const SOLID_DROPLETS = [
  { left: '20%', bottom: 172 },
  { left: '40%', bottom: 144 },
  { left: '62%', bottom: 154 },
  { left: '80%', bottom: 188 },
] as const;

/** 물방울 구멍 위치 */
const HOLE_DROPLETS = [
  { x: 26, y: -2 },
  { x: 74, y: 10 },
  { x: 148, y: 3 },
  { x: 218, y: 12 },
  { x: 278, y: 2 },
] as const;

function SolidDroplet({ fill }: { fill: string }) {
  return (
    <svg
      width={DROPLET_SIZE}
      height={DROPLET_SIZE * 1.2}
      viewBox="0 0 40 48"
      aria-hidden
    >
      <path d={DROPLET_PATH} fill={fill} />
    </svg>
  );
}

function BluePanelWithHoles({
  fill,
  message,
}: {
  fill: string;
  message: string;
}) {
  const maskId = useId();

  return (
    <div className="absolute inset-x-0 bottom-0">
      {/* 단색 패널 위쪽: 흰색 페이드 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-full h-28 bg-linear-to-b from-transparent to-white"
        aria-hidden
      />

      <div className="relative pb-10 pt-13">
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 300 140"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              {/* white = 단색 아이콘, black = 구멍 */}
              <rect width="300" height="140" fill="white" />
              {HOLE_DROPLETS.map((hole) => (
                <path
                  key={`${hole.x}-${hole.y}`}
                  d={DROPLET_PATH}
                  fill="black"
                  transform={`translate(${hole.x} ${hole.y}) scale(${HOLE_SCALE})`}
                />
              ))}
            </mask>
          </defs>
          <rect width="300" height="140" fill={fill} mask={`url(#${maskId})`} />
        </svg>

        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <p className="break-keep text-center text-xl font-extrabold leading-snug text-white">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full bg-primary-bg text-primary shadow-btn"
    >
      {children}
    </button>
  );
}

export default function ShareCardModal({ place, onClose }: ShareCardModalProps) {
  const fill = DAY_FILL[place.day];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex w-full flex-col items-center justify-center bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="오늘의 공유 카드"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[350px] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 w-full rounded-btn bg-primary py-4 text-center text-lg font-extrabold text-white">
          오늘의 공유 카드
        </div>

        <article className="relative h-[480px] w-full overflow-hidden rounded-[28px] shadow-xl">
          {/* 전체 배경 이미지 */}
          <img
            src={place.imageUrl}
            alt={place.name}
            className="absolute inset-0 size-full object-cover"
          />

          {/* 이미지 위 단색 물방울 */}
          {SOLID_DROPLETS.map((droplet) => (
            <div
              key={`${droplet.left}-${droplet.bottom}`}
              className="pointer-events-none absolute z-20"
              style={{ left: droplet.left, bottom: droplet.bottom }}
            >
              <SolidDroplet fill={fill} />
            </div>
          ))}

          {/* 하단 파란 패널 + 물방울 구멍으로 배경 이미지 노출 */}
          <BluePanelWithHoles fill={fill} message={place.shareMessage} />
        </article>

        <div className="mt-5 flex items-center gap-4">
          <ActionButton label="링크 복사">
            <Paperclip size={20} aria-hidden />
          </ActionButton>
          <ActionButton label="공유하기">
            <Send size={20} aria-hidden />
          </ActionButton>
          <ActionButton label="다운로드">
            <Download size={20} aria-hidden />
          </ActionButton>
        </div>

        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="mt-6 flex size-11 items-center justify-center rounded-full bg-gray-4 text-gray-1"
        >
          <X size={24} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
