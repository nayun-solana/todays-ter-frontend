import {
  EditorPicksResponse,
  ExploreFiltersResponse,
  PlaceListResponse,
  type PlaceListParams,
} from '../types/search/search';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getExploreFilters(): Promise<ExploreFiltersResponse> {
  const response = await axiosInstance.get<ApiResponse>('/places/explore-filters');
  return ExploreFiltersResponse.parse(getResult(response));
}

export async function getPlaces(params: PlaceListParams): Promise<PlaceListResponse> {
  const response = await axiosInstance.get<ApiResponse>('/places', { params });
  return PlaceListResponse.parse(getResult(response));
}

export async function getEditorPicks(limit = 3): Promise<EditorPicksResponse> {
  const response = await axiosInstance.get<ApiResponse>('/places/editor-picks', {
    params: { limit },
  });
  return EditorPicksResponse.parse(getResult(response));
}
