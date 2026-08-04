import { http, HttpResponse } from 'msw';

/**
 * MSW mock 핸들러 — BE 미배포 엔드포인트 선개발용. dev 전용(main.tsx에서 dev만 로드).
 * ⚠️ 응답 계약은 추측(화면·명세서 경로 기준). BE 배포(Swagger) 시 실제 스키마로 교체하고 해당 핸들러 제거.
 */

/** ApiResponse<T> 봉투로 감싸기 (BE 공통 응답 형식) */
function ok<T>(result: T) {
  return HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: '성공', result });
}

/** 401 응답 (BE ExceptionAdvice 형식) */
function unauthorized() {
  return HttpResponse.json(
    { isSuccess: false, code: 'COMMON401', message: '인증이 필요합니다.', result: null },
    { status: 401 },
  );
}

// ── 인증 목 상태 ──────────────────────────────────────────────
// 서버가 502라 토큰 만료 → 재발급 → 원요청 재시도 흐름을 실서버로 검증할 수 없다.
// 목이 "현재 유효한 accessToken"을 들고 있다가, 콘솔에서 window.__expireToken()을 호출하면
// 토큰을 갈아치워 다음 요청이 401을 맞게 한다. 그 뒤 재발급이 도는지 보면 된다.
let validAccessToken = 'mock-access-1';
let issuedCount = 1;

function issueAccessToken(): string {
  issuedCount += 1;
  validAccessToken = `mock-access-${issuedCount}`;
  return validAccessToken;
}

/** Authorization 헤더가 있는데 값이 최신 토큰이 아니면 만료로 본다(헤더가 없으면 게스트로 통과). */
function isStaleToken(request: Request): boolean {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return false;
  return header.slice('Bearer '.length) !== validAccessToken;
}

/** refresh까지 만료된 상태(세션 종료) 시뮬레이션 스위치. */
let reissueBroken = false;

if (typeof window !== 'undefined') {
  const devTools = window as unknown as { __expireToken: () => void; __breakReissue: () => void };

  devTools.__expireToken = () => {
    validAccessToken = `mock-access-expired-${issuedCount}`;
    console.info('[msw] accessToken을 만료시켰습니다. 다음 요청은 401 → 재발급을 타야 합니다.');
  };

  devTools.__breakReissue = () => {
    reissueBroken = true;
    console.info('[msw] 이제 재발급도 401입니다. 세션 종료 → 로그인 리다이렉트를 확인하세요.');
  };
}

const CHEONGGYECHEON_IMAGE_URL = new URL('../assets/place-cheonggyecheon.png', import.meta.url)
  .href;
const PLACE_SAMPLE_IMAGE_URL = new URL('../assets/home/place-sample.jpg', import.meta.url).href;

