import assert from 'node:assert/strict';

import {
  EditorPicksResponse,
  ExploreFiltersResponse,
  PlaceListResponse,
} from '../src/types/search/search';
import { PlaceDetailResponse } from '../src/types/place/place';
import { MyPageResponse, SocialConnectionsResponse } from '../src/types/my/my';

const filters = ExploreFiltersResponse.parse({
  regions: [{ code: 'ALL', name: '전체', displayOrder: 0 }],
  themes: [{ code: 'LOVE', name: '연애 터', placeCount: 3, displayOrder: 1 }],
  elements: [
    { code: 'ALL', name: '전체', displayOrder: 0 },
    { code: 'WATER', name: '수', displayOrder: 4 },
  ],
});

const places = PlaceListResponse.parse({
  appliedFilters: {
    keyword: null,
    regionCode: 'ALL',
    themeType: null,
    elementType: 'WATER',
  },
  content: [
    {
      placeId: 2,
      placeName: '청계천 모전교',
      thumbnailUrl: null,
      summary: '도심 속 물길',
      element: { code: 'WATER', name: '수' },
      theme: { code: 'HEALTH', name: '건강 터' },
      averageRating: 4.8,
      distanceKm: null,
    },
  ],
  page: { number: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false },
});

EditorPicksResponse.parse({
  content: [
    {
      placeId: 31,
      placeName: '북한산 둘레길',
      thumbnailUrl: null,
      summary: '목기 창작 코스',
      description: '창작 슬럼프를 깨는 오행 터',
      element: { code: 'WOOD', name: '목' },
      theme: { code: 'HEALTH', name: '건강 터' },
      averageRating: 4.9,
    },
  ],
});

PlaceDetailResponse.parse({
  placeId: 2,
  placeName: '청계천 모전교',
  imageUrl: null,
  element: '수',
  hashtags: ['감정 회복'],
  description: {
    question: '이 터의 특징은 무엇인가요?',
    answer: '수 기운이 강한 장소예요.',
  },
  address: '서울 중구 무교동',
  latitude: 37.5665,
  longitude: 126.978,
  reviewCount: 9,
  isSaved: false,
  isVisited: false,
});

MyPageResponse.parse({
  nickname: '계수',
  profileImageUrl: null,
  email: 'user@example.com',
});

SocialConnectionsResponse.parse({
  connections: [
    {
      provider: 'KAKAO',
      isLinked: true,
      linkedEmail: 'user@kakao.com',
      linkedAt: '2026-07-19T10:00:00',
    },
  ],
});

assert.equal(filters.elements[0].code, 'ALL');
assert.equal(places.content[0].distanceKm, null);
