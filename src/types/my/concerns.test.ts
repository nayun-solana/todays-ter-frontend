import { describe, expect, it } from 'vitest';

import { MemberConcernsResponse, MemberConcernsUpdateRequest } from './my';

describe('회원 고민 유형 계약', () => {
  it('BE ConcernType 6종을 그대로 받는다', () => {
    const all = ['LOVE', 'CAREER', 'WEALTH', 'RELATIONSHIP', 'HEALTH', 'OTHER'];

    expect(MemberConcernsResponse.parse({ concernTypes: all }).concernTypes).toEqual(all);
  });

  it('조회 응답은 빈 배열도 허용한다 — 아직 고민을 고르지 않은 회원이 있다', () => {
    expect(MemberConcernsResponse.parse({ concernTypes: [] }).concernTypes).toEqual([]);
  });

  it('수정 요청은 빈 배열을 막는다 — BE가 @NotEmpty라 보내면 400이다', () => {
    expect(() => MemberConcernsUpdateRequest.parse({ concernTypes: [] })).toThrow();
    expect(MemberConcernsUpdateRequest.parse({ concernTypes: ['LOVE'] }).concernTypes).toEqual([
      'LOVE',
    ]);
  });

  it('계약에 없는 값은 거른다', () => {
    expect(() => MemberConcernsResponse.parse({ concernTypes: ['MONEY'] })).toThrow();
  });
});
