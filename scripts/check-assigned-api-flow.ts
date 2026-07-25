import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const axiosModule = (await server.ssrLoadModule(
    '/src/api/axiosInstance.ts',
  )) as typeof import('../src/api/axiosInstance');
  const searchApi = (await server.ssrLoadModule(
    '/src/api/search.ts',
  )) as typeof import('../src/api/search');
  const searchHooks = (await server.ssrLoadModule(
    '/src/hooks/search/useSearch.ts',
  )) as typeof import('../src/hooks/search/useSearch');
  const placeApi = (await server.ssrLoadModule(
    '/src/api/place.ts',
  )) as typeof import('../src/api/place');
  const placeHooks = (await server.ssrLoadModule(
    '/src/hooks/place/usePlace.ts',
  )) as typeof import('../src/hooks/place/usePlace');
  const myApi = (await server.ssrLoadModule('/src/api/my.ts')) as typeof import('../src/api/my');
  const myHooks = (await server.ssrLoadModule(
    '/src/hooks/my/useMy.ts',
  )) as typeof import('../src/hooks/my/useMy');

  const axiosInstance = axiosModule.default;
  const requests: Array<{ url: string; params?: unknown }> = [];
  const originalGet = axiosInstance.get;

  axiosInstance.get = (async (url: string, config?: { params?: unknown }) => {
    requests.push({ url, params: config?.params });

    const result =
      url === '/places/explore-filters'
        ? {
            regions: [{ code: 'ALL', name: '전체', displayOrder: 0 }],
            themes: [{ code: 'LOVE', name: '연애 터', placeCount: 1, displayOrder: 1 }],
            elements: [{ code: 'ALL', name: '전체', displayOrder: 0 }],
          }
      : url === '/places/editor-picks'
          ? {
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
            }
          : url === '/places/2'
            ? {
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
              }
            : url === '/mypage'
              ? {
                  nickname: '계수',
                  profileImageUrl: null,
                  email: 'user@example.com',
                }
              : url === '/mypage/social-connections'
                ? {
                    connections: [
                      {
                        provider: 'KAKAO',
                        isLinked: true,
                        linkedEmail: 'user@kakao.com',
                        linkedAt: '2026-07-19T10:00:00',
                      },
                    ],
                  }
            : {
              appliedFilters: {
                keyword: null,
                regionCode: 'SEOUL',
                themeType: null,
                elementType: 'WATER',
              },
              content: [],
              page: { number: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false },
            };

    return {
      data: { isSuccess: true, code: 'COMMON200', message: '성공', result },
    };
  }) as typeof axiosInstance.get;

  try {
    await searchApi.getExploreFilters();
    await searchApi.getPlaces({
      regionCode: 'SEOUL',
      elementType: 'WATER',
      page: 0,
      size: 20,
    });
    await searchApi.getEditorPicks(3);
    await placeApi.getPlaceDetail('2');
    await myApi.getMyPage();
    await myApi.getSocialConnections();
  } finally {
    axiosInstance.get = originalGet;
  }

  assert.deepEqual(requests, [
    { url: '/places/explore-filters', params: undefined },
    {
      url: '/places',
      params: { regionCode: 'SEOUL', elementType: 'WATER', page: 0, size: 20 },
    },
    { url: '/places/editor-picks', params: { limit: 3 } },
    { url: '/places/2', params: undefined },
    { url: '/mypage', params: undefined },
    { url: '/mypage/social-connections', params: undefined },
  ]);
  assert.deepEqual(searchHooks.searchKeys.places({ regionCode: 'SEOUL' }), [
    'search',
    'places',
    { regionCode: 'SEOUL' },
  ]);
  assert.deepEqual(placeHooks.placeKeys.detail('2'), ['places', 'detail', '2']);
  assert.deepEqual(myHooks.myKeys.profile(), ['my', 'profile']);
  assert.deepEqual(myHooks.myKeys.socialConnections(), ['my', 'social-connections']);
} finally {
  await server.close();
}
