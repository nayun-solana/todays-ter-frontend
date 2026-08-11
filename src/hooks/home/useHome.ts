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
  /** 홈 4개를 한 번에 무효화할 때 쓰는 프리픽스. 리포트를 만들면 홈이 통째로 달라진다. */
  all: ['home'] as const,
  todayEnergy: ['home', 'today-energy'] as const,
  header: ['home', 'header'] as const,
  routines: ['home', 'energy-routines'] as const,
  /**
   * 좌표가 키에 들어간다 — 좌표에 따라 distanceKm이 달라지므로 같은 캐시로 묶으면 안 된다.
   * 좌표 없이 부르는 곳(SessionGate 뒤의 추천 접근 가드)은 별도 캐시를 쓰게 되는데,
   * 그쪽은 거리를 안 보고 visibleCount만 읽으므로 요청 한 번 더 나가는 비용만 진다.
   */
  recommended: (coords?: { latitude: number; longitude: number }) =>
    ['home', 'recommended-place', coords ?? null] as const,
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
export function useRecommendedPlaces(options?: {
  enabled?: boolean;
  coords?: { latitude: number; longitude: number } | null;
}) {
  const coords = options?.coords ?? undefined;

  return useQuery({
    queryKey: homeKeys.recommended(coords),
    queryFn: () => getRecommendedPlaces(coords),
    enabled: options?.enabled ?? true,
    retry: retryUnlessOnboardingRequired,
  });
}
