import { useQuery } from '@tanstack/react-query';

import {
  getEnergyRoutines,
  getHomeHeader,
  getRecommendedPlaces,
  getTodayEnergy,
} from '../../api/home';

export const homeKeys = {
  todayEnergy: ['home', 'today-energy'] as const,
  header: ['home', 'header'] as const,
  routines: ['home', 'energy-routines'] as const,
  recommended: ['home', 'recommended-place'] as const,
};

/** 오늘 나의 기운(오행) */
export function useTodayEnergy() {
  return useQuery({ queryKey: homeKeys.todayEnergy, queryFn: getTodayEnergy });
}

/** 인사 헤더 */
export function useHomeHeader() {
  return useQuery({ queryKey: homeKeys.header, queryFn: getHomeHeader });
}

/** 오늘 에너지 루틴 */
export function useEnergyRoutines() {
  return useQuery({ queryKey: homeKeys.routines, queryFn: getEnergyRoutines });
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
  });
}
