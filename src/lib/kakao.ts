/**
 * 카카오 OAuth 인가 요청 URL.
 *
 * 흐름: 로그인 화면 → 카카오 인가 화면 → `/oauth/kakao/callback?code=...`
 *      → `POST /auth/kakao/login`(BE가 코드를 토큰으로 교환) → accessToken.
 */

/**
 * 카카오 앱 "오늘의 터"(ID 1523837)의 REST API 키.
 *
 * authorize URL 쿼리에 그대로 실려 나가는 **공개 식별자**라 번들에 있어도 문제되지 않는다.
 * (진짜 비밀값인 client secret은 BE만 갖는다 — FE에 두면 안 된다.)
 * 환경변수로 빼지 않은 이유: Vercel 프로젝트가 팀원 계정이라 대시보드에 값을 넣어줄 사람이 필요해진다.
 */
const KAKAO_REST_API_KEY = '042f481afdddc6b9c67b4e67fb43e363';

/** 카카오 콘솔에 등록된 콜백 경로. 등록값과 한 글자라도 다르면 카카오가 인가를 거절한다. */
export const KAKAO_CALLBACK_PATH = '/oauth/kakao/callback';

/**
 * 현재 오리진 기준 redirect_uri.
 *
 * 콘솔에 등록된 오리진은 `http://localhost:5173`과 `https://todays-ter-frontend.vercel.app` 두 곳이라,
 * **프리뷰 배포(`todays-ter-frontend-git-*.vercel.app`)에서는 동작하지 않는다** — 오리진이 매번 달라
 * 등록이 불가능하다. 프리뷰에서 카카오 로그인을 확인하려면 그 오리진을 콘솔에 임시 등록해야 한다.
 */
export function getKakaoRedirectUri(origin: string = window.location.origin): string {
  return `${origin}${KAKAO_CALLBACK_PATH}`;
}

/**
 * 카카오 인가 화면 URL. 이 주소로 이동시키면 사용자가 동의 후 콜백 경로로 되돌아온다.
 * `origin`은 테스트에서 주입하기 위한 것 — 실제 호출부는 인자 없이 쓴다.
 */
export function buildKakaoAuthorizeUrl(origin?: string): string {
  const params = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: getKakaoRedirectUri(origin),
    response_type: 'code',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}
