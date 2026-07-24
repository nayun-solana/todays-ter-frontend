import { TodayEnergyResponse } from '../types/home/homeEnergy';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

// 홈 API. ⚠️ BE 미배포 → dev는 MSW mock으로 응답(src/mocks/handlers.ts). 응답은 zod 검증.

/** GET /home/today-energy — 오늘 나의 기운(오행) */
export async function getTodayEnergy(): Promise<TodayEnergyResponse> {
  const res = await axiosInstance.get<ApiResponse>('/home/today-energy');
  return TodayEnergyResponse.parse(getResult(res));
}
