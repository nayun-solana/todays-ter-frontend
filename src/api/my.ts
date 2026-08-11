import {
  MyPageResponse,
  PoliciesResponse,
  SocialConnectionsResponse,
  MemberSajuResponse,
  MemberWithdrawRequest,
  MemberSajuUpdateRequest,
} from '../types/my/my';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 회원 프로필. `/mypage`가 아니라 `/members/me`를 쓴다 — BE에 mypage 도메인이 아직 없다
 * (유효한 회원 토큰으로도 401, 실측 2026-08-12). `/members/me`는 200이다.
 *
 * 대신 이 응답에는 `reportId`가 없다. BE가 리포트 조회 경로를 열어주면
 * (`GET /fortune-reports/me` 또는 `/members/me`에 필드 추가) 그때 필수로 바꾼다.
 */
export async function getMyPage(): Promise<MyPageResponse> {
  const response = await axiosInstance.get<ApiResponse>('/members/me');
  return MyPageResponse.parse(getResult(response));
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

export async function getPolicies(): Promise<PoliciesResponse> {
  const response = await axiosInstance.get<ApiResponse>('/mypage/policies');
  return PoliciesResponse.parse(getResult(response));
}
