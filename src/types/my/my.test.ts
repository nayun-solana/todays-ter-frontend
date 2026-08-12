import { describe, expect, it } from 'vitest';

import { MemberInfoResponse } from './my';

describe('MemberInfoResponse', () => {
  it('parses the member profile', () => {
    expect(
      MemberInfoResponse.parse({
        memberId: 7,
        email: 'someone@example.com',
        nickname: '사용자닉네임',
        status: 'ACTIVE',
      }),
    ).toEqual({
      memberId: 7,
      email: 'someone@example.com',
      nickname: '사용자닉네임',
      status: 'ACTIVE',
    });
  });

  it('rejects a profile without a nickname', () => {
    expect(() =>
      MemberInfoResponse.parse({ memberId: 7, email: 'someone@example.com', status: 'ACTIVE' }),
    ).toThrow();
  });
});
