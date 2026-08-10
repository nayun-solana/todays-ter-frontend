import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  createRecommendationShare,
  getRecommendationDetail,
  getSharedRecommendation,
  updateRecommendationBookmark,
} from '../../api/recommendation';
import {
  shareLinkFrom,
  type RecommendationDetail,
} from '../../types/recommendation/recommendationDetail';

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
 * 추천 장소 저장/해제.
 *
 * 서버 왕복을 기다리면 탭에 반응이 없어 두 번 누르게 된다 → 캐시를 먼저 뒤집고
 * 실패하면 되돌린다. 성공 시엔 서버가 확정한 `isSaved`로 다시 맞춘다
 * (연타로 요청이 엇갈려도 마지막 응답이 진실이 되도록).
 *
 * 게스트는 서버가 401로 막는다 — 호출부에서 미리 걸러 로그인으로 보낼 것.
 */
export function useBookmarkToggle(placeId: string | undefined) {
  const queryClient = useQueryClient();
  const key = recommendationKeys.detail(placeId ?? '');

  return useMutation({
    mutationFn: (isSaved: boolean) => updateRecommendationBookmark(placeId!, isSaved),
    onMutate: async (isSaved) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RecommendationDetail>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, isSaved });
      return { previous };
    },
    onError: (_error, _isSaved, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (result) => {
      const current = queryClient.getQueryData<RecommendationDetail>(key);
      if (current) queryClient.setQueryData(key, { ...current, isSaved: result.isSaved });
    },
    // 연타로 요청이 겹치면 나중 요청의 onMutate가 앞 요청의 낙관적 값을 "이전 값"으로
    // 스냅샷한다 → 앞 요청이 실패하면 뒤 요청이 확정한 상태를 덮어써 서버와 어긋난다.
    // 마지막 요청이 끝난 뒤 한 번 무효화해 서버 값으로 되맞춘다.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

/**
 * 공유 링크 발급.
 *
 * navigator.share는 사용자 제스처 직후(transient activation)에만 호출할 수 있어서
 * 클릭 → 네트워크 대기 → share() 순서로 가면 iOS Safari에서 NotAllowedError가 난다.
 * 그렇다고 화면 진입마다 발급하면 공유할 생각이 없는 사용자까지 서버에 토큰을 만들게 된다.
 *
 * 그래서 **공유 의사가 보일 때**(버튼에 포인터가 닿거나 포커스가 갈 때) 미리 받아두고,
 * 그 사이에 클릭이 먼저 오면 `ensureShareUrl()`로 받아온다. 서버 발급은 멱등이라
 * (같은 스냅샷이면 같은 토큰) 여러 번 불려도 안전하다.
 *
 * 사주 리포트가 없으면 서버가 PLACE409_1로 거절한다 → isError로 공유 버튼을 잠근다.
 */
export function useShareLink(placeId: string | undefined, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const [intent, setIntent] = useState(false);
  const enabled = !!placeId && (options?.enabled ?? true);

  const queryOptions = {
    queryKey: recommendationKeys.share(placeId ?? ''),
    queryFn: () => createRecommendationShare(placeId!),
    retry: false,
    staleTime: Infinity, // 같은 화면에 머무는 동안 재발급할 이유가 없다
  };

  const query = useQuery({ ...queryOptions, enabled: enabled && intent });

  return {
    ...query,
    /** 공유 버튼에 포인터·포커스가 닿는 시점에 호출 — 클릭 전에 토큰을 준비한다. */
    prefetchShareLink: () => setIntent(true),
    /** 이미 받아둔 URL. 준비됐으면 클릭 핸들러가 await 없이 바로 공유할 수 있다. */
    shareUrl: query.data ? shareLinkFrom(query.data.shareToken) : null,
    /**
     * 아직 준비 전이면 여기서 받아온다(캐시에 있으면 즉시 반환).
     *
     * 실패는 throw하지 않고 null로 돌려준다. 예전에는 `fetchQuery`의 거절이 그대로 새어나가
     * 클릭 핸들러가 rejected promise가 됐고(호출부가 await만 하고 catch하지 않는다),
     * 사용자에게는 아무 일도 안 일어난 채 콘솔에만 unhandled rejection이 쌓였다.
     * 리포트가 없는 회원은 여기로 반드시 들어온다(서버가 PLACE409_1로 거절).
     */
    ensureShareUrl: async (): Promise<string | null> => {
      if (!enabled) return null;
      setIntent(true);
      try {
        const link = await queryClient.fetchQuery(queryOptions);
        return shareLinkFrom(link.shareToken);
      } catch {
        return null;
      }
    },
  };
}
