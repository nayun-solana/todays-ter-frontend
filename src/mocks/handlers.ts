import { http, HttpResponse } from 'msw';

/**
 * MSW mock 핸들러 — BE 미배포 엔드포인트 선개발용. dev 전용(main.tsx에서 dev만 로드).
 * ⚠️ 응답 계약은 추측(화면·명세서 경로 기준). BE 배포(Swagger) 시 실제 스키마로 교체하고 해당 핸들러 제거.
 */

/** ApiResponse<T> 봉투로 감싸기 (BE 공통 응답 형식) */
function ok<T>(result: T) {
  return HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: '성공', result });
}

const SEARCH_PLACES = [
  {
    placeId: 25,
    placeName: '경복궁',
    thumbnailUrl: null,
    summary: '안정과 번영의 기운, 토기 충전',
    element: { code: 'EARTH', name: '토' },
    theme: { code: 'WEALTH', name: '재물 터' },
    averageRating: 4.7,
    distanceKm: 3.5,
    regionCode: 'SEOUL',
  },
  {
    placeId: 2,
    placeName: '청계천 모전교',
    thumbnailUrl: null,
    summary: '도심 속 힐링 물길, 수기 충전',
    element: { code: 'WATER', name: '수' },
    theme: { code: 'HEALTH', name: '건강 터' },
    averageRating: 4.8,
    distanceKm: 2.1,
    regionCode: 'SEOUL',
  },
  {
    placeId: 31,
    placeName: '북한산 둘레길',
    thumbnailUrl: null,
    summary: '새로운 시작의 기운, 목기 충전',
    element: { code: 'WOOD', name: '목' },
    theme: { code: 'CAREER', name: '커리어 터' },
    averageRating: 4.9,
    distanceKm: 8.3,
    regionCode: 'SEOUL',
  },
] as const;

const EDITOR_PICKS = [
  {
    placeId: 31,
    placeName: '북한산 둘레길',
    thumbnailUrl: null,
    summary: '목기 창작 코스',
    description: '창작 슬럼프를 깨는 최고의 오행 터',
    element: { code: 'WOOD', name: '목' },
    theme: { code: 'HEALTH', name: '건강 터' },
    averageRating: 4.9,
  },
  {
    placeId: 2,
    placeName: '청계천 모전교',
    thumbnailUrl: null,
    summary: '수기 감정 정화 루트',
    description: '마음이 무거울 때 꼭 가야 하는 곳',
    element: { code: 'WATER', name: '수' },
    theme: { code: 'LOVE', name: '연애 터' },
    averageRating: 4.8,
  },
  {
    placeId: 25,
    placeName: '경복궁',
    thumbnailUrl: null,
    summary: '토기 안정 충전지',
    description: '결정을 앞둔 날, 중심 잡기 최적 터',
    element: { code: 'EARTH', name: '토' },
    theme: { code: 'WEALTH', name: '재물 터' },
    averageRating: 4.7,
  },
] as const;

