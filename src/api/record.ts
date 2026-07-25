import { MyPlaceListResponse, type MyPlaceListType } from '../types/record/myPlace';
import { VisitedReviewDetail } from '../types/review/visitedReview';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** 저장한 터 / 다녀온 터 목록 조회 */
export async function getMyPlaces(type: MyPlaceListType) {
  const response = await axiosInstance.get<ApiResponse>('/my-places', {
    params: { type },
  });

  return MyPlaceListResponse.parse(getResult(response));
}

/** 다녀온 터 후기 상세 조회 */
export async function getVisitedReviewDetail(visitId: number | string) {
  const response = await axiosInstance.get<ApiResponse>(`/my-places/visited/${visitId}`);
  return VisitedReviewDetail.parse(getResult(response));
}
