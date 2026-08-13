import { z } from 'zod';

/** POST /records — type */
export const RecordWriteType = z.enum(['RECORD', 'REVIEW']);
export type RecordWriteType = z.infer<typeof RecordWriteType>;

export const RecordImageItem = z.object({
  imageId: z.number().int().nonnegative(),
  imageUrl: z.string(),
});
export type RecordImageItem = z.infer<typeof RecordImageItem>;

/** POST /records/images 응답 result */
export const RecordImagesUploadResponse = z.object({
  images: z.array(RecordImageItem),
});
export type RecordImagesUploadResponse = z.infer<typeof RecordImagesUploadResponse>;

/** POST /records 응답 result */
export const CreateRecordResponse = z.object({
  /** 나에 맞는 터 방문 기록일 때 */
  recordId: z.number().int().positive().optional(),
  /** 장소 후기일 때 */
  reviewId: z.number().int().positive().optional(),
  placeId: z.number().int().nonnegative(),
  placeName: z.string(),
  /** 방문 인증 시각. 미인증이면 null */
  visitVerifiedAt: z.string().nullable(),
  rating: z.number(),
  content: z.string(),
  images: z.array(RecordImageItem),
  createdAt: z.string(),
});
export type CreateRecordResponse = z.infer<typeof CreateRecordResponse>;

/**
 * PATCH /records/{id} 요청 body.
 * 보낸 필드만 수정. imageIds는 최종 유지 목록으로 전체 교체.
 */
export const UpdateRecordRequest = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    content: z.string().optional(),
    imageIds: z.array(z.number().int().nonnegative()).optional(),
  })
  .refine((body) => body.rating != null || body.content != null || body.imageIds != null, {
    message: '수정할 필드가 없습니다.',
  });
export type UpdateRecordRequest = z.infer<typeof UpdateRecordRequest>;