const SEARCH_PLACES = [
  {
    placeId: 25,
    placeName: '경복궁',
    thumbnailUrl: PLACE_SAMPLE_IMAGE_URL,
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
    thumbnailUrl: CHEONGGYECHEON_IMAGE_URL,
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
    thumbnailUrl: PLACE_SAMPLE_IMAGE_URL,
    summary: '새로운 시작의 기운, 목기 충전',
    element: { code: 'WOOD', name: '목' },
    theme: { code: 'CAREER', name: '커리어 터' },
    averageRating: 4.9,
    distanceKm: 8.3,
    regionCode: 'SEOUL',
  },
  {
    placeId: 41,
    placeName: '남산서울타워',
    thumbnailUrl: CHEONGGYECHEON_IMAGE_URL,
    summary: '활력과 열정의 기운, 화기 충전',
    element: { code: 'FIRE', name: '화' },
    theme: { code: 'LOVE', name: '연애 터' },
    averageRating: 4.6,
    distanceKm: 4.2,
    regionCode: 'SEOUL',
  },
  {
    placeId: 52,
    placeName: '동대문디자인플라자',
    thumbnailUrl: PLACE_SAMPLE_IMAGE_URL,
    summary: '정돈과 결단의 기운, 금기 충전',
    element: { code: 'METAL', name: '금' },
    theme: { code: 'CAREER', name: '커리어 터' },
    averageRating: 4.5,
    distanceKm: 5.1,
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
  // ── 인증 (BE main에 배포됨. 서버 502 동안 흐름 검증용 목) ──
  // POST /auth/dev/token — 개발용 회원 토큰 발급
  http.post('/auth/dev/token', () => ok({ memberId: 1, accessToken: issueAccessToken() })),

  // POST /auth/reissue — refresh 쿠키로 재발급. 실서버는 회전식이라 FE가 single-flight로 한 번만 불러야 한다.
  http.post('/auth/reissue', () => {
    console.info('[msw] /auth/reissue 호출됨');
    return reissueBroken ? unauthorized() : ok({ accessToken: issueAccessToken() });
  }),

  // POST /auth/logout
  http.post('/auth/logout', () => ok(null)),

  // GET /home/today-energy — 오늘 나의 기운(오행)
  http.get('/home/today-energy', ({ request }) =>
    isStaleToken(request)
      ? unauthorized()
      : ok({
          element: 'WATER',
          label: '수',
          description:
            '안정과 균형의 기운. 중심을 잡고\n주변 사람들과의 관계가 조화롭게 이어집니다.',
        }),
  ),

  // GET /home/header — 인사 헤더
  http.get('/home/header', ({ request }) =>
    isStaleToken(request)
      ? unauthorized()
      : ok({
          dateLabel: '2026년 6월 11일 목요일',
          userName: '윤진',
          message: '오늘도 좋은 기운 충전해요',
        }),
  ),

  // GET /home/energy-routines — 오늘 에너지 루틴
  http.get('/home/energy-routines', ({ request }) =>
    isStaleToken(request)
      ? unauthorized()
      : ok({
          title: '토기 에너지 루틴',
          routines: ['10분 명상하기', '계획 정리하기', '맨발로 땅 밟기'],
        }),
  ),

  // GET /home/recommended-place — 오늘 가장 잘 맞는 터
  http.get('/home/recommended-place', ({ request }) =>
    isStaleToken(request)
      ? unauthorized()
      : ok({
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

  // GET /saju-reports/:reportid/summary - 사주 리포트 조회
  http.get('/saju-reports/:reportid/summary', () =>
    ok({
      reportId: 1,
      reportType: 'BASIC',
      headline: '깊게 느끼고 천천히 움직이는',
      sajuTypeName: '수목형',
      elementAnalysis: {
        summary: '당신은 수와 목의 조합이 강하고, 화가 부족한 편이에요.',
        primaryElements: ['WATER', 'WOOD'],
        complementaryElements: ['FIRE'],
        distribution: [
          {
            code: 'WOOD',
            percentage: 28,
          },
          {
            code: 'FIRE',
            percentage: 12,
          },
          {
            code: 'EARTH',
            percentage: 18,
          },
          {
            code: 'METAL',
            percentage: 17,
          },
          {
            code: 'WATER',
            percentage: 25,
          },
        ],
      },
      overallTendency: {
        title: '전반적인 성향',
        items: [
          {
            code: 'EMOTION_THOUGHT',
            title: '감정과 생각의 흐름',
            description:
              '생각을 오래 하고 감정을 깊게 처리하는 타입이에요. 혼자만의 시간이 에너지를 회복시켜 줍니다.',
            displayOrder: 1,
          },
          {
            code: 'CHOICE_ACTION',
            title: '선택과 행동 방식',
            description:
              '새로운 시작에는 신중하지만, 실행 직전 망설임이 생길 수 있어요. 신뢰할 수 있는 공간에서 강점을 나타내는 편이에요.',
            displayOrder: 2,
          },
          {
            code: 'RECOVERY',
            title: '회복 방식',
            description:
              '자연이나 물이 있는 조용한 공간에서 에너지를 빠르게 충전해요. 편안한 곳보다 여유로운 공간을 선호합니다.',
            displayOrder: 3,
          },
        ],
      },
    }),
  ),

  // GET /saju-reports/:reportid/detail - 사주 리포트 상세 조회
  http.get('/saju-reports/:reportid/detail', () =>
    ok({
      reportId: 1,
      category: 'GENERAL',
      summary: {
        description: '생각은 깊고 감정은 섬세하지만, 실행의 타이밍에서는 망설임이 생기기 쉬워요.',
        primaryElement: 'WATER',
      },
      sajuCore: [
        {
          type: 'DAY_STEM',
          title: '일간',
          value: '계(癸)',
          description: '지혜롭고 유연함',
          displayOrder: 1,
        },
        {
          type: 'DAY_BRANCH',
          title: '일지',
          value: '자(子)',
          description: '감정적이고 내면이 풍부함',
          displayOrder: 2,
        },
        {
          type: 'DAY_PILLAR',
          title: '일주',
          value: '계자',
          description: '흐르는 물처럼 유연한 기운',
          displayOrder: 3,
        },
      ],
      flowAnalysis: [
        {
          type: 'EMOTIONAL_FLOW',
          title: '감정 흐름',
          description: '감정을 깊게 처리하며 혼자만의 시간에 에너지를 얻어요.',
          displayOrder: 1,
        },
        {
          type: 'RELATIONSHIP_PATTERN',
          title: '관계 패턴',
          description: '소수의 깊은 관계를 선호하고, 신뢰가 쌓이면 깊은 유대를 형성해요.',
          displayOrder: 2,
        },
        {
          type: 'ACTION_STYLE',
          title: '행동 스타일',
          description: '충분히 생각한 뒤 움직이며, 결정 후에는 묵묵히 실천해요.',
          displayOrder: 3,
        },
        {
          type: 'RECOVERY_POINT',
          title: '회복 포인트',
          description: '물이나 자연과 가까운 조용한 공간에서 빠르게 에너지를 회복해요.',
          displayOrder: 4,
        },
      ],
      complementaryElement: 'FIRE',
      recommendations: [
        {
          description: '탁 트인 전망 공간 방문하기',
          displayOrder: 1,
        },
        {
          description: '노을이나 야경 보러 가기',
          displayOrder: 2,
        },
        {
          description: '활기 있는 공간에 머물기',
          displayOrder: 3,
        },
      ],
    }),
  ),

  // GET /places/explore-filters — 탐색 필터와 테마 metadata
  http.get('*/places/explore-filters', () =>
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
  http.get('*/places/editor-picks', ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 3);
    return ok({ content: EDITOR_PICKS.slice(0, limit) });
  }),

  // GET /places — 탐색 장소 목록
  http.get('*/places', ({ request }) => {
    const url = new URL(request.url);
    const regionCode = url.searchParams.get('regionCode');
    const elementType = url.searchParams.get('elementType');
    const page = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 20);
    const hasCoordinates = url.searchParams.has('latitude') && url.searchParams.has('longitude');
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

  // GET /places/:placeId — 장소 상세 기본 정보
  http.get('*/places/:placeId', ({ params }) => {
    const place = SEARCH_PLACES.find((item) => String(item.placeId) === params.placeId);

    if (!place) {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: 'PLACE_NOT_FOUND',
          message: '존재하지 않는 장소입니다.',
        },
        { status: 404 },
      );
    }

    return ok({
      placeId: place.placeId,
      placeName: place.placeName,
      imageUrl: null,
      element: place.element.name,
      hashtags: [place.theme.name.replace(/ 터$/, '')],
      description: {
        question: '이 터의 특징은 무엇인가요?',
        answer: place.summary,
      },
      address: place.placeId === 2 ? '서울 중구 무교동' : '서울특별시',
      latitude: 37.5665,
      longitude: 126.978,
      reviewCount: 9,
      isSaved: false,
      isVisited: false,
    });
  }),

  // GET /mypage — 마이페이지 프로필
  http.get('*/mypage', () =>
    ok({
      nickname: '계수',
      profileImageUrl: null,
      email: 'gyesu@example.com',
    }),
  ),

  // GET /mypage/social-connections — 소셜 계정 연동 상태
  http.get('*/mypage/social-connections', () =>
    ok({
      connections: [
        {
          provider: 'KAKAO',
          isLinked: true,
          linkedEmail: 'kakao@email.com',
          linkedAt: '2026-07-19T10:00:00',
        },
        {
          provider: 'NAVER',
          isLinked: false,
          linkedEmail: null,
          linkedAt: null,
        },
        {
          provider: 'APPLE',
          isLinked: false,
          linkedEmail: null,
          linkedAt: null,
        },
      ],
    }),
  ),

  // GET /my-places/visited/:visitId — 다녀온 터 후기 상세
  http.get('*/my-places/visited/:visitId', ({ params }) => {
    const visitId = Number(params.visitId);
    const VISITED_REVIEWS: Record<
      number,
      {
        placeId: number;
        placeName: string;
        visitVerifiedAt: string;
        rating: number;
        content: string;
        imageUrls: string[];
      }
    > = {
      101: {
        placeId: 25,
        placeName: '남산타워',
        visitVerifiedAt: '2026-06-25',
        rating: 5,
        content: '오늘은 흙의 기운 받으러 남산타워로!',
        imageUrls: [],
      },
      102: {
        placeId: 2,
        placeName: '한강공원',
        visitVerifiedAt: '2026-06-24',
        rating: 4,
        content:
          '생각이 많았던 날이었는데, 물길을 따라 걷다 보니 마음이 조금 가라앉았다. 조용히 혼자 있기 좋은 터였다.',
        imageUrls: [],
      },
      103: {
        placeId: 31,
        placeName: '성수동 카페거리',
        visitVerifiedAt: '2026-06-23',
        rating: 4,
        content: '오늘은 불의 기운 받으러 성수동으로!',
        imageUrls: [],
      },
      104: {
        placeId: 13,
        placeName: '북촌 한옥마을',
        visitVerifiedAt: '2026-06-22',
        rating: 3,
        content: '골목을 걸으며 목의 기운을 충전했다.',
        imageUrls: [],
      },
    };

    const review = VISITED_REVIEWS[visitId] ?? VISITED_REVIEWS[102];

    return ok({
      visitId: Number.isFinite(visitId) ? visitId : 102,
      placeId: review.placeId,
      placeName: review.placeName,
      visitVerifiedAt: review.visitVerifiedAt,
      rating: review.rating,
      content: review.content,
      imageUrls: review.imageUrls,
      createdAt: '2026-07-19T10:00:00',
      updatedAt: '2026-07-19T10:00:00',
    });
  }),

  // GET /my-places?type=saved|recordId — 저장한 터 / 다녀온 터 목록
  http.get('*/my-places', ({ request }) => {
    const type = new URL(request.url).searchParams.get('type');

    if (type === 'saved') {
      return ok([
        {
          placeId: 1,
          placeName: '경복궁',
          thumbnailUrl: null,
          categories: ['재물', '커리어'],
          savedDate: '2026-06-29',
          element: '토',
        },
        {
          placeId: 2,
          placeName: '청계천',
          thumbnailUrl: null,
          categories: ['연애', '건강'],
          savedDate: '2026-06-28',
          element: '수',
        },
        {
          placeId: 3,
          placeName: '용산 호텔 라운지',
          thumbnailUrl: null,
          categories: ['커리어'],
          savedDate: '2026-06-27',
          element: '화',
        },
      ]);
    }

    if (type === 'recordId') {
      return ok([
        {
          placeId: 25,
          visitId: 101,
          placeName: '남산타워',
          thumbnailUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80',
          categories: ['연애'],
          savedDate: '2026-06-25',
          element: '토',
        },
        {
          placeId: 2,
          visitId: 102,
          placeName: '한강공원',
          thumbnailUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
          categories: ['건강'],
          savedDate: '2026-06-24',
          element: '수',
        },
        {
          placeId: 31,
          visitId: 103,
          placeName: '성수동 카페거리',
          thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
          categories: ['재물', '커리어'],
          savedDate: '2026-06-23',
          element: '화',
        },
        {
          placeId: 13,
          visitId: 104,
          placeName: '북촌 한옥마을',
          thumbnailUrl: null,
          categories: ['건강'],
          savedDate: '2026-06-22',
          element: '목',
        },
      ]);
    }

    return HttpResponse.json(
      { isSuccess: false, code: 'COMMON400', message: 'type이 올바르지 않습니다.' },
      { status: 400 },
    );
  }),
];
