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
  mapUrl: z.string().nullish(),
  reviewCount: z.number().int().nonnegative(),
  isSaved: z.boolean(),
  isVisited: z.boolean(),
});
export type PlaceDetailResponse = z.infer<typeof PlaceDetailResponse>;

/** PATCH /places/{placeId}/bookmark 응답 */
export const PlaceBookmarkResponse = z.object({
  placeId: z.number().int().positive(),
  isSaved: z.boolean(),
});
export type PlaceBookmarkResponse = z.infer<typeof PlaceBookmarkResponse>;

const ImageInfo = z.object({
  imageId: z.number().int().positive(),
  imageUrl: z.string().url(),
});

export const PlaceReviewItem = z.object({
  reviewId: z.number().int().positive(),
  writerNickname: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string(),
  images: z.array(ImageInfo),
  createdAt: z.string().min(1),
});
export type PlaceReviewItem = z.infer<typeof PlaceReviewItem>;

export const PlaceReviewsResponse = z.object({
  totalCount: z.number().int().nonnegative(),
  myReview: PlaceReviewItem.nullable().optional(),
  reviews: z.array(PlaceReviewItem),
});
export type PlaceReviewsResponse = z.infer<typeof PlaceReviewsResponse>;
