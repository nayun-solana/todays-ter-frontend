import { describe, expect, it } from 'vitest';

import { isOnboardingRequired } from './onboardingRequired';

/**
 * 온보딩 미완료 404를 장애와 갈라내는 판정.
 * 실측(2026-08-06) 응답 그대로를 픽스처로 쓴다 — 여기가 틀리면 사용자는
 * 영영 404인 화면에서 "다시 시도"만 누르게 된다.
 */
describe('isOnboardingRequired', () => {
  it('리포트 없음(FORTUNE404_1)을 온보딩 필요로 본다', () => {
    expect(
      isOnboardingRequired({
        status: 404,
        code: 'FORTUNE404_1',
        message: '리포트를 찾을 수 없습니다.',
      }),
    ).toBe(true);
  });

  it('추천 조회 불가(HOME404_2)를 온보딩 필요로 본다', () => {
    expect(
      isOnboardingRequired({
        status: 404,
        code: 'HOME404_2',
        message: '조회 가능한 사주 리포트가 없습니다.',
      }),
    ).toBe(true);
  });

  it('서버 오류(500)는 온보딩 문제가 아니다', () => {
    // /home/recommended-place가 실제로 뱉고 있는 응답. 이건 유도가 아니라 실패로 보여줘야 한다.
    expect(
      isOnboardingRequired({
        status: 500,
        code: 'COMMON500',
        message: '서버 내부 오류가 발생했습니다.',
      }),
    ).toBe(false);
  });

  it('다른 404는 온보딩 문제가 아니다', () => {
    expect(isOnboardingRequired({ status: 404, code: 'COMMON404', message: '없음' })).toBe(false);
  });

  it('상태 코드가 404가 아니면 코드가 같아도 아니다', () => {
    expect(isOnboardingRequired({ status: 400, code: 'FORTUNE404_1', message: '' })).toBe(false);
  });

  it('에러가 아닌 값에도 안전하다', () => {
    expect(isOnboardingRequired(null)).toBe(false);
    expect(isOnboardingRequired(undefined)).toBe(false);
    expect(isOnboardingRequired(new Error('boom'))).toBe(false);
  });
});
