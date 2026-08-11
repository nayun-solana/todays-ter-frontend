import {
  EnergyRoutinesResponse,
  HomeHeaderResponse,
  RecommendedPlacesResponse,
} from '../types/home/homeContent';
import { TodayEnergyResponse } from '../types/home/homeEnergy';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

// 홈 API. 응답은 zod 검증.

/** GET /home/today-energy — 오늘 나의 기운(오행) */
export async function getTodayEnergy(): Promise<TodayEnergyResponse> {
  const res = await axiosInstance.get<ApiResponse>('/home/today-energy');
  return TodayEnergyResponse.parse(getResult(res));
}

/** GET /home/header — 인사 헤더 */
export async function getHomeHeader(): Promise<HomeHeaderResponse> {
  const res = await axiosInstance.get<ApiResponse>('/home/header');
  return HomeHeaderResponse.parse(getResult(res));
}

/** GET /home/energy-routines — 오늘 에너지 루틴 */
export async function getEnergyRoutines(): Promise<EnergyRoutinesResponse> {
  const res = await axiosInstance.get<ApiResponse>('/home/energy-routines');
  return EnergyRoutinesResponse.parse(getResult(res));
}

/**
 * GET /home/recommended-place — 오늘 가장 잘 맞는 터.
 * 좌표를 함께 보내야 서버가 `distanceKm`을 채운다(안 보내면 항상 null, 실측).
 * 추천 목록 자체는 좌표와 무관하다 — 거리 표시만 달라진다.
 */
export async function getRecommendedPlaces(
  coords?: { latitude: number; longitude: number },
): Promise<RecommendedPlacesResponse> {
  const res = await axiosInstance.get<ApiResponse>('/home/recommended-place', {
    params: coords,
  });
  return RecommendedPlacesResponse.parse(getResult(res));
}
