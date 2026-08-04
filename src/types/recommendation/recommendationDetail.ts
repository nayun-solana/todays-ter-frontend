import { z } from 'zod';

/**
 * 추천 장소 상세(나와 어울리는 터) API 계약.
 * BE 실응답으로 검증함(2026-08-04, GET /recommendations/places/1).
 *
 * ⚠️ 사주 리포트가 없는 사용자는 200이지만 맞춤 필드가 전부 비어서 온다
 *    (matchingScore·whyItMatches·actionSuggestion = null, matchingPoints = []).
 *    화면에서 값 없음을 반드시 처리할 것.
 */
export const RecommendationDetail = z.object({
  placeId: z.number().int(),
  placeName: z.string(),
  imageUrl: z.string().nullish(),
  /** ⚠️ 코드가 아니라 한글 표시명("토"). lib/ohaeng의 ohaengByLabel로 매핑한다. */
  primaryElement: z.string().nullish(),
  topCategories: z.array(z.string()).default([]),
  matchingScore: z.number().nullish(),
  matchingPoints: z.array(z.string()).default([]),
  whyItMatches: z.string().nullish(),
  actionSuggestion: z.string().nullish(),
  mapUrl: z.string().nullish(),
  isSaved: z.boolean().nullish(),
});
export type RecommendationDetail = z.infer<typeof RecommendationDetail>;

/**
 * POST /recommendations/places/{placeId}/share 응답.
 * shareUrl은 BE 환경변수로 조립되는데 지금은 API 경로가 그대로 들어가 있어
 * FE에 존재하지 않는 주소(`/recommendations/places/shared/{token}`)가 내려온다.
 * 그래서 실제로 공유하는 링크는 shareToken으로 FE가 직접 만든다(shareLinkFrom).
 */
export const ShareLink = z.object({
  shareToken: z.string().min(1),
  shareUrl: z.string().nullish(),
});
export type ShareLink = z.infer<typeof ShareLink>;

/** 공유 링크가 도착할 FE 경로. BE에도 이 값으로 맞춰달라고 요청해둔 상태. */
export const SHARED_RECOMMENDATION_PATH = '/matched-ter/shared';

/** 공유 토큰 → 현재 도메인 기준 절대 URL. BE가 준 shareUrl에 의존하지 않는다. */
export function shareLinkFrom(shareToken: string): string {
  return `${window.location.origin}${SHARED_RECOMMENDATION_PATH}/${shareToken}`;
}
