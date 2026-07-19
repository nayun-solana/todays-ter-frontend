import { useEffect, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import progressCenterImage from '../../../assets/onboarding/progress-center.svg';

interface AnalysisProgressProps {
  currentStep: number;
}

interface CircularProgressProps {
  /**
   * 현재 진행률입니다.
   * 0보다 작으면 0, 100보다 크면 100으로 처리됩니다.
   */
  value: number;

  /**
   * 애니메이션 시간입니다.
   * Motion의 duration 단위는 초입니다.
   */
  duration?: number;

  /**
   * 가운데에 표시할 디자인 SVG입니다.
   */
  centerImageSrc: string;

  /**
   * 최상위 컨테이너에 추가할 Tailwind 클래스입니다.
   */
  className?: string;
}

/**
 * Figma SVG 기준 규격
 *
 * 전체 크기: 160 × 160
 * 바깥 반지름: 80px
 * 안쪽 반지름: 64px
 * 링 두께: 16px
 * 링 중심 반지름: 72px
 */
const PROGRESS_SIZE = 160;
const PROGRESS_CENTER = PROGRESS_SIZE / 2;
const PROGRESS_RADIUS = 72;
const PROGRESS_STROKE_WIDTH = 16;

/**
 * 원의 중심선을 기준으로 한 전체 둘레입니다.
 */
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

/**
 * 0%일 때도 약 5px 길이의 흰색 조각이 보이도록 설정합니다.
 *
 * Motion의 pathLength는 0~1 범위를 사용하기 때문에
 * 5px을 전체 둘레에 대한 비율로 변환합니다.
 */
const MINIMUM_PATH_LENGTH = 5 / PROGRESS_CIRCUMFERENCE;

const CircularProgress = ({
  value,
  duration = 0.8,
  centerImageSrc,
  className = '',
}: CircularProgressProps) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  /**
   * 진행 링과 숫자가 함께 사용하는 애니메이션 값입니다.
   */
  const animatedProgress = useMotionValue(0);

  /**
   * 진행률을 SVG pathLength 값으로 변환합니다.
   *
   * 0%에서도 최소 5px 길이는 유지됩니다.
   */
  const pathLength = useTransform(animatedProgress, (latestValue) => {
    const calculatedPathLength = latestValue / 100;

    return Math.max(MINIMUM_PATH_LENGTH, calculatedPathLength);
  });

  /**
   * 0%일 때는 끝부분이 평평한 butt 형태가 보입니다.
   *
   * 진행률이 0%에서 5%로 올라가는 동안
   * butt 형태가 자연스럽게 사라집니다.
   */
  const buttOpacity = useTransform(animatedProgress, [0, 5], [1, 0], {
    clamp: true,
  });

  /**
   * 진행률이 올라가기 시작하면 round 형태가 나타납니다.
   *
   * 진행률이 0%에서 5%로 올라가는 동안
   * round 형태가 자연스럽게 나타납니다.
   */
  const roundOpacity = useTransform(animatedProgress, [0, 5], [0, 1], {
    clamp: true,
  });

  const [displayValue, setDisplayValue] = useState(0);

  /**
   * 사용자가 기기 설정에서 움직임 줄이기를 활성화했는지 확인합니다.
   */
  const shouldReduceMotion = useReducedMotion();

  /**
   * Motion Value가 변경될 때 가운데 숫자도 함께 변경합니다.
   */
  useMotionValueEvent(animatedProgress, 'change', (latestValue) => {
    setDisplayValue(Math.round(latestValue));
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      animatedProgress.set(normalizedValue);
      setDisplayValue(Math.round(normalizedValue));

      return;
    }

    /**
     * 현재 진행률에서 새로 전달된 진행률까지 자연스럽게 움직입니다.
     *
     * 예:
     * 0 → 20
     * 20 → 40
     * 40 → 60
     */
    const animationControls = animate(animatedProgress, normalizedValue, {
      type: 'tween',
      duration,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      animationControls.stop();
    };
  }, [animatedProgress, duration, normalizedValue, shouldReduceMotion]);

  return (
    <div
      className={`relative h-40 w-40 shrink-0 ${className}`}
      role="progressbar"
      aria-label="진행률"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={displayValue}
      aria-valuetext={`${displayValue}%`}
    >
      {/*
        가운데 디자인 원 SVG입니다.

        160 × 160 크기로 전체 영역을 사용합니다.
      */}
      <img
        src={centerImageSrc}
        alt=""
        draggable={false}
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          h-full
          w-full
          select-none
          object-contain
        "
      />

      {/*
        가운데 디자인 원 위에
        기본 링과 진행 링을 겹칩니다.
      */}
      <svg
        width={PROGRESS_SIZE}
        height={PROGRESS_SIZE}
        viewBox={`0 0 ${PROGRESS_SIZE} ${PROGRESS_SIZE}`}
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          -rotate-90
          overflow-visible
        "
      >
        {/*
          흰색 10% 투명도의 기본 링입니다.

          진행되지 않은 전체 영역을 표시합니다.
        */}
        <circle
          cx={PROGRESS_CENTER}
          cy={PROGRESS_CENTER}
          r={PROGRESS_RADIUS}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.1}
          strokeWidth={PROGRESS_STROKE_WIDTH}
        />

        {/*
          0%일 때 표시되는 평평한 진행 조각입니다.

          진행률이 0%에서 5%로 올라가는 동안
          점점 투명해집니다.
        */}
        <motion.circle
          cx={PROGRESS_CENTER}
          cy={PROGRESS_CENTER}
          r={PROGRESS_RADIUS}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={PROGRESS_STROKE_WIDTH}
          strokeLinecap="butt"
          style={{
            pathLength,
            opacity: buttOpacity,
          }}
        />

        {/*
          진행률이 올라가면서 나타나는 둥근 진행 링입니다.

          butt 링과 같은 위치와 길이를 사용하고
          투명도만 반대로 변경합니다.
        */}
        <motion.circle
          cx={PROGRESS_CENTER}
          cy={PROGRESS_CENTER}
          r={PROGRESS_RADIUS}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={PROGRESS_STROKE_WIDTH}
          strokeLinecap="round"
          style={{
            pathLength,
            opacity: roundOpacity,
          }}
        />
      </svg>

      {/*
        퍼센트 숫자입니다.
      */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-20
          flex
          items-center
          justify-center
        "
      >
        <span
          className="
            text-[24px]
            font-semibold
            text-white
          "
        >
          {displayValue}%
        </span>
      </div>
    </div>
  );
};

export default function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
  /**
   * currentStep을 20% 단위로 변환합니다.
   *
   * 0 → 0%
   * 1 → 20%
   * 2 → 40%
   * 3 → 60%
   * 4 → 80%
   * 5 → 100%
   */
  const progress = Math.min(Math.max(currentStep * 20, 0), 100);

  return <CircularProgress value={progress} duration={0.8} centerImageSrc={progressCenterImage} />;
}
