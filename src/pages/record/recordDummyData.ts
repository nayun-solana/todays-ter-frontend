import type { PlaceDay } from '../../components/RecordPlaceCard';

export type Place = {
  id: string;
  name: string;
  categories: readonly string[];
  date: string;
  day: PlaceDay;
};

export type VisitedPlace = Place & {
  /** 공유 카드로 등록된 다녀온 터인지 */
  isShared: boolean;
  shareMessage?: string;
  imageUrl?: string;
};

/** 저장한 터 — 독립 목록 */
export const SAVED_PLACES: readonly Place[] = [
  {
    id: 's1',
    name: '경복궁',
    categories: ['재물', '커리어'],
    date: '06.29',
    day: '토',
  },
  {
    id: 's2',
    name: '청계천',
    categories: ['연애', '건강'],
    date: '06.28',
    day: '수',
  },
  {
    id: 's3',
    name: '용산 호텔 라운지',
    categories: ['커리어'],
    date: '06.27',
    day: '화',
  },
];

/**
 * 다녀온 터 — 공유 카드는 이 목록의 부분집합.
 * isShared: true 인 항목만 공유 카드 탭에 노출.
 */
export const VISITED_PLACES: readonly VisitedPlace[] = [
  {
    id: 'v1',
    name: '남산타워',
    categories: ['연애'],
    date: '06.25',
    day: '토',
    isShared: true,
    shareMessage: '오늘은 흙의 기운 받으러 남산타워로!',
    imageUrl:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80',
  },
  {
    id: 'v2',
    name: '한강공원',
    categories: ['건강'],
    date: '06.24',
    day: '수',
    isShared: true,
    shareMessage: '오늘은 물의 기운 받으러 한강공원으로!',
    imageUrl:
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
  },
  {
    id: 'v3',
    name: '성수동 카페거리',
    categories: ['재물', '커리어'],
    date: '06.23',
    day: '화',
    isShared: true,
    shareMessage: '오늘은 불의 기운 받으러 성수동으로!',
    imageUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    id: 'v4',
    name: '북촌 한옥마을',
    categories: ['건강'],
    date: '06.22',
    day: '목',
    isShared: false,
  },
];

/** 공유 카드 = 다녀온 터 중 isShared 인 항목 */
export const SHARED_PLACES: readonly VisitedPlace[] = VISITED_PLACES.filter(
  (place) => place.isShared,
);
