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
  const requests: Array<{ method: 'GET' | 'PATCH'; url: string; params?: unknown; body?: unknown }> = [];
  const originalGet = axiosInstance.get;
  const originalPatch = axiosInstance.patch;

  axiosInstance.get = (async (url: string, config?: { params?: unknown }) => {
    requests.push({ method: 'GET', url, params: config?.params });

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
                  reportId: 83721,
                  nickname: '계수',
                  profileImageUrl: null,
                }
              : url === '/mypage/social-connections'
                ? {
                    policyUrl: 'https://example.com/policies/account-linkage',
                    connections: [
                      {
                        provider: 'KAKAO',
                        isLinked: true,
                        linkedEmail: 'user@kakao.com',
                        linkedAt: '2026-07-19T10:00:00',
                      },
                    ],
                  }
                : url === '/mypage/notification-settings'
                  ? {
                      isPushEnabled: true,
                      isMarketingEnabled: false,
                      isNightMarketingEnabled: false,
                    }
                  : url === '/mypage/permissions'
                    ? {
                        isCameraAllowed: true,
                        isPhotoLibraryAllowed: false,
                        isLocationAllowed: false,
                      }
                    : url === '/mypage/policies'
                      ? {
                          policies: [
                            {
                              type: 'TERMS_OF_SERVICE',
                              title: '서비스 이용약관',
                              url: 'https://example.com/policies/terms',
                              isRequired: true,
                              isAgreed: true,
                              agreedAt: '2025-01-01T10:00:00',
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

  axiosInstance.patch = (async (url: string, body: unknown) => {
    requests.push({ method: 'PATCH', url, body });
    return {
      data: {
        isSuccess: true,
        code: 'COMMON200',
        message: '성공',
        result: { updatedAt: '2026-07-19T19:03:00' },
      },
    };
  }) as typeof axiosInstance.patch;

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
    await myApi.getNotificationSettings();
    await myApi.updateNotificationSettings({
      isPushEnabled: true,
      isMarketingEnabled: true,
      isNightMarketingEnabled: false,
    });
    await myApi.getPermissionSettings();
    await myApi.updatePermissionSettings({
      isCameraAllowed: true,
      isPhotoLibraryAllowed: true,
      isLocationAllowed: false,
    });
    await myApi.getPolicies();
  } finally {
    axiosInstance.get = originalGet;
    axiosInstance.patch = originalPatch;
  }

  assert.deepEqual(requests, [
    { method: 'GET', url: '/places/explore-filters', params: undefined },
    {
      method: 'GET',
      url: '/places',
      params: { regionCode: 'SEOUL', elementType: 'WATER', page: 0, size: 20 },
    },
    { method: 'GET', url: '/places/editor-picks', params: { limit: 3 } },
    { method: 'GET', url: '/places/2', params: undefined },
    { method: 'GET', url: '/mypage', params: undefined },
    { method: 'GET', url: '/mypage/social-connections', params: undefined },
    { method: 'GET', url: '/mypage/notification-settings', params: undefined },
    {
      method: 'PATCH',
      url: '/mypage/notification-settings',
      body: { isPushEnabled: true, isMarketingEnabled: true, isNightMarketingEnabled: false },
    },
    { method: 'GET', url: '/mypage/permissions', params: undefined },
    {
      method: 'PATCH',
      url: '/mypage/permissions',
      body: { isCameraAllowed: true, isPhotoLibraryAllowed: true, isLocationAllowed: false },
    },
    { method: 'GET', url: '/mypage/policies', params: undefined },
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
