import { z } from 'zod';

/**
 * GET /records/{id} 응답 result.
 * path id = recordId(다녀온 터 기록) | reviewId(장소 후기)
 * 응답에도 type에 따라 recordId 또는 reviewId 중 하나가 온다.
 */
export const RecordDetail = z.object({
  recordId: z.number().int().positive().optional(),
  reviewId: z.number().int().positive().optional(),
  placeId: z.number().int().nonnegative(),
  placeName: z.string().min(1),
  /** 방문 인증 시각. 미인증이면 null */
  visitVerifiedAt: z.string().nullable(),
  rating: z.number().min(0).max(5),
  content: z.string(),
  imageUrls: z.array(z.string()),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type RecordDetail = z.infer<typeof RecordDetail>;

/** @deprecated RecordDetail 사용 */
export const VisitedReviewDetail = RecordDetail;
export type VisitedReviewDetail = RecordDetail;
