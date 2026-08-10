import { describe, expect, it } from 'vitest';

import { getPlaceThumbnailUrl } from './placeThumbnail';

describe('장소 대표 사진 URL', () => {
  it('장소 ID로 백엔드 썸네일 엔드포인트를 만든다', () => {
    expect(getPlaceThumbnailUrl(25)).toBe('/places/25/thumbnail');
  });
});
