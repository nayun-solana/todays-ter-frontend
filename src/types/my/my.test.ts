import { describe, expect, it } from 'vitest';

import { MyPageResponse } from './my';

describe('MyPageResponse', () => {
  it('parses the profile and current report id', () => {
    expect(
      MyPageResponse.parse({
        reportId: 83721,
        nickname: '사용자닉네임',
        profileImageUrl: 'https://example.com/profile.png',
      }),
    ).toEqual({
      reportId: 83721,
      nickname: '사용자닉네임',
      profileImageUrl: 'https://example.com/profile.png',
    });
  });
});
