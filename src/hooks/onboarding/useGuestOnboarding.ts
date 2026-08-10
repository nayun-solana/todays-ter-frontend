import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getGuestOnboarding,
  initGuestSession,
  saveGuestConcerns,
  saveGuestSaju,
} from '../../api/onboarding';

export const onboardingKeys = {
  guest: ['guest-onboarding'] as const,
  /** SessionGate가 쓰는 세션 유무 캐시. 세션을 만들면 여기도 같이 갱신해야 한다. */
  sessionStatus: ['guest-session-status'] as const,
};

/**
 * 비회원 세션 초기화 (진입 시 1회, 쿠키 발급).
 *
 * 발급에 성공하면 SessionGate의 캐시를 바로 채운다. 그 캐시는 `staleTime: Infinity`라
 * 갱신하지 않으면 "세션 없음"이 그대로 남아, 방금 세션을 만든 사용자를 로그인으로 되돌린다
 * ("비회원으로 시작하기" → 온보딩 진입이 로그인으로 튕기는 루프).
 */
export function useInitGuestSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initGuestSession,
    onSuccess: () => {
      queryClient.setQueryData(onboardingKeys.sessionStatus, { hasGuestId: true });
    },
  });
}

/** 사주 저장 (온보딩1) */
export function useSaveGuestSaju() {
  return useMutation({ mutationFn: saveGuestSaju });
}

/** 고민 유형 저장 (온보딩3) */
export function useSaveGuestConcerns() {
  return useMutation({ mutationFn: saveGuestConcerns });
}

/** 비회원 온보딩 조회 */
export function useGuestOnboarding() {
  return useQuery({ queryKey: onboardingKeys.guest, queryFn: getGuestOnboarding });
}
