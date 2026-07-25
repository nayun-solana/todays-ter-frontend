import { useQuery } from '@tanstack/react-query';

import { getPlaceDetail } from '../../api/place';

export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
};

export function usePlaceDetail(placeId?: string) {
  return useQuery({
    queryKey: placeKeys.detail(placeId ?? ''),
    queryFn: () => getPlaceDetail(placeId!),
    enabled: Boolean(placeId),
  });
}
