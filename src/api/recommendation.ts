import { RecommendationDetail, ShareLink } from '../types/recommendation/recommendationDetail';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

// 추천 API. BE 배포 완료 — 실연동(2026-08-04 실호출 검증).

/** GET /recommendations/places/{placeId} — 추천 장소 상세(나와 어울리는 터) */
export async function getRecommendationDetail(placeId: string): Promise<RecommendationDetail> {
  const res = await axiosInstance.get<ApiResponse>(`/recommendations/places/${placeId}`);
  return RecommendationDetail.parse(getResult(res));
}

/**
 * POST /recommendations/places/{placeId}/share — 공유 링크 생성.
 * 이미 발급된 스냅샷이면 같은 토큰을 돌려준다(멱등).
 * 사주 리포트가 없으면 PLACE409_1로 실패한다 — 호출부에서 공유 버튼을 잠글 것.
 */
export async function createRecommendationShare(placeId: string): Promise<ShareLink> {
  const res = await axiosInstance.post<ApiResponse>(`/recommendations/places/${placeId}/share`);
  return ShareLink.parse(getResult(res));
}

/** GET /recommendations/places/shared/{shareToken} — 공유된 추천 조회(인증 불필요) */
export async function getSharedRecommendation(shareToken: string): Promise<RecommendationDetail> {
  const res = await axiosInstance.get<ApiResponse>(`/recommendations/places/shared/${shareToken}`);
  return RecommendationDetail.parse(getResult(res));
}
