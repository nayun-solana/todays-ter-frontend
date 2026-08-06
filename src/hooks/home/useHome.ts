import { useQuery } from '@tanstack/react-query';

import {
  getEnergyRoutines,
  getHomeHeader,
  getRecommendedPlaces,
  getTodayEnergy,
} from '../../api/home';
import { isOnboardingRequired } from '../../api/onboardingRequired';

/**
 * 온보딩 미완료(404)는 재시도해봐야 결과가 안 바뀐다 — 헛된 왕복 없이 바로 유도 UI로 넘긴다.
 * 그 외에는 전역 기본값과 같은 1회 재시도.
 */
function retryUnlessOnboardingRequired(failureCount: number, error: unknown) {
  if (isOnboardingRequired(error)) return false;
  return failureCount < 1;
}

export const homeKeys = {
  todayEnergy: ['home', 'today-energy'] as const,
  header: ['home', 'header'] as const,
  routines: ['home', 'energy-routines'] as const,
  recommended: ['home', 'recommended-place'] as const,
};

/** 오늘 나의 기운(오행) */
export function useTodayEnergy() {
  return useQuery({
    queryKey: homeKeys.todayEnergy,
    queryFn: getTodayEnergy,
    retry: retryUnlessOnboardingRequired,
  });
}

/** 인사 헤더 */
export function useHomeHeader() {
  return useQuery({ queryKey: homeKeys.header, queryFn: getHomeHeader });
}

/** 오늘 에너지 루틴 */
export function useEnergyRoutines() {
  return useQuery({
    queryKey: homeKeys.routines,
    queryFn: getEnergyRoutines,
    retry: retryUnlessOnboardingRequired,
  });
}

/**
 * 오늘 가장 잘 맞는 터.
 * 라우트 가드에서도 같은 캐시를 재사용한다 — 홈을 거쳐 왔으면 즉시, 직접 진입이면 이때 조회된다.
 */
export function useRecommendedPlaces(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: homeKeys.recommended,
    queryFn: getRecommendedPlaces,
    enabled: options?.enabled ?? true,
    retry: retryUnlessOnboardingRequired,
  });
}
