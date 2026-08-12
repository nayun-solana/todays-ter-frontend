import { describe, expect, it } from 'vitest';

import {
  OHAENG_LIST,
  OHAENG_ORDER,
  ohaengByCode,
  ohaengByKey,
  ohaengByLabel,
  toOhaengKey,
} from './ohaeng';

describe('OHAENG_LIST', () => {
  it('오행 5종을 빠짐없이 담는다', () => {
    expect(OHAENG_LIST).toHaveLength(5);
    expect(OHAENG_LIST.map((o) => o.key).sort()).toEqual([
      'earth',
      'fire',
      'metal',
      'water',
      'wood',
    ]);
  });

  it('key와 code는 대소문자만 다르다 — toOhaengKey가 이 규칙에 기댄다', () => {
    OHAENG_LIST.forEach((o) => {
      expect(o.code).toBe(o.key.toUpperCase());
      expect(toOhaengKey(o.code)).toBe(o.key);
    });
  });

  it('클래스명은 조립하지 않고 완성된 문자열로 둔다(Tailwind가 정적 클래스만 빌드한다)', () => {
    OHAENG_LIST.forEach((o) => {
      expect(o.text).toBe(`text-ohaeng-${o.key}`);
      expect(o.bg).toBe(`bg-ohaeng-${o.key}`);
      expect(o.border).toBe(`border-ohaeng-${o.key}`);
      expect(o.bgSoft).toBe(`bg-ohaeng-${o.key}/20`);
    });
  });

  it('OHAENG_ORDER는 목화토금수 5종을 모두 포함한다', () => {
    expect(OHAENG_ORDER).toEqual(['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']);
    expect([...OHAENG_ORDER].sort()).toEqual([...OHAENG_LIST.map((o) => o.code)].sort());
  });
});

describe('조회 함수', () => {
  it('key·code·label 어느 쪽으로 찾아도 같은 항목이 나온다', () => {
    const byKey = ohaengByKey('water');
    expect(byKey).toBeDefined();
    expect(ohaengByCode('WATER')).toBe(byKey);
    expect(ohaengByLabel('수')).toBe(byKey);
  });

  it('못 찾으면 undefined — 폴백은 호출부가 정한다', () => {
    expect(ohaengByKey('WATER')).toBeUndefined(); // key는 소문자다
    expect(ohaengByCode('water')).toBeUndefined(); // code는 대문자다
    expect(ohaengByLabel('없는오행')).toBeUndefined();
    expect(ohaengByKey(null)).toBeUndefined();
    expect(ohaengByCode(undefined)).toBeUndefined();
  });
});
