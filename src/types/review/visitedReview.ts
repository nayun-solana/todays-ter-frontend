import { z } from 'zod';

import { RecordImageItem } from '../record/createRecord';

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
  /** 상세 조회 — URL만 오는 경우 */
  imageUrls: z.array(z.string()).optional().default([]),
  /** 수정 시 imageId 유지용 — BE가 내려주면 사용 */
  images: z.array(RecordImageItem).optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type RecordDetail = z.infer<typeof RecordDetail>;

/** 상세 이미지 — id가 있으면 수정 PATCH에 재사용 */
export type RecordDetailImage = {
  key: string;
  imageUrl: string;
  imageId?: number;
};

export function recordDetailImagesOf(detail: RecordDetail): RecordDetailImage[] {
  if (detail.images && detail.images.length > 0) {
    return detail.images.map((image) => ({
      key: `id-${image.imageId}`,
      imageUrl: image.imageUrl,
      imageId: image.imageId,
    }));
  }

  return detail.imageUrls.map((imageUrl, index) => ({
    key: `url-${index}-${imageUrl}`,
    imageUrl,
  }));
}

/** @deprecated RecordDetail 사용 */
export const VisitedReviewDetail = RecordDetail;
export type VisitedReviewDetail = RecordDetail;
