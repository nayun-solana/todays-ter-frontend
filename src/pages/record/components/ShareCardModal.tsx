import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { toPng } from 'html-to-image';
import { Download, X } from 'lucide-react';

import type { ApiError } from '../../../api/types';
import defaultBg from '../../../assets/review/default.png';
import earthIcon from '../../../assets/review/earth.png';
import fireIcon from '../../../assets/review/fire.png';
import metalIcon from '../../../assets/review/metal.png';
import treeIcon from '../../../assets/review/tree.png';
import waterIcon from '../../../assets/review/water.png';
import { usePlaceShareCard } from '../../../hooks/place/usePlace';
import type { PlaceDay } from './RecordPlaceCard';

/** Google Places 대표 이미지 없음 등 — 배경만 로컬 폴백 */
const SHARE_CARD_IMAGE_MISSING_CODE = 'PLACE404_3';

type ShareCardModalProps = {
  placeId: number;
  /** API 실패(PLACE404_3) 시 카드에 표시할 장소명 */
  fallbackPlaceName?: string;
  /** 다녀온 터 목록에서 넘긴 오행(기운) — 공유 카드 색·도형에 사용 */
  element?: PlaceDay;
  onClose: () => void;
};

const DAY_FILL: Record<PlaceDay, string> = {
  화: 'var(--color-ohaeng-fire)',
  수: 'var(--color-ohaeng-water)',
  목: 'var(--color-ohaeng-wood)',
  금: 'var(--color-ohaeng-metal)',
  토: 'var(--color-ohaeng-earth)',
};

/** 오행별 장식·구멍 실루엣 */
const ELEMENT_SHAPE: Record<PlaceDay, string> = {
  화: fireIcon,
  수: waterIcon,
  목: treeIcon,
  금: metalIcon,
  토: earthIcon,
};

const DEFAULT_SHAPE_SIZE = 20;
/** 토 아이콘만 조금 크게 */
const ELEMENT_SHAPE_SIZE: Record<PlaceDay, number> = {
  화: DEFAULT_SHAPE_SIZE,
  수: DEFAULT_SHAPE_SIZE,
  목: DEFAULT_SHAPE_SIZE,
  금: DEFAULT_SHAPE_SIZE,
  토: 28,
};

/** 장식 도형 위치 */
const SOLID_SHAPES = [
  { left: '20%', bottom: 182 },
  { left: '40%', bottom: 154 },
  { left: '62%', bottom: 164 },
  { left: '80%', bottom: 198 },
] as const;

/** 패널 구멍 위치 */
const HOLE_SHAPES = [
  { x: 26, y: -2 },
  { x: 74, y: 10 },
  { x: 148, y: 3 },
  { x: 218, y: 12 },
  { x: 278, y: 2 },
] as const;

