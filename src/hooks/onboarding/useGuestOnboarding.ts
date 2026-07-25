import { useMutation, useQuery } from '@tanstack/react-query';

import {
  getGuestOnboarding,
  initGuestSession,
  saveGuestConcerns,
  saveGuestSaju,
} from '../../api/onboarding';

export const onboardingKeys = {
  guest: ['guest-onboarding'] as const,
};

/** 비회원 세션 초기화 (진입 시 1회, 쿠키 발급) */
export function useInitGuestSession() {
  return useMutation({ mutationFn: initGuestSession });
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
