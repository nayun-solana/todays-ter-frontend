import { MyPageResponse, SocialConnectionsResponse } from '../types/my/my';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getMyPage(): Promise<MyPageResponse> {
  const response = await axiosInstance.get<ApiResponse>('/mypage');
  return MyPageResponse.parse(getResult(response));
}

export async function getSocialConnections(): Promise<SocialConnectionsResponse> {
  const response = await axiosInstance.get<ApiResponse>('/mypage/social-connections');
  return SocialConnectionsResponse.parse(getResult(response));
}
