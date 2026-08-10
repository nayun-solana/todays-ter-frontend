import { z } from 'zod';

import { ElementCode, ElementRef } from './homeEnergy';

/**
 * 홈 인사 헤더 / 에너지 루틴 / 추천 터 API 계약.
 * BE 실응답·Swagger로 검증함(2026-08-06). 그 전까지는 화면만 보고 만든 추측 스키마였다.
 */

export const UserType = z.enum(['MEMBER', 'GUEST']);
export type UserType = z.infer<typeof UserType>;

export const DayOfWeek = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;

/** GET /home/header — 인사 헤더 */
export const HomeHeaderResponse = z.object({
  userType: UserType,
  date: z.string(), // yyyy-MM-dd
  dayOfWeek: DayOfWeek,
  /** 게스트는 닉네임이 없다. */
  nickname: z.string().nullish(),
  greeting: z.string(), // "안녕하세요 윤진님 !"
  subGreeting: z.string(), // "오늘도 좋은 기운 충전해요"
});
export type HomeHeaderResponse = z.infer<typeof HomeHeaderResponse>;

/** 루틴 한 줄. `type`은 분류용 문자열이고 화면에 쓰는 건 `text`다. */
export const EnergyRoutineItem = z.object({
  order: z.number().int(),
  type: z.string(),
  text: z.string(),
});
export type EnergyRoutineItem = z.infer<typeof EnergyRoutineItem>;

/** GET /home/energy-routines — 오늘 에너지 루틴 */
export const EnergyRoutinesResponse = z.object({
  element: ElementRef,
  routines: z.array(EnergyRoutineItem).default([]),
});
export type EnergyRoutinesResponse = z.infer<typeof EnergyRoutinesResponse>;

/** 홈 추천 카드 항목 */
export const HomeRecommendedPlace = z.object({
  placeId: z.number().int(),
  rankOrder: z.number().int(),
  placeName: z.string(),
  thumbnailUrl: z.string().nullish(),
  placeElement: ElementCode.nullish(),
  matchPercentage: z.number().nullish(),
  recommendationReason: z.string().nullish(),
  distanceKm: z.number().nullish(),
  averageRating: z.number().nullish(),
});
export type HomeRecommendedPlace = z.infer<typeof HomeRecommendedPlace>;

/** 게스트에게 보여줄 로그인 유도 문구. 회원 응답에는 없다. */
export const HomeLoginPrompt = z.object({
  title: z.string(),
  buttonText: z.string(),
});
export type HomeLoginPrompt = z.infer<typeof HomeLoginPrompt>;

/**
 * GET /home/recommended-place — 오늘 가장 잘 맞는 터.
 *
 * 게스트는 `isLimited: true`로 오고 `visibleCount`장까지만 보여주면 된다.
 * 몇 장을 가릴지는 FE가 정하지 않는다 — 서버가 내려주는 값을 따른다.
 */
export const RecommendedPlacesResponse = z.object({
  userType: UserType,
  isLimited: z.boolean(),
  visibleCount: z.number().int(),
  totalCount: z.number().int(),
  recommendations: z.array(HomeRecommendedPlace).default([]),
  loginPrompt: HomeLoginPrompt.nullish(),
});
export type RecommendedPlacesResponse = z.infer<typeof RecommendedPlacesResponse>;