function shapeMaskStyle(shapeSrc: string, fill: string, size: number): CSSProperties {
  return {
    width: size,
    height: size,
    backgroundColor: fill,
    WebkitMaskImage: `url(${shapeSrc})`,
    maskImage: `url(${shapeSrc})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    maskMode: 'luminance',
  };
}

function panelHoleMaskStyle(shapeSrc: string, fill: string, size: number): CSSProperties {
  const holeSize = `${size}px`;

  return {
    backgroundColor: fill,
    WebkitMaskImage: [
      'linear-gradient(#fff, #fff)',
      ...HOLE_SHAPES.map(() => `url(${shapeSrc})`),
    ].join(', '),
    maskImage: [
      'linear-gradient(#fff, #fff)',
      ...HOLE_SHAPES.map(() => `url(${shapeSrc})`),
    ].join(', '),
    WebkitMaskPosition: [
      '0 0',
      ...HOLE_SHAPES.map((hole) => `${hole.x}px ${hole.y}px`),
    ].join(', '),
    maskPosition: [
      '0 0',
      ...HOLE_SHAPES.map((hole) => `${hole.x}px ${hole.y}px`),
    ].join(', '),
    // mask-size는 "가로 세로" 한 쌍. 정사각이면 값 하나만 써도 됨(가로=세로).
    WebkitMaskSize: ['100% 100%', ...HOLE_SHAPES.map(() => holeSize)].join(', '),
    maskSize: ['100% 100%', ...HOLE_SHAPES.map(() => holeSize)].join(', '),
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    maskMode: 'luminance',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  };
}

function SolidShape({ fill, element }: { fill: string; element: PlaceDay }) {
  const size = ELEMENT_SHAPE_SIZE[element];
  return <div aria-hidden style={shapeMaskStyle(ELEMENT_SHAPE[element], fill, size)} />;
}

function PanelWithHoles({
  fill,
  message,
  element,
}: {
  fill: string;
  message: string;
  element: PlaceDay;
}) {
  const size = ELEMENT_SHAPE_SIZE[element]-4;

  return (
    <div className="absolute inset-x-0 bottom-0">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-full h-28 bg-linear-to-b from-transparent to-white"
        aria-hidden
      />

      <div className="relative pb-10 pt-13">
        <div
          className="absolute inset-0"
          aria-hidden
          style={panelHoleMaskStyle(ELEMENT_SHAPE[element], fill, size)}
        />

        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <p className="whitespace-pre-line break-keep text-center text-xl font-extrabold leading-snug text-white">
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
  onClick,
  disabled,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-10 items-center justify-center rounded-full bg-primary-bg text-primary shadow-btn disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default function ShareCardModal({
  placeId,
  fallbackPlaceName,
  element: listElement,
  onClose,
}: ShareCardModalProps) {
  const shareCardQuery = usePlaceShareCard(placeId);
  const card = shareCardQuery.data;
  const error = shareCardQuery.error as unknown as ApiError | null | undefined;
  const isImageMissingError = error?.code === SHARE_CARD_IMAGE_MISSING_CODE;

  const placeName = card?.placeName ?? fallbackPlaceName ?? '오늘의 터';
  /** 목록에서 본 기운을 우선 — share-cards 실패/누락 시에도 수로 고정되지 않게 */
  const element: PlaceDay = listElement ?? card?.element ?? '수';
  const fill = DAY_FILL[element];
  const shareMessage = `오늘은 ${element}의 기운 받으러\n${placeName}(으)로 !`;
  const cardRef = useRef<HTMLElement>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const remoteUrl = !isImageMissingError ? card?.imageUrl?.trim() || null : null;
  const bgSrc = remoteUrl && failedUrl !== remoteUrl ? remoteUrl : defaultBg;
  const canShowCard = Boolean(card) || isImageMissingError;

  async function handleDownload() {
    if (!cardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `todays-ter-${placeName.replace(/[\\/:*?"<>|]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // 외부 이미지 CORS 등으로 실패할 수 있음
    } finally {
      setIsDownloading(false);
    }
  }

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
        className="flex w-full max-w-[350px] px-5 flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 w-full rounded-btn bg-primary py-4 text-center text-lg font-extrabold text-white">
          오늘의 공유 카드
        </div>

        {shareCardQuery.isPending ? (
          <p className="py-20 text-sm text-white">불러오는 중…</p>
        ) : !canShowCard ? (
          <p className="py-20 text-sm text-white">공유 카드를 불러오지 못했습니다.</p>
        ) : (
          <article
            ref={cardRef}
            className="relative h-[400px] w-full overflow-hidden rounded-[28px] shadow-xl"
          >
            <img
              src={bgSrc}
              alt={placeName}
              crossOrigin="anonymous"
              className="absolute inset-0 size-full object-cover"
              onError={() => {
                if (remoteUrl) setFailedUrl(remoteUrl);
              }}
            />

            {SOLID_SHAPES.map((shape) => (
              <div
                key={`${shape.left}-${shape.bottom}`}
                className="pointer-events-none absolute z-20"
                style={{ left: shape.left, bottom: shape.bottom }}
              >
                <SolidShape fill={fill} element={element} />
              </div>
            ))}

            <PanelWithHoles fill={fill} message={shareMessage} element={element} />
          </article>
        )}

        <div className="mt-5 flex items-center gap-4">
          <ActionButton
            label="다운로드"
            onClick={() => {
              void handleDownload();
            }}
            disabled={!canShowCard || isDownloading}
          >
            <Download size={20} aria-hidden />
          </ActionButton>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full bg-gray-4 text-gray-1"
          >
            <X size={24} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
