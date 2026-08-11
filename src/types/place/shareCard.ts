import { z } from 'zod';

/** GET /places/{placeId}/share-cards 응답 result */
export const PlaceShareCard = z.object({
  placeName: z.string().min(1),
  element: z.enum(['목', '화', '토', '금', '수']),
  imageUrl: z.string().min(1),
});
export type PlaceShareCard = z.infer<typeof PlaceShareCard>;
