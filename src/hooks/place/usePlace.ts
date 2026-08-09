import { useQuery } from '@tanstack/react-query';

import { getPlaceDetail, getPlaceReviews } from '../../api/place';

export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
  reviews: (placeId: string) => [...placeKeys.all, 'reviews', placeId] as const,
};

export function usePlaceDetail(placeId?: string) {
  return useQuery({
    queryKey: placeKeys.detail(placeId ?? ''),
    queryFn: () => getPlaceDetail(placeId!),
    enabled: Boolean(placeId),
  });
}

export function usePlaceReviews(placeId?: string) {
  return useQuery({
    queryKey: placeKeys.reviews(placeId ?? ''),
    queryFn: () => getPlaceReviews(placeId!),
    enabled: Boolean(placeId),
  });
}
