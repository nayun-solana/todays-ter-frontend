import {
  MemberInfoResponse,
  PoliciesResponse,
  SocialConnectionsResponse,
  MemberConcernsResponse,
  MemberSajuResponse,
  MemberWithdrawRequest,
  MemberSajuUpdateRequest,
  MemberConcernsUpdateRequest,
} from '../types/my/my';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiError, ApiResponse } from './types';

/** GET /members/me — 회원 기본 정보(닉네임 등). */
export async function getMemberInfo(): Promise<MemberInfoResponse> {
  const response = await axiosInstance.get<ApiResponse>('/members/me');
  return MemberInfoResponse.parse(getResult(response));
}

export async function getSocialConnections(): Promise<SocialConnectionsResponse> {
  const response = await axiosInstance.get<ApiResponse>('/members/me/social-accounts');
  return SocialConnectionsResponse.parse(getResult(response));
}

export async function getMemberSaju(): Promise<MemberSajuResponse> {
  const response = await axiosInstance.get<ApiResponse>('/members/me/saju');
  return MemberSajuResponse.parse(getResult(response));
}

export async function updateMemberSaju(body: MemberSajuUpdateRequest): Promise<MemberSajuResponse> {
  const response = await axiosInstance.put<ApiResponse>('/members/me/saju', body);
  return MemberSajuResponse.parse(getResult(response));
}

export async function withdrawMember(body: MemberWithdrawRequest): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/members/me', { data: body });
}

/**
 * GET /members/me/concerns — 회원 고민 유형 조회.
 *
 * 회원에게 연결된 `Onboarding` 행이 없으면 404 `MEMBER404_3`이 온다. 게스트로 온보딩한 뒤
 * 로그인한 경우에는 이관돼서 행이 있지만, **로그인 후에 온보딩한 회원은 행이 없다**
 * (온보딩 화면이 회원일 때 저장을 건너뛴다 — 이슈 #156 1번).
 */
export async function getMemberConcerns(): Promise<MemberConcernsResponse> {
  const response = await axiosInstance.get<ApiResponse>('/members/me/concerns');
  return MemberConcernsResponse.parse(getResult(response));
}

/**
 * PUT /members/me/concerns — 회원 고민 유형 수정. 404 조건은 위 조회와 같다.
 *
 * 요청도 parse한다 — 타입만 걸어두면 `min(1)`이 런타임에는 아무 일도 하지 않아서,
 * 빈 배열이 그대로 나가 BE의 `@NotEmpty` 400(`COMMON400_1`)으로 돌아온다. 그건 호출부에서
 * 일반 실패 문구로 뭉개지므로, 계약 위반은 나가기 전에 여기서 드러내는 편이 낫다.
 */
export async function updateMemberConcerns(
  body: MemberConcernsUpdateRequest,
): Promise<MemberConcernsResponse> {
  const payload = MemberConcernsUpdateRequest.parse(body);
  const response = await axiosInstance.put<ApiResponse>('/members/me/concerns', payload);
  return MemberConcernsResponse.parse(getResult(response));
}

/**
 * "이 회원에게 연결된 온보딩 정보가 없다"는 BE 신호.
 *
 * 재시도해봐야 계속 404다 — 안내 문구를 갈라야 하므로 호출부가 이 코드로 판정한다.
 * 인터셉터가 거절값을 평범한 객체(ApiError)로 정규화하므로 shape로 본다.
 */
export const MEMBER_ONBOARDING_NOT_FOUND_CODE = 'MEMBER404_3';

export function isMemberOnboardingMissing(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { status, code } = error as Partial<ApiError>;
  return status === 404 && code === MEMBER_ONBOARDING_NOT_FOUND_CODE;
}

export async function getPolicies(): Promise<PoliciesResponse> {
  const response = await axiosInstance.get<ApiResponse>('/mypage/policies');
  return PoliciesResponse.parse(getResult(response));
}
