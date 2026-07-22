/**
 * 오행 메타 정보. Tailwind는 소스에 적힌 정적 클래스만 빌드에 포함하므로
 * 클래스명은 반드시 완성된 문자열로 둔다.
 */
export const OHAENG_LIST = [
  { key: 'fire', label: '화', text: 'text-ohaeng-fire', bg: 'bg-ohaeng-fire', border: 'border-ohaeng-fire' },
  { key: 'earth', label: '토', text: 'text-ohaeng-earth', bg: 'bg-ohaeng-earth', border: 'border-ohaeng-earth' },
  { key: 'wood', label: '목', text: 'text-ohaeng-wood', bg: 'bg-ohaeng-wood', border: 'border-ohaeng-wood' },
  { key: 'water', label: '수', text: 'text-ohaeng-water', bg: 'bg-ohaeng-water', border: 'border-ohaeng-water' },
  { key: 'metal', label: '금', text: 'text-ohaeng-metal', bg: 'bg-ohaeng-metal', border: 'border-ohaeng-metal' },
] as const;

export type OhaengMeta = (typeof OHAENG_LIST)[number];
export type OhaengKey = OhaengMeta['key'];

export function ohaengByKey(key: string | null | undefined): OhaengMeta | undefined {
  return OHAENG_LIST.find((o) => o.key === key);
}

export function ohaengByLabel(label: OhaengMeta['label']): OhaengMeta | undefined {
  return OHAENG_LIST.find((o) => o.label === label);
}
