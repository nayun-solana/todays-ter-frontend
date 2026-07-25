import { z } from 'zod';

/**
 * 홈 "오늘 나의 기운" API 계약.
 * ⚠️ BE 미배포(Swagger 없음) → 화면·명세서 경로 기준 추측 스키마. BE 배포 시 교체. (docs/api-spec.md)
 */

/** BE 오행 코드 (report.ts ElementCode와 동일 컨벤션). FE OhaengKey는 소문자. */
export const ElementCode = z.enum(['WATER', 'WOOD', 'FIRE', 'EARTH', 'METAL']);
export type ElementCode = z.infer<typeof ElementCode>;

/** GET /home/today-energy */
export const TodayEnergyResponse = z.object({
  element: ElementCode,
  label: z.string(), // 기운 글자 (수/목/화/토/금)
  description: z.string(),
});
export type TodayEnergyResponse = z.infer<typeof TodayEnergyResponse>;

/** BE 오행 코드 → FE OhaengKey (소문자). */
export function toOhaengKey(element: ElementCode): 'water' | 'wood' | 'fire' | 'earth' | 'metal' {
  return element.toLowerCase() as 'water' | 'wood' | 'fire' | 'earth' | 'metal';
}
