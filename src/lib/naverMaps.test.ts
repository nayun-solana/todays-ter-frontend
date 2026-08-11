import { describe, expect, it } from 'vitest';

import { getNaverMapsScriptUrl } from './naverMaps';

describe('네이버 지도 SDK URL', () => {
  it('NCP Client ID를 ncpKeyId로 전달한다', () => {
    expect(getNaverMapsScriptUrl('client-id')).toBe(
      'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=client-id',
    );
  });
});
