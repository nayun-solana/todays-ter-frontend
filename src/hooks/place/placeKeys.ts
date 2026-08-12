/**
 * 장소 쿼리 키.
 *
 * 훅 파일이 아니라 여기 두는 이유는 순환 참조 때문이다 — `usePlace`는 `recordKeys`를 쓰고,
 * `useRecord`는 후기를 쓰고 나서 장소 후기 목록을 비워야 해 `placeKeys`가 필요하다.
 * 키만 담은 이 모듈은 아무것도 import하지 않으므로 양쪽이 안전하게 가져갈 수 있다.
 */
export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
  reviews: (placeId: string) => [...placeKeys.all, 'reviews', placeId] as const,
  shareCard: (placeId: string) => [...placeKeys.all, 'share-card', placeId] as const,
};
