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

export function useInfinitePlaces(params: InfinitePlaceListParams) {
  return useInfiniteQuery({
    queryKey: searchKeys.places(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getPlaces({ ...params, page: pageParam, size: 10 }),
    getNextPageParam: getNextPlacePage,
  });
}

export function useEditorPicks(limit = 3) {
  return useQuery({
    queryKey: searchKeys.editorPicks(limit),
    queryFn: () => getEditorPicks(limit),
  });
}
