import { describe, expect, it } from 'vitest';

import { homeKeys } from '../home/useHome';
import { recommendationKeys } from '../recommendation/useRecommendation';

/**
 * `useUpdateMemberConcerns`가 무엇을 비우고 무엇을 남기는지 고정한다.
 * 훅 자체는 렌더링이 필요해 jsdom 도입 후 덮는다 — 여기서는 키 구조와 predicate 규칙만 본다.
 */
const isInvalidated = (queryKey: readonly unknown[]) => queryKey[2] !== 'share';

describe('고민 수정 후 무효화 범위', () => {
  it('홈 프리픽스가 홈 4개를 모두 덮는다', () => {
    const homeQueryKeys = [
      homeKeys.todayEnergy,
      homeKeys.header,
      homeKeys.routines,
      homeKeys.recommended({ latitude: 37.5, longitude: 127 }),
    ];

    homeQueryKeys.forEach((key) => expect(key[0]).toBe(homeKeys.all[0]));
  });

  it('추천 상세와 공유받은 추천은 비운다', () => {
    expect(isInvalidated(recommendationKeys.detail('12'))).toBe(true);
    expect(isInvalidated(recommendationKeys.shared('token-abc'))).toBe(true);
  });

  it('공유 토큰 발급 쿼리는 남긴다 — queryFn이 서버에 토큰을 만드는 POST다', () => {
    expect(isInvalidated(recommendationKeys.share('12'))).toBe(false);
  });

  it('공유 토큰 키는 3번째 자리가 share다 — predicate가 이 구조에 기댄다', () => {
    expect(recommendationKeys.share('12')[2]).toBe('share');
    // detail은 길이 2라 3번째 자리가 없다(그래서 predicate에 걸리지 않는다).
    expect(recommendationKeys.detail('12')).toHaveLength(2);
  });
});
