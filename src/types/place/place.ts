import { z } from 'zod';

export const PlaceDetailResponse = z.object({
  placeId: z.number().int().positive(),
  placeName: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  element: z.enum(['목', '화', '토', '금', '수']),
  hashtags: z.array(z.string()),
  description: z.object({
    question: z.string(),
    answer: z.string(),
  }),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  reviewCount: z.number().int().nonnegative(),
  isSaved: z.boolean(),
  isVisited: z.boolean(),
});
export type PlaceDetailResponse = z.infer<typeof PlaceDetailResponse>;
