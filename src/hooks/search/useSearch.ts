import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getEditorPicks, getExploreFilters, getPlaces } from '../../api/search';
import type { PlaceListParams, PlaceListResponse } from '../../types/search/search';

type InfinitePlaceListParams = Omit<PlaceListParams, 'page' | 'size'>;

export const searchKeys = {
  all: ['search'] as const,
  filters: () => [...searchKeys.all, 'filters'] as const,
  places: (params: InfinitePlaceListParams) => [...searchKeys.all, 'places', params] as const,
  editorPicks: (limit: number) => [...searchKeys.all, 'editor-picks', limit] as const,
};

export function useExploreFilters() {
  return useQuery({
    queryKey: searchKeys.filters(),
    queryFn: getExploreFilters,
  });
}

export function getNextPlacePage(lastPage: PlaceListResponse) {
  return lastPage.page.hasNext ? lastPage.page.number + 1 : undefined;
}

/**
 * 장소 목록(무한 스크롤).
 *
 * `enabled`는 좌표처럼 "곧 정해지지만 아직 안 정해진" 값이 params에 들어갈 때 쓴다 —
 * 좌표가 queryKey의 일부라, 미확정 상태로 부르면 좌표 없는 목록을 한 번 받고
 * 좌표가 들어온 뒤 같은 목록을 다시 받는다.
 */
export function useInfinitePlaces(params: InfinitePlaceListParams, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: searchKeys.places(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getPlaces({ ...params, page: pageParam, size: 10 }),
    getNextPageParam: getNextPlacePage,
    enabled: options?.enabled ?? true,
  });
}

export function useEditorPicks(limit = 3) {
  return useQuery({
    queryKey: searchKeys.editorPicks(limit),
    queryFn: () => getEditorPicks(limit),
  });
}
