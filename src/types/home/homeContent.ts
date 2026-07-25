import { z } from 'zod';

/**
 * 홈 인사 헤더 / 에너지 루틴 / 추천 터 API 계약.
 * ⚠️ BE 미배포 → 추측 스키마(화면·명세서 경로 기준). BE 배포 시 교체. (docs/api-spec.md, docs/mocking.md)
 */

/** GET /home/header — 인사 헤더 */
export const HomeHeaderResponse = z.object({
  dateLabel: z.string(), // "2026년 6월 11일 목요일"
  userName: z.string(), // "윤진"
  message: z.string(), // "오늘도 좋은 기운 충전해요"
});
export type HomeHeaderResponse = z.infer<typeof HomeHeaderResponse>;

/** GET /home/energy-routines — 오늘 에너지 루틴 */
export const EnergyRoutinesResponse = z.object({
  title: z.string(), // "토기 에너지 루틴"
  routines: z.array(z.string()),
});
export type EnergyRoutinesResponse = z.infer<typeof EnergyRoutinesResponse>;

/** 홈 추천 카드 항목 (이미지 URL은 BE 확정 전이라 optional) */
export const RecommendedPlace = z.object({
  recommendationId: z.string(),
  badge: z.string(),
  name: z.string(),
  subtitle: z.string(),
  description: z.string(),
  distanceLabel: z.string(), // "3.5km"
  rating: z.number(),
  imageUrl: z.string().nullish(),
});
export type RecommendedPlace = z.infer<typeof RecommendedPlace>;

/** GET /home/recommended-place — 오늘 가장 잘 맞는 터 */
export const RecommendedPlacesResponse = z.object({
  places: z.array(RecommendedPlace),
});
export type RecommendedPlacesResponse = z.infer<typeof RecommendedPlacesResponse>;
