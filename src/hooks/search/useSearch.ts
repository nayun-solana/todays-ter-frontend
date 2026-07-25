import { useQuery } from '@tanstack/react-query';

import { getEditorPicks, getExploreFilters, getPlaces } from '../../api/search';
import type { PlaceListParams } from '../../types/search/search';

export const searchKeys = {
  all: ['search'] as const,
  filters: () => [...searchKeys.all, 'filters'] as const,
  places: (params: PlaceListParams) => [...searchKeys.all, 'places', params] as const,
  editorPicks: (limit: number) => [...searchKeys.all, 'editor-picks', limit] as const,
};

export function useExploreFilters() {
  return useQuery({
    queryKey: searchKeys.filters(),
    queryFn: getExploreFilters,
  });
}

export function usePlaces(params: PlaceListParams) {
  return useQuery({
    queryKey: searchKeys.places(params),
    queryFn: () => getPlaces(params),
  });
}

export function useEditorPicks(limit = 3) {
  return useQuery({
    queryKey: searchKeys.editorPicks(limit),
    queryFn: () => getEditorPicks(limit),
  });
}
