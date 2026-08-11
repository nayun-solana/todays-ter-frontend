import { useQuery } from '@tanstack/react-query';

import { getPlaceDetail, getPlaceReviews, getPlaceShareCard } from '../../api/place';

export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
  reviews: (placeId: string) => [...placeKeys.all, 'reviews', placeId] as const,
  shareCard: (placeId: string) => [...placeKeys.all, 'share-card', placeId] as const,
};

export function usePlaceDetail(placeId?: string | number) {
  const id = placeId != null ? String(placeId) : '';

  return useQuery({
    queryKey: placeKeys.detail(id),
    queryFn: () => getPlaceDetail(id),
    enabled: Boolean(id),
  });
}

export function usePlaceReviews(placeId?: string | number) {
  const id = placeId != null ? String(placeId) : '';

  return useQuery({
    queryKey: placeKeys.reviews(id),
    queryFn: () => getPlaceReviews(id),
    enabled: Boolean(id),
  });
}

/** 스토리 공유 카드 — GET /places/{placeId}/share-cards */
export function usePlaceShareCard(placeId?: number | string, enabled = true) {
  const id = placeId != null ? String(placeId) : '';

  return useQuery({
    queryKey: placeKeys.shareCard(id),
    queryFn: () => getPlaceShareCard(id),
    enabled: Boolean(id) && enabled,
  });
}
