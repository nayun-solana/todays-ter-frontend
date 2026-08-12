import { z } from 'zod';

/**
 * 홈 "나의 기운" API 계약. BE 실응답·Swagger로 검증함(2026-08-06).
 */

/** BE 오행 코드 (report.ts ElementCode와 동일 컨벤션). FE OhaengKey는 소문자. */
export const ElementCode = z.enum(['WATER', 'WOOD', 'FIRE', 'EARTH', 'METAL']);
export type ElementCode = z.infer<typeof ElementCode>;

/**
 * BE가 오행을 내려주는 공통 모양. 표시명(`name`)이 아니라 `code`로 매핑할 것 —
 * 한글은 BE가 문구를 다듬으면 같이 깨진다(#98에서 실제로 화면이 빈 적 있다).
 */
export const ElementRef = z.object({
  code: ElementCode,
  name: z.string(), // "수" · "토" …
});
export type ElementRef = z.infer<typeof ElementRef>;

/** GET /home/today-energy */
export const TodayEnergyResponse = z.object({
  date: z.string(), // yyyy-MM-dd
  element: ElementRef,
  description: z.string(),
});
export type TodayEnergyResponse = z.infer<typeof TodayEnergyResponse>;
