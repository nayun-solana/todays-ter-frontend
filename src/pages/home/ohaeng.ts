import waterBg from '../../assets/ohaeng/water-bg.png';
import waterOrb from '../../assets/ohaeng/water-orb.png';

/** 오행 5종. 홈/추천상세가 오행별 배경·오브·문구를 이 config로 스위칭한다. */
export type OhaengKey = 'water' | 'earth' | 'fire' | 'wood' | 'metal';

export interface OhaengHomeTheme {
  key: OhaengKey;
  /** 기운 글자 (수/토/화/목/금) */
  label: string;
  /** 오행별 배경 일러스트 */
  bg: string;
  /** 오행별 기운 오브 */
  orb: string;
  /** 기운 설명 (개행 포함) */
  energyDesc: string;
  /** 루틴 섹션 제목 */
  routineTitle: string;
  routines: string[];
}

/**
 * 물(水)만 실제 Figma 에셋/문구로 풀구현. 나머지 4오행은 에셋 확보 전까지
 * 물 에셋으로 스캐폴드(구조만) — 에셋 나오면 bg/orb/문구만 교체하면 됨.
 * NOTE: 물 시안 루틴 제목이 "토기 에너지 루틴"으로 되어 있음(디자인 카피 불일치로 추정) → 시안 그대로 반영.
 */
export const OHAENG_HOME: Record<OhaengKey, OhaengHomeTheme> = {
  water: {
    key: 'water',
    label: '수',
    bg: waterBg,
    orb: waterOrb,
    energyDesc: '안정과 균형의 기운. 중심을 잡고\n주변 사람들과의 관계가 조화롭게 이어집니다.',
    routineTitle: '토기 에너지 루틴',
    routines: ['10분 명상하기', '계획 정리하기', '맨발로 땅 밟기'],
  },
  // TODO(에셋 확보 후 교체): 현재 물 에셋으로 스캐폴드
  earth: {
    key: 'earth',
    label: '토',
    bg: waterBg,
    orb: waterOrb,
    energyDesc: '—',
    routineTitle: '에너지 루틴',
    routines: [],
  },
  fire: {
    key: 'fire',
    label: '화',
    bg: waterBg,
    orb: waterOrb,
    energyDesc: '—',
    routineTitle: '에너지 루틴',
    routines: [],
  },
  wood: {
    key: 'wood',
    label: '목',
    bg: waterBg,
    orb: waterOrb,
    energyDesc: '—',
    routineTitle: '에너지 루틴',
    routines: [],
  },
  metal: {
    key: 'metal',
    label: '금',
    bg: waterBg,
    orb: waterOrb,
    energyDesc: '—',
    routineTitle: '에너지 루틴',
    routines: [],
  },
};
