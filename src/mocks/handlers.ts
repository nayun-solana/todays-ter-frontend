import { http, HttpResponse, passthrough } from 'msw';

/**
 * MSW mock 핸들러 — BE 미배포 엔드포인트 선개발용. dev 전용(main.tsx에서 dev만 로드).
 * ⚠️ 응답 계약은 추측(화면·명세서 경로 기준). BE 배포(Swagger) 시 실제 스키마로 교체하고 해당 핸들러 제거.
 */

/** ApiResponse<T> 봉투로 감싸기 (BE 공통 응답 형식) */
function ok<T>(result: T) {
  return HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: '성공', result });
}

// ⚠️ 인증(/auth/**)은 절대 목으로 가리지 말 것.
// 목이 발급한 가짜 토큰은 실서버에서 무효 JWT로 취급돼 게스트로 폴백되고,
// 그러면 로그인했는데 게스트 데이터가 보이는 것처럼 착각하게 된다.

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

let notificationSettings = {
  isPushEnabled: true,
  isMarketingEnabled: false,
  isNightMarketingEnabled: false,
};

let permissionSettings = {
  isCameraAllowed: true,
  isPhotoLibraryAllowed: false,
  isLocationAllowed: false,
};

export const handlers = [
  // ── 추천 상세·공유: BE 배포 완료 → 항상 실 API로 통과 ──
  // 아래쪽 `*/places/:placeId` 목이 와일드카드라 `/recommendations/places/1`까지 잡아먹는다.
  // MSW는 먼저 등록된 핸들러가 이기므로, 여기서 명시적으로 passthrough 시킨다.
  http.get('/recommendations/places/shared/:shareToken', () => passthrough()),
  http.get('/recommendations/places/:placeId', () => passthrough()),
  http.post('/recommendations/places/:placeId/share', () => passthrough()),

  // 홈(/home/**)은 BE 배포 완료(2026-08-06) → 목 제거, 실 API로 통과시킨다.

  // 추천 상세·공유(/recommendations/places/**)는 BE 배포 완료 → 목 제거, 실 API로 통과시킨다.

  // 사주 리포트(/fortune-reports/**)는 BE 배포 완료 → 목 제거, 실 API로 통과시킨다.
  // 예전 목은 존재하지 않는 경로(/saju-reports/*)를 추측 스키마로 흉내내고 있었다.

  // ── 기록/후기(/records/**): BE 배포 → 실 API ──
  // ⚠️ `*/records/:id` 쓰면 S3 객체 URL
  // (https://…amazonaws.com/records/uuid.png)까지 매칭된다.
  // SW passthrough가 cross-origin 이미지 GET을 깨뜨려 403이 난다.
  // API는 Vite 프록시 same-origin(`/records/:id`)만 통과시킨다.
  http.get('/records/:id', () => passthrough()),
  http.patch('/records/:id', () => passthrough()),
  http.delete('/records/:id', () => passthrough()),
  http.post('/records/images', () => passthrough()),
  http.post('/records', () => passthrough()),

  // ── 장소 목록·필터·에디터픽: BE 배포 완료 → 항상 실 API로 통과 ──
  // 실측(2026-08-10): 익명·게스트·회원 모두 200이고, 응답이 src/types/search/search.ts의
  // zod 스키마를 그대로 통과한다. 목을 남겨두면 로컬만 목 데이터를 보게 되어
  // **스키마 불일치가 로컬에서 영영 안 드러난다**(Vercel rewrite 누락 건과 같은 함정).
  //
  http.get('*/places/explore-filters', () => passthrough()),
  http.get('*/places/editor-picks', () => passthrough()),
  // GET /places/me — 저장/다녀온 터 목록 API 연동완료
  http.get('*/places/me', () => passthrough()),
  // 목록 thumbnailUrl: "/places/{id}/thumbnail" — 장소 상세 목보다 먼저 통과
  http.get('/places/:placeId/thumbnail', () => passthrough()),
  // 스토리 공유 카드 — GET /places/{placeId}/share-cards
  http.get('/places/:placeId/share-cards', () => passthrough()),
  http.get('*/places', () => passthrough()),

  // GET /places/:placeId — 장소 상세 기본 정보
  // 실 API는 게스트에게 401이라 아직 목을 남긴다. BE develop의 SecurityConfig에는
  // `/places/*` permitAll이 있지만 배포본은 401이다(실측 2026-08-10, 이슈 #134).
  // 게스트에게 200이 확인되면 이 목도 passthrough로 바꿀 것.
  //
  // `*/places/:placeId` 와일드카드가 CDN 썸네일 URL(`/places/thumbnail` 등)까지
  // 가로채서 404 JSON을 내려주는 문제가 있다. 숫자 id만 목으로 두고 나머지는 실요청 통과.
  http.get('*/places/:placeId', ({ params }) => {
    const placeId = String(params.placeId);
    if (!/^\d+$/.test(placeId)) {
      return passthrough();
    }

    const place = SEARCH_PLACES.find((item) => String(item.placeId) === placeId);

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
      reportId: 83721,
      nickname: '계수',
      profileImageUrl: PLACE_SAMPLE_IMAGE_URL,
    }),
  ),

  // GET /mypage/social-connections — 소셜 계정 연동 상태
  http.get('*/mypage/social-connections', () =>
    ok({
      policyUrl: 'https://example.com/policies/account-linkage',
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

  http.get('*/mypage/notification-settings', () => ok(notificationSettings)),
  http.patch('*/mypage/notification-settings', async ({ request }) => {
    notificationSettings = (await request.json()) as typeof notificationSettings;
    return ok({ updatedAt: '2026-08-04T22:00:00' });
  }),

  http.get('*/mypage/permissions', () => ok(permissionSettings)),
  http.patch('*/mypage/permissions', async ({ request }) => {
    permissionSettings = (await request.json()) as typeof permissionSettings;
    return ok({ updatedAt: '2026-08-04T22:00:00' });
  }),

  http.get('*/mypage/policies', () =>
    ok({
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
    }),
  ),
];
