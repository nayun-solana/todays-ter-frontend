import { KakaoLoginResponse } from '../types/auth/auth';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** POST /auth/kakao/login — 카카오 인가코드로 로그인 (게스트 쿠키 있으면 서버가 연계) */
export async function kakaoLogin(authorizationCode: string): Promise<KakaoLoginResponse> {
  const res = await axiosInstance.post<ApiResponse>('/auth/kakao/login', { authorizationCode });
  return KakaoLoginResponse.parse(getResult(res));
}