export const handlers = [
  // GET /home/today-energy — 오늘 나의 기운(오행)
  http.get('/home/today-energy', () =>
    ok({
      element: 'WATER',
      label: '수',
      description: '안정과 균형의 기운. 중심을 잡고\n주변 사람들과의 관계가 조화롭게 이어집니다.',
    }),
  ),

  // GET /home/header — 인사 헤더
  http.get('/home/header', () =>
    ok({ dateLabel: '2026년 6월 11일 목요일', userName: '윤진', message: '오늘도 좋은 기운 충전해요' }),
  ),

  // GET /home/energy-routines — 오늘 에너지 루틴
  http.get('/home/energy-routines', () =>
    ok({ title: '토기 에너지 루틴', routines: ['10분 명상하기', '계획 정리하기', '맨발로 땅 밟기'] }),
  ),

  // GET /home/recommended-place — 오늘 가장 잘 맞는 터
  http.get('/home/recommended-place', () =>
    ok({
      places: [
        {
          recommendationId: '1',
          badge: '최고 궁합',
          name: '경복궁',
          subtitle: '안정과 번영의 기운, 토기 충전',
          description:
            '왕궁의 터는 수백 년 동안 토기를 축적해왔습니다.\n안정과 중심을 잡아주는 기운이 강해\n재물과 사업에 큰 도움이 됩니다.',
          distanceLabel: '3.5km',
          rating: 4.7,
        },
        {
          recommendationId: '2',
          badge: '최고 궁합',
          name: '창덕궁',
          subtitle: '고요와 회복의 기운, 수기 충전',
          description:
            '후원의 깊은 숲과 물길이\n마음을 가라앉히고 생각을 정리해줍니다.\n지친 하루의 회복에 좋은 터입니다.',
          distanceLabel: '4.2km',
          rating: 4.8,
        },
      ],
    }),
  ),

  // GET /recommendations/:id — 추천 장소 상세(나와 어울리는 터)
  http.get('/recommendations/:id', () =>
    ok({
      element: 'WATER',
      placeName: '청계천 모전교',
      matchRate: 87,
      hashtag: '감정 회복',
      reason:
        '계수님은 수(水)와 목(木)의 흐름이 강하고,\n오늘은 감정 정리와 회복이 필요한 날이에요.\n이 터는 수기(水氣)가 강해 현재 흐름과 잘 맞습니다.',
      points: ['주 오행 水', '오늘 흐름 안정', '연애운 회복'],
      suggestion: '오늘은 30분 정도 물길을 따라 걸으며\n마음을 정리해보세요.',
    }),
  ),

  // GET /places/explore-filters — 탐색 필터와 테마 metadata
  http.get('/places/explore-filters', () =>
    ok({
      regions: [
        { code: 'ALL', name: '전체', displayOrder: 0 },
        { code: 'SEOUL', name: '서울', displayOrder: 1 },
        { code: 'JEJU', name: '제주', displayOrder: 2 },
        { code: 'BUSAN', name: '부산', displayOrder: 3 },
        { code: 'GANGWON', name: '강원', displayOrder: 4 },
        { code: 'CAPITAL', name: '수도권', displayOrder: 5 },
      ],
      themes: [
        { code: 'LOVE', name: '연애 터', placeCount: 3, displayOrder: 1 },
        { code: 'CAREER', name: '커리어 터', placeCount: 3, displayOrder: 2 },
        { code: 'WEALTH', name: '재물 터', placeCount: 3, displayOrder: 3 },
        { code: 'RELATIONSHIP', name: '인간관계 터', placeCount: 3, displayOrder: 4 },
        { code: 'HEALTH', name: '건강 터', placeCount: 3, displayOrder: 5 },
        { code: 'ETC', name: '기타', placeCount: 3, displayOrder: 6 },
      ],
      elements: [
        { code: 'ALL', name: '전체', displayOrder: 0 },
        { code: 'FIRE', name: '화', displayOrder: 1 },
        { code: 'EARTH', name: '토', displayOrder: 2 },
        { code: 'WOOD', name: '목', displayOrder: 3 },
        { code: 'WATER', name: '수', displayOrder: 4 },
        { code: 'METAL', name: '금', displayOrder: 5 },
      ],
    }),
  ),

  // 동적 /places/:placeId보다 먼저 둬서 editor-picks가 placeId로 잡히지 않게 한다.
  http.get('/places/editor-picks', ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 3);
    return ok({ content: EDITOR_PICKS.slice(0, limit) });
  }),

  // GET /places — 탐색 장소 목록
  http.get('/places', ({ request }) => {
    const url = new URL(request.url);
    const regionCode = url.searchParams.get('regionCode');
    const elementType = url.searchParams.get('elementType');
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const hasCoordinates =
      url.searchParams.has('latitude') && url.searchParams.has('longitude');
    const filtered = SEARCH_PLACES.filter(
      (place) =>
        (!regionCode || regionCode === 'ALL' || place.regionCode === regionCode) &&
        (!elementType || place.element.code === elementType),
    );
    const content = filtered.slice(page * size, (page + 1) * size).map((place) => ({
      ...place,
      distanceKm: hasCoordinates ? place.distanceKm : null,
      regionCode: undefined,
    }));

    return ok({
      appliedFilters: {
        keyword: null,
        regionCode,
        themeType: null,
        elementType,
      },
      content,
      page: {
        number: page,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        hasNext: (page + 1) * size < filtered.length,
      },
    });
  }),
];
