import axios from 'axios';

import { TokenResponse } from '../types/auth/auth';
import type { ApiResponse } from './types';

/**
 * 토큰 재발급 전용 axios 인스턴스.
 * 공용 axiosInstance를 쓰면 재발급 요청이 401일 때 다시 재발급을 부르는 순환에 빠지므로
 * 인터셉터가 없는 별도 인스턴스를 쓴다. Authorization 헤더도 붙이지 않는다(쿠키만 사용).
 */
const reissueClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  // refresh 토큰 쿠키(HttpOnly) 전송용
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * POST /auth/reissue — 쿠키의 refresh 토큰으로 accessToken 재발급.
 * BE는 Origin 헤더를 화이트리스트와 대조하므로(AuthOriginValidator) dev에서는 Vite 프록시 경유가 전제다.
 */
export async function reissueToken(): Promise<TokenResponse> {
  const res = await reissueClient.post<ApiResponse<unknown>>('/auth/reissue');
  return TokenResponse.parse(res.data.result);
}
