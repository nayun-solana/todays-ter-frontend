import { describe, expect, it } from 'vitest';

import { withObjectParticle } from './korean';

describe('withObjectParticle', () => {
  it('받침이 있으면 "을"', () => {
    expect(withObjectParticle('알림')).toBe('알림을');
    expect(withObjectParticle('약관')).toBe('약관을');
    expect(withObjectParticle('목록')).toBe('목록을');
  });

  it('받침이 없으면 "를"', () => {
    expect(withObjectParticle('장소')).toBe('장소를');
    expect(withObjectParticle('후기')).toBe('후기를');
    expect(withObjectParticle('에디터 픽')).toBe('에디터 픽을');
  });

  it('한글이 아닌 끝 글자는 "를"로 둔다 — 판단 근거가 없다', () => {
    expect(withObjectParticle('API')).toBe('API를');
    expect(withObjectParticle('')).toBe('를');
  });
});
