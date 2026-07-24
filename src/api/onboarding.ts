import {
  GuestConcernResponse,
  GuestOnboardingResponse,
  GuestSajuResponse,
  GuestSessionResponse,
  type GuestConcernRequest,
  type GuestSajuRequest,
} from '../types/onboarding/guestOnboarding';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

// 비회원 온보딩 API. 신원은 guest_id 쿠키(axios withCredentials + dev Vite 프록시). 응답은 zod로 검증.

/** POST /api/guest-sessions — 비회원 세션 생성/조회 (쿠키 발급) */
export async function initGuestSession(): Promise<GuestSessionResponse> {
  const res = await axiosInstance.post<ApiResponse>('/api/guest-sessions');
  return GuestSessionResponse.parse(getResult(res));
}

/** PUT /api/guest-onboarding/saju — 사주 정보 저장·수정 (온보딩1) */
export async function saveGuestSaju(body: GuestSajuRequest): Promise<GuestSajuResponse> {
  const res = await axiosInstance.put<ApiResponse>('/api/guest-onboarding/saju', body);
  return GuestSajuResponse.parse(getResult(res));
}

/** PUT /api/guest-onboarding/concerns — 고민 유형 저장·수정 (온보딩3) */
export async function saveGuestConcerns(
  body: GuestConcernRequest,
): Promise<GuestConcernResponse> {
  const res = await axiosInstance.put<ApiResponse>('/api/guest-onboarding/concerns', body);
  return GuestConcernResponse.parse(getResult(res));
}

/** GET /api/guest-onboarding — 비회원 온보딩 조회 */
export async function getGuestOnboarding(): Promise<GuestOnboardingResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/guest-onboarding');
  return GuestOnboardingResponse.parse(getResult(res));
}
