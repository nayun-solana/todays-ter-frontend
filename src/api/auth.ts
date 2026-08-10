import { DevTokenResponse, KakaoLoginResponse } from '../types/auth/auth';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export { reissueToken } from './reissue';

/** POST /auth/kakao/login — 카카오 인가코드로 로그인 (게스트 쿠키 있으면 서버가 연계) */
export async function kakaoLogin(authorizationCode: string): Promise<KakaoLoginResponse> {
  const res = await axiosInstance.post<ApiResponse>('/auth/kakao/login', { authorizationCode });
  return KakaoLoginResponse.parse(getResult(res));
}

/** POST /auth/logout — 서버의 refresh 토큰 폐기 + 쿠키 삭제 (Bearer 필요) */
export async function logout(): Promise<void> {
  await axiosInstance.post<ApiResponse>('/auth/logout');
}

/**
 * POST /auth/dev/token — 소셜 로그인 없이 회원 토큰 발급.
 * 카카오 키 발급 전(#72)까지 회원 상태를 테스트하기 위한 개발용 경로.
 */
export async function issueDevToken(params: {
  email: string;
  nickname: string;
}): Promise<DevTokenResponse> {
  const res = await axiosInstance.post<ApiResponse>('/auth/dev/token', params);
  return DevTokenResponse.parse(getResult(res));
}
