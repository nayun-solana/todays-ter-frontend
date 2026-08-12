import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getPlaceDetail,
  getPlaceReviews,
  getPlaceShareCard,
  updatePlaceBookmark,
} from '../../api/place';
import type { PlaceDetailResponse } from '../../types/place/place';
import { recordKeys } from '../record/useRecord';

import { placeKeys } from './placeKeys';

// 기존 import 경로를 유지한다 — 키는 순환 참조를 피하려고 별도 모듈에 있다.
export { placeKeys };

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

/** 장소 저장/해제 — 즉시 상태를 반영하고 실패하면 이전 상태로 되돌린다. */
export function usePlaceBookmarkToggle(placeId: string | undefined) {
  const queryClient = useQueryClient();
  const key = placeKeys.detail(placeId ?? '');

  return useMutation({
    mutationFn: (isSaved: boolean) => updatePlaceBookmark(placeId!, isSaved),
    onMutate: async (isSaved) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PlaceDetailResponse>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, isSaved });
      return { previous };
    },
    onError: (_error, _isSaved, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (result) => {
      const current = queryClient.getQueryData<PlaceDetailResponse>(key);
      if (current) queryClient.setQueryData(key, { ...current, isSaved: result.isSaved });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: recordKeys.myPlaces('saved') });
    },
  });
}
