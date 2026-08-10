import { z } from 'zod';

export const ImageInfo = z.object({
  imageId: z.number().int().positive(),
  imageUrl: z.string().url(),
});
export type ImageInfo = z.infer<typeof ImageInfo>;

export const RecordCreateRequest = z.object({
  placeId: z.number().int().positive(),
  type: z.enum(['RECORD', 'REVIEW']),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1),
  imageIds: z.array(z.number().int().positive()),
});
export type RecordCreateRequest = z.infer<typeof RecordCreateRequest>;

export const RecordUpdateRequest = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().optional(),
  imageIds: z.array(z.number().int().positive()).optional(),
});
export type RecordUpdateRequest = z.infer<typeof RecordUpdateRequest>;

export const RecordResponse = z.object({
  placeId: z.number().int().positive(),
  placeName: z.string().min(1),
  visitVerifiedAt: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string(),
  images: z.array(ImageInfo),
  createdAt: z.string().min(1),
});
export type RecordResponse = z.infer<typeof RecordResponse>;

export const RecordDetailResponse = z.object({
  placeId: z.number().int().positive(),
  placeName: z.string().min(1),
  visitVerifiedAt: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string(),
  imageUrls: z.array(z.string().url()),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type RecordDetailResponse = z.infer<typeof RecordDetailResponse>;

export const RecordUpdateResponse = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string(),
  images: z.array(ImageInfo),
  updatedAt: z.string().min(1),
});
export type RecordUpdateResponse = z.infer<typeof RecordUpdateResponse>;

export const ImageUploadResponse = z.object({ images: z.array(ImageInfo) });
export type ImageUploadResponse = z.infer<typeof ImageUploadResponse>;
