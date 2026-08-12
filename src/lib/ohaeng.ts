import orbEarth from '../assets/orb-earth.png';
import orbFire from '../assets/orb-fire.png';
import orbMetal from '../assets/orb-metal.png';
import orbWater from '../assets/orb-water.png';
import orbWood from '../assets/orb-wood.png';

/**
 * 오행 단일 소스.
 *
 * 예전에는 같은 매핑이 7군데(홈 테마·배지·구슬·온보딩 아이콘·리포트 상세·탐색 필터)에
 * 흩어져 있었고, 표현도 세 가지(`'water'` / `'WATER'` / `'수'`)가 섞여 서로 다른 곳에서
 * 각자 변환했다. 색상값은 index.css에서 복사돼 있어 토큰을 바꿔도 따라가지 않았다.
 * 오행을 다루는 모든 코드는 이 파일만 본다.
 *
 * ⚠️ 클래스명은 반드시 완성된 문자열로 둘 것 — Tailwind는 소스에 적힌 정적 클래스만
 *    빌드에 포함하므로 `text-ohaeng-${key}` 식으로 조립하면 스타일이 사라진다.
 * ⚠️ 색상값(hex)은 여기에 두지 않는다 — index.css의 `--color-ohaeng-*`가 단일 소스이고,
 *    클래스를 못 쓰는 자리에서는 `ohaengCssVar()`로 그 변수를 참조한다.
 */
export const OHAENG_LIST = [
  {
    key: 'fire',
    code: 'FIRE',
    label: '화',
    hanja: '火',
    orb: orbFire,
    text: 'text-ohaeng-fire',
    bg: 'bg-ohaeng-fire',
    bgSoft: 'bg-ohaeng-fire/20',
    border: 'border-ohaeng-fire',
  },
  {
    key: 'earth',
    code: 'EARTH',
    label: '토',
    hanja: '土',
    orb: orbEarth,
    text: 'text-ohaeng-earth',
    bg: 'bg-ohaeng-earth',
    bgSoft: 'bg-ohaeng-earth/20',
    border: 'border-ohaeng-earth',
  },
  {
    key: 'wood',
    code: 'WOOD',
    label: '목',
    hanja: '木',
    orb: orbWood,
    text: 'text-ohaeng-wood',
    bg: 'bg-ohaeng-wood',
    bgSoft: 'bg-ohaeng-wood/20',
    border: 'border-ohaeng-wood',
  },
  {
    key: 'water',
    code: 'WATER',
    label: '수',
    hanja: '水',
    orb: orbWater,
    text: 'text-ohaeng-water',
    bg: 'bg-ohaeng-water',
    bgSoft: 'bg-ohaeng-water/20',
    border: 'border-ohaeng-water',
  },
  {
    key: 'metal',
    code: 'METAL',
    label: '금',
    hanja: '金',
    orb: orbMetal,
    text: 'text-ohaeng-metal',
    bg: 'bg-ohaeng-metal',
    bgSoft: 'bg-ohaeng-metal/20',
    border: 'border-ohaeng-metal',
  },
] as const;

export type OhaengMeta = (typeof OHAENG_LIST)[number];
/** FE 표기 — 소문자. 화면 상태·에셋 키에 쓴다. */
export type OhaengKey = OhaengMeta['key'];
/** BE 표기 — 대문자. API 계약(ElementCode)과 같다. */
export type OhaengCode = OhaengMeta['code'];
/** 한글 표시명. BE가 코드 대신 이 값을 주는 API가 아직 있다. */
export type OhaengLabel = OhaengMeta['label'];

/**
 * 오행을 못 정했을 때의 기본값(수).
 *
 * 검증되지 않은 값(라우터 state 등)으로 조회한 결과가 없을 때 쓴다 — 조회 실패를 그대로
 * 흘려보내면 호출부가 `!`로 단정하게 되고, 값 하나 때문에 화면이 통째로 죽는다.
 */
export const DEFAULT_OHAENG: OhaengMeta = OHAENG_LIST.find((o) => o.key === 'water')!;

/** 오행 상생 순서(목→화→토→금→수). 차트 축처럼 순서가 고정돼야 하는 곳에서 쓴다. */
export const OHAENG_ORDER: readonly OhaengCode[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];

/** key로 조회. 못 찾으면 undefined — 호출부가 폴백을 정한다. */
export function ohaengByKey(key: string | null | undefined): OhaengMeta | undefined {
  return OHAENG_LIST.find((o) => o.key === key);
}

/** BE 오행 코드로 조회. 표시명이 아니라 이 경로를 쓸 것 — 한글은 BE가 문구를 다듬으면 깨진다. */
export function ohaengByCode(code: string | null | undefined): OhaengMeta | undefined {
  return OHAENG_LIST.find((o) => o.code === code);
}

/**
 * 오행 한글 표시명 → 메타. BE가 오행을 코드가 아니라 표시명("토")으로 주는 API가 있어
 * 임의 문자열도 받는다(못 찾으면 undefined).
 */
export function ohaengByLabel(label: string | null | undefined): OhaengMeta | undefined {
  return OHAENG_LIST.find((o) => o.label === label);
}

/** BE 오행 코드 → FE OhaengKey (소문자). */
export function toOhaengKey(code: OhaengCode): OhaengKey {
  return code.toLowerCase() as OhaengKey;
}

/**
 * CSS 변수 참조 문자열. Tailwind 클래스를 못 쓰는 자리(SVG fill, inline style)에서 쓴다.
 * 클래스명과 달리 런타임 문자열이라 조립해도 안전하다 — 빌드가 훑어야 할 대상이 아니다.
 */
export function ohaengCssVar(key: OhaengKey): string {
  return `var(--color-ohaeng-${key})`;
}
