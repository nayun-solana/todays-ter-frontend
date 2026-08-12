import { OHAENG_LIST, ohaengCssVar, type OhaengKey } from '../../lib/ohaeng';

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

// 오행 라벨은 한자로 통일(수/목/화/토/금) — OHAENG_LIST.label 그대로 사용.
// Figma 홈 시안이 earth/fire만 순우리말(흙/불)로 혼용했으나 디자이너 확인 결과 한자 통일로 정리됨.

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

/**
 * 홈 상단 배경 — Figma는 mesh 그라데이션 이미지지만(일러스트 아님 원칙),
 * 오행색만 파라미터로 받는 CSS 레이어드 그라데이션으로 근사한다.
 * 1) 좌상단 밝은 광원 glow  2) 중앙하단 크림 웜톤 bloom  3) 오행색→흰색 세로 흐름.
 */
function buildBgGradient(color: string): string {
  return [
    'radial-gradient(58% 48% at 14% 4%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 62%)',
    'radial-gradient(82% 58% at 68% 98%, rgba(255,249,232,0.7) 0%, rgba(255,249,232,0) 58%)',
    `linear-gradient(178deg, ${color} 0%, #ffffff 70%)`,
  ].join(', ');
}

/** 오행 5종 홈 테마. HomePage가 오행 키로 이 중 하나를 렌더한다. */
export const OHAENG_HOME: Record<OhaengKey, OhaengHomeTheme> = OHAENG_LIST.reduce(
  (acc, { key, label }) => {
    // hex를 복사해두지 않고 CSS 변수를 그대로 참조한다 — 토큰(index.css)이 단일 소스다.
    acc[key] = { key, label, bgGradient: buildBgGradient(ohaengCssVar(key)), ...copy() };
    return acc;
  },
  {} as Record<OhaengKey, OhaengHomeTheme>,
);
