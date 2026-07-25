import { PlaceDetailResponse } from '../types/place/place';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getPlaceDetail(placeId: string): Promise<PlaceDetailResponse> {
  const response = await axiosInstance.get<ApiResponse>(`/places/${placeId}`);
  return PlaceDetailResponse.parse(getResult(response));
}
