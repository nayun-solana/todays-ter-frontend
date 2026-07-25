import { z } from 'zod';

import { ElementCode } from '../home/homeEnergy';

/**
 * 추천 장소 상세(나와 어울리는 터) API 계약.
 * ⚠️ BE 미배포 → 추측 스키마. BE 배포 시 교체. (docs/api-spec.md, docs/mocking.md)
 */

/** GET /recommendations/{recommendationId} */
export const RecommendationDetail = z.object({
  element: ElementCode, // 오행 (매칭 색상)
  placeName: z.string(),
  matchRate: z.number(), // 87 (%)
  hashtag: z.string(), // "감정 회복"
  reason: z.string(), // "왜 나에게 맞나요?" 설명 (개행 포함)
  points: z.array(z.string()), // 사주 매칭 포인트 칩
  suggestion: z.string(), // 오늘의 행동제안 (개행 포함)
});
export type RecommendationDetail = z.infer<typeof RecommendationDetail>;
