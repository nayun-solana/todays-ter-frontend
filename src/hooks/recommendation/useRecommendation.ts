import { useQuery } from '@tanstack/react-query';

import {
  createRecommendationShare,
  getRecommendationDetail,
  getSharedRecommendation,
} from '../../api/recommendation';
import { shareLinkFrom } from '../../types/recommendation/recommendationDetail';

export const recommendationKeys = {
  detail: (placeId: string) => ['recommendation', placeId] as const,
  shared: (shareToken: string) => ['recommendation', 'shared', shareToken] as const,
  share: (placeId: string) => ['recommendation', placeId, 'share'] as const,
};

/** 추천 장소 상세 조회 */
export function useRecommendationDetail(placeId: string | undefined) {
  return useQuery({
    queryKey: recommendationKeys.detail(placeId ?? ''),
    queryFn: () => getRecommendationDetail(placeId!),
    enabled: !!placeId,
  });
}

/** 공유 링크로 들어온 추천 조회 (인증 불필요) */
export function useSharedRecommendation(shareToken: string | undefined) {
  return useQuery({
    queryKey: recommendationKeys.shared(shareToken ?? ''),
    queryFn: () => getSharedRecommendation(shareToken!),
    enabled: !!shareToken,
    retry: false, // 잘못된 토큰은 404 확정 — 재시도할 이유가 없다
  });
}

/**
 * 공유 링크 **선발급**.
 *
 * navigator.share는 사용자 제스처 직후(transient activation)에만 호출할 수 있어서
 * 클릭 → 네트워크 대기 → share() 순서로 가면 iOS Safari에서 NotAllowedError가 난다.
 * 그래서 화면 진입 시점에 토큰을 미리 받아두고, 클릭 때는 대기 없이 바로 공유한다.
 * 서버 발급은 멱등이라(같은 스냅샷이면 같은 토큰) 미리 불러도 안전하다.
 *
 * 사주 리포트가 없으면 서버가 PLACE409_1로 거절한다 → isError로 공유 버튼을 잠근다.
 */
export function useShareLink(placeId: string | undefined, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: recommendationKeys.share(placeId ?? ''),
    queryFn: () => createRecommendationShare(placeId!),
    enabled: !!placeId && (options?.enabled ?? true),
    retry: false,
    staleTime: Infinity, // 같은 화면에 머무는 동안 재발급할 이유가 없다
  });

  return {
    ...query,
    /** 공유할 절대 URL. BE가 준 shareUrl은 FE에 없는 경로라 토큰으로 직접 만든다. */
    shareUrl: query.data ? shareLinkFrom(query.data.shareToken) : null,
  };
}
