import { z } from 'zod';

/** GET /my-places/visited/{visitId} 응답 result */
export const VisitedReviewDetail = z.object({
  visitId: z.number().int().positive(),
  placeId: z.number().int().positive(),
  placeName: z.string().min(1),
  visitVerifiedAt: z.string().min(1),
  rating: z.number().min(0).max(5),
  content: z.string(),
  imageUrls: z.array(z.string().url()),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type VisitedReviewDetail = z.infer<typeof VisitedReviewDetail>;
