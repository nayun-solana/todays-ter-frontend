import { PlaceDetailResponse } from '../types/place/place';
import { PlaceShareCard } from '../types/place/shareCard';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getPlaceDetail(placeId: string): Promise<PlaceDetailResponse> {
  const response = await axiosInstance.get<ApiResponse>(`/places/${placeId}`);
  return PlaceDetailResponse.parse(getResult(response));
}

/** 스토리 공유 카드용 장소명·오행·대표 이미지 — GET /places/{placeId}/share-cards */
export async function getPlaceShareCard(placeId: number | string) {
  const response = await axiosInstance.get<ApiResponse>(`/places/${placeId}/share-cards`);
  return PlaceShareCard.parse(getResult(response));
}
