import { RecommendationDetail } from '../types/recommendation/recommendationDetail';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

// 추천 API. ⚠️ BE 미배포 → dev는 MSW mock. 응답은 zod 검증.

/** GET /recommendations/{recommendationId} — 추천 장소 상세(나와 어울리는 터) */
export async function getRecommendationDetail(id: string): Promise<RecommendationDetail> {
  const res = await axiosInstance.get<ApiResponse>(`/recommendations/${id}`);
  return RecommendationDetail.parse(getResult(res));
}
