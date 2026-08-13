import { z } from 'zod';

export const ImageInfo = z.object({
  imageId: z.number().int().nonnegative(),
  imageUrl: z.string(),
});
export type ImageInfo = z.infer<typeof ImageInfo>;

export const RecordCreateRequest = z.object({
  placeId: z.number().int().positive(),
  type: z.enum(['RECORD', 'REVIEW']),
  rating: z.number().int().min(1).max(5),
  content: z.string(),
  imageIds: z.array(z.number().int().nonnegative()),
});
export type RecordCreateRequest = z.infer<typeof RecordCreateRequest>;

/**
 * PATCH /records/{id} 요청 body.
 * 보낸 필드만 수정. imageIds는 최종 유지 목록으로 전체 교체.
 */
export const RecordUpdateRequest = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    content: z.string().optional(),
    imageIds: z.array(z.number().int().nonnegative()).optional(),
  })
  .refine((body) => body.rating != null || body.content != null || body.imageIds != null, {
    message: '수정할 필드가 없습니다.',
  });
export type RecordUpdateRequest = z.infer<typeof RecordUpdateRequest>;

export const RecordResponse = z.object({
  recordId: z.number().int().positive().optional(),
  reviewId: z.number().int().positive().optional(),
  placeId: z.number().int().nonnegative(),
  placeName: z.string().min(1),
  visitVerifiedAt: z.string().nullable(),
  rating: z.number(),
  content: z.string(),
  images: z.array(ImageInfo),
  createdAt: z.string().min(1),
});
export type RecordResponse = z.infer<typeof RecordResponse>;

export const RecordDetailResponse = z.object({
  recordId: z.number().int().positive().optional(),
  reviewId: z.number().int().positive().optional(),
  placeId: z.number().int().nonnegative(),
  placeName: z.string().min(1),
  visitVerifiedAt: z.string().nullable(),
  rating: z.number().min(0).max(5),
  content: z.string(),
  imageUrls: z.array(z.string()).optional().default([]),
  images: z.array(ImageInfo).optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type RecordDetailResponse = z.infer<typeof RecordDetailResponse>;

export type RecordDetailImage = {
  key: string;
  imageUrl: string;
  imageId?: number;
};

export function recordDetailImagesOf(detail: RecordDetailResponse): RecordDetailImage[] {
  if (detail.images && detail.images.length > 0) {
    return detail.images.map((image) => ({
      key: `id-${image.imageId}`,
      imageUrl: image.imageUrl,
      imageId: image.imageId,
    }));
  }

  return (detail.imageUrls ?? []).map((imageUrl, index) => ({
    key: `url-${index}-${imageUrl}`,
    imageUrl,
  }));
}

export const RecordUpdateResponse = z.object({
  rating: z.number(),
  content: z.string(),
  images: z.array(ImageInfo),
  updatedAt: z.string().min(1),
});
export type RecordUpdateResponse = z.infer<typeof RecordUpdateResponse>;

export const ImageUploadResponse = z.object({ images: z.array(ImageInfo) });
export type ImageUploadResponse = z.infer<typeof ImageUploadResponse>;
