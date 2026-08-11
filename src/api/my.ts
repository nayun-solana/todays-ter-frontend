import {
  MyPageResponse,
  PermissionSettingsResponse,
  PoliciesResponse,
  SocialConnectionsResponse,
  UpdatedAtResponse,
  MemberSajuResponse,
  MemberWithdrawRequest,
  MemberSajuUpdateRequest,
  type PermissionSettingsRequest,
} from '../types/my/my';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

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

export async function getPermissionSettings(): Promise<PermissionSettingsResponse> {
  const response = await axiosInstance.get<ApiResponse>('/mypage/permissions');
  return PermissionSettingsResponse.parse(getResult(response));
}

export async function updatePermissionSettings(
  body: PermissionSettingsRequest,
): Promise<UpdatedAtResponse> {
  const response = await axiosInstance.patch<ApiResponse>('/mypage/permissions', body);
  return UpdatedAtResponse.parse(getResult(response));
}

export async function getPolicies(): Promise<PoliciesResponse> {
  const response = await axiosInstance.get<ApiResponse>('/mypage/policies');
  return PoliciesResponse.parse(getResult(response));
}
