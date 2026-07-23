import axiosInstance from '../../../api/axiosInstance';
import { getResult } from '../../../api/helpers';
import type { ApiResponse } from '../../../api/types';

import type { MyPlaceItem, MyPlaceListType } from './types';

/** 저장한 터 / 다녀온 터 목록 조회 */
export async function getMyPlaces(type: MyPlaceListType): Promise<MyPlaceItem[]> {
  const response = await axiosInstance.get<ApiResponse<MyPlaceItem[]>>('/my-places', {
    params: { type },
  });

  return getResult(response);
}
