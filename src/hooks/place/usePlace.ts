import { useQuery } from '@tanstack/react-query';

import { getPlaceDetail, getPlaceShareCard } from '../../api/place';

export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
  shareCard: (placeId: string) => [...placeKeys.all, 'share-card', placeId] as const,
};

export function usePlaceDetail(placeId?: string) {
  return useQuery({
    queryKey: placeKeys.detail(placeId ?? ''),
    queryFn: () => getPlaceDetail(placeId!),
    enabled: Boolean(placeId),
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
