import { z } from 'zod';

/** GET /my-places?type= 쿼리 */
export const MyPlaceListType = z.enum(['saved', 'recordId']);
export type MyPlaceListType = z.infer<typeof MyPlaceListType>;

/** 화·수·목·금·토 (오행) */
export const MyPlaceElement = z.enum(['화', '수', '목', '금', '토']);
export type MyPlaceElement = z.infer<typeof MyPlaceElement>;

/** GET /my-places?type= 응답 result 항목 */
export const MyPlaceItem = z.object({
  placeId: z.number().int().positive(),
  visitId: z.number().int().positive().optional(),
  placeName: z.string().min(1),
  thumbnailUrl: z.string().url().nullable(),
  categories: z.array(z.string()),
  savedDate: z.string().min(1),
  element: MyPlaceElement,
});
export type MyPlaceItem = z.infer<typeof MyPlaceItem>;

export const MyPlaceListResponse = z.array(MyPlaceItem);
export type MyPlaceListResponse = z.infer<typeof MyPlaceListResponse>;
