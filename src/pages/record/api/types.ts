import type { PlaceDay } from '../components/RecordPlaceCard';

/** GET /my-places?type= 쿼리 */
export type MyPlaceListType = 'saved' | 'recordId';

/** GET /my-places?type= 응답 result 항목 */
export type MyPlaceItem = {
  placeId: number;
  placeName: string;
  thumbnailUrl: string;
  categories: string[];
  savedDate: string;
  element: PlaceDay;
};
