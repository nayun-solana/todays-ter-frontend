import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';
import type { MyPlaceItem, MyPlaceListType } from '../types/record/myPlace';
import type { VisitedReviewDetail } from '../types/review/visitedReview';

/** 저장한 터 / 다녀온 터 목록 조회 */
export async function getMyPlaces(type: MyPlaceListType): Promise<MyPlaceItem[]> {
  const response = await axiosInstance.get<ApiResponse<MyPlaceItem[]>>('/my-places', {
    params: { type },
  });

  return getResult(response);
}

/** 다녀온 터 후기 상세 조회 */
export async function getVisitedReviewDetail(
  visitId: number | string,
): Promise<VisitedReviewDetail> {
  const response = await axiosInstance.get<ApiResponse<VisitedReviewDetail>>(
    `/my-places/visited/${visitId}`,
  );

  return getResult(response);
}
