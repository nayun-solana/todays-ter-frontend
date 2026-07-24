import { useQuery } from '@tanstack/react-query';

import { getTodayEnergy } from '../../api/home';

export const homeKeys = {
  todayEnergy: ['home', 'today-energy'] as const,
};

/** 오늘 나의 기운(오행) 조회 */
export function useTodayEnergy() {
  return useQuery({ queryKey: homeKeys.todayEnergy, queryFn: getTodayEnergy });
}
