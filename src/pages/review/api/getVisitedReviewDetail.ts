import axiosInstance from '../../../api/axiosInstance';
import { getResult } from '../../../api/helpers';
import type { ApiResponse } from '../../../api/types';

import type { VisitedReviewDetail } from './types';

/** 다녀온 터 후기 상세 조회 */
export async function getVisitedReviewDetail(
  visitId: number | string,
): Promise<VisitedReviewDetail> {
  const response = await axiosInstance.get<ApiResponse<VisitedReviewDetail>>(
    `/my-places/visited/${visitId}`,
  );

  return getResult(response);
}
