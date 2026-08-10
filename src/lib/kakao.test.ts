import { describe, expect, it } from 'vitest';

import { buildKakaoAuthorizeUrl, getKakaoRedirectUri, KAKAO_CALLBACK_PATH } from './kakao';
import { nextPathForOnboardingStep } from './onboardingRoute';

/**
 * 카카오 콘솔에 등록된 값. 여기와 콘솔이 어긋나면 카카오가 인가를 거절하는데,
 * BE가 카카오 오류를 전부 `AUTH401_1`("인가 코드가 유효하지 않거나 만료되었습니다")로 감싸서
 * 화면에서는 "코드 만료"와 구분이 안 된다. 그래서 값 자체를 테스트로 고정해둔다.
 */
const REGISTERED_ORIGINS = ['http://localhost:5173', 'https://todays-ter-frontend.vercel.app'];

describe('카카오 인가 URL', () => {
  it('콜백 경로가 콘솔 등록값과 같다', () => {
    expect(KAKAO_CALLBACK_PATH).toBe('/oauth/kakao/callback');
  });

  it('등록된 오리진마다 redirect_uri가 콘솔 등록값과 일치한다', () => {
    expect(REGISTERED_ORIGINS.map((origin) => getKakaoRedirectUri(origin))).toEqual([
      'http://localhost:5173/oauth/kakao/callback',
      'https://todays-ter-frontend.vercel.app/oauth/kakao/callback',
    ]);
  });

  it('인가 URL에 client_id·redirect_uri·response_type이 실린다', () => {
    const url = new URL(buildKakaoAuthorizeUrl('https://todays-ter-frontend.vercel.app'));

    expect(url.origin + url.pathname).toBe('https://kauth.kakao.com/oauth/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://todays-ter-frontend.vercel.app/oauth/kakao/callback',
    );
    // REST API 키는 공개 식별자지만, 값이 바뀌면 BE가 가진 앱과 어긋나므로 고정한다.
    expect(url.searchParams.get('client_id')).toBe('042f481afdddc6b9c67b4e67fb43e363');
  });
});

describe('로그인 후 이동할 화면', () => {
  it('온보딩 진행도에 따라 갈린다', () => {
    expect(nextPathForOnboardingStep('STARTED')).toBe('/onboarding/step-1');
    expect(nextPathForOnboardingStep('SAJU_COMPLETED')).toBe('/onboarding/step-2');
    expect(nextPathForOnboardingStep('REPORT_GENERATED')).toBe('/onboarding/step-3');
    expect(nextPathForOnboardingStep('COMPLETED')).toBe('/home');
  });

  it('모르는 값이면 홈으로 보낸다', () => {
    // BE가 단계를 추가해도 회원이 빈 화면에 갇히지 않아야 한다.
    expect(nextPathForOnboardingStep('SOMETHING_NEW')).toBe('/home');
    expect(nextPathForOnboardingStep('')).toBe('/home');
  });
});
