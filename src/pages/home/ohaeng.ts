import { OHAENG_LIST, type OhaengKey } from '../../lib/ohaeng';

export type { OhaengKey };

/** 홈 화면이 오행별로 스위칭하는 테마. 지금은 배경 그라데이션·라벨만 오행별, 카피는 공통. */
export interface OhaengHomeTheme {
  key: OhaengKey;
  /** 기운 글자 (수/토/화/목/금) */
  label: string;
  /** 오행별 상단 배경 그라데이션 (CSS background 값) */
  bgGradient: string;
  /** 기운 설명 (개행 포함) */
  energyDesc: string;
  /** 루틴 섹션 제목 */
  routineTitle: string;
  routines: string[];
}

/** 오행별 대표색 (index.css --color-ohaeng-* 확정값과 동일). */
const OHAENG_COLOR: Record<OhaengKey, string> = {
  water: '#5599ff',
  wood: '#a0dd00',
  fire: '#ff8b8d',
  earth: '#ff9853',
  metal: '#515151',
};

/**
 * 오행별 기운 설명·루틴은 아직 확정 카피가 없어 5종 공통 placeholder를 쓴다(현 시안도 5종 동일).
 * 오행별 카피가 나오면 아래 값을 오행별로 분리하면 됨.
 */
const PLACEHOLDER_COPY = {
  energyDesc: '안정과 균형의 기운. 중심을 잡고\n주변 사람들과의 관계가 조화롭게 이어집니다.',
  routineTitle: '토기 에너지 루틴',
  routines: ['10분 명상하기', '계획 정리하기', '맨발로 땅 밟기'],
};

function copy() {
  return { ...PLACEHOLDER_COPY, routines: [...PLACEHOLDER_COPY.routines] };
}

function buildTheme(key: OhaengKey, label: string): OhaengHomeTheme {
  return {
    key,
    label,
    bgGradient: `linear-gradient(180deg, ${OHAENG_COLOR[key]} 0%, #ffffff 72%)`,
    ...copy(),
  };
}

/** 오행 5종 홈 테마. HomePage가 오행 키로 이 중 하나를 렌더한다. */
export const OHAENG_HOME: Record<OhaengKey, OhaengHomeTheme> = OHAENG_LIST.reduce(
  (acc, { key, label }) => {
    acc[key] = buildTheme(key, label);
    return acc;
  },
  {} as Record<OhaengKey, OhaengHomeTheme>,
);
