import type { MyPlaceItem } from './api/types';

/** 저장한 터 — API 연동 전 더미 */
export const SAVED_PLACES: readonly MyPlaceItem[] = [
  {
    placeId: 1,
    placeName: '경복궁',
    thumbnailUrl: '',
    categories: ['재물', '커리어'],
    savedDate: '2026-06-29',
    element: '토',
  },
  {
    placeId: 2,
    placeName: '청계천',
    thumbnailUrl: '',
    categories: ['연애', '건강'],
    savedDate: '2026-06-28',
    element: '수',
  },
  {
    placeId: 3,
    placeName: '용산 호텔 라운지',
    thumbnailUrl: '',
    categories: ['커리어'],
    savedDate: '2026-06-27',
    element: '화',
  },
];

/** 다녀온 터 — API 연동 전 더미 */
export const VISITED_PLACES: readonly MyPlaceItem[] = [
  {
    placeId: 10,
    placeName: '남산타워',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80',
    categories: ['연애'],
    savedDate: '2026-06-25',
    element: '토',
  },
  {
    placeId: 11,
    placeName: '한강공원',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    categories: ['건강'],
    savedDate: '2026-06-24',
    element: '수',
  },
  {
    placeId: 12,
    placeName: '성수동 카페거리',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    categories: ['재물', '커리어'],
    savedDate: '2026-06-23',
    element: '화',
  },
  {
    placeId: 13,
    placeName: '북촌 한옥마을',
    thumbnailUrl: '',
    categories: ['건강'],
    savedDate: '2026-06-22',
    element: '목',
  },
];
