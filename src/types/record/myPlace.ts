import { z } from 'zod';

/** GET /places/me?type= 쿼리 */
export const MyPlaceListType = z.enum(['saved', 'visited']);
export type MyPlaceListType = z.infer<typeof MyPlaceListType>;

/** 화·수·목·금·토 (오행) */
export const MyPlaceElement = z.enum(['화', '수', '목', '금', '토']);
export type MyPlaceElement = z.infer<typeof MyPlaceElement>;

/** GET /places/me?type= 응답 result 항목 */
export const MyPlaceItem = z.object({
  placeId: z.number().int().positive(),
  placeName: z.string().min(1),
  thumbnailUrl: z.string().url().nullable(),
  categories: z.array(z.string()),
  savedDate: z.string().min(1),
  element: MyPlaceElement,
});
export type MyPlaceItem = z.infer<typeof MyPlaceItem>;

export const MyPlaceListResponse = z.object({ places: z.array(MyPlaceItem) });
export type MyPlaceListResponse = z.infer<typeof MyPlaceListResponse>;
