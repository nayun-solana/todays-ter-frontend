/** GET /my-places?type= 쿼리 */
export type MyPlaceListType = 'saved' | 'recordId';

/** 화·수·목·금·토 (오행) */
export type MyPlaceElement = '화' | '수' | '목' | '금' | '토';

/** GET /my-places?type= 응답 result 항목 */
export type MyPlaceItem = {
  placeId: number;
  placeName: string;
  thumbnailUrl: string;
  categories: string[];
  savedDate: string;
  element: MyPlaceElement;
};
