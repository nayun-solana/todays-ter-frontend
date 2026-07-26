import { http, HttpResponse } from 'msw';

/**
 * MSW mock 핸들러 — BE 미배포 엔드포인트 선개발용. dev 전용(main.tsx에서 dev만 로드).
 * ⚠️ 응답 계약은 추측(화면·명세서 경로 기준). BE 배포(Swagger) 시 실제 스키마로 교체하고 해당 핸들러 제거.
 */

/** ApiResponse<T> 봉투로 감싸기 (BE 공통 응답 형식) */
function ok<T>(result: T) {
  return HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: '성공', result });
}

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
    ok({
      dateLabel: '2026년 6월 11일 목요일',
      userName: '윤진',
      message: '오늘도 좋은 기운 충전해요',
    }),
  ),

  // GET /home/energy-routines — 오늘 에너지 루틴
  http.get('/home/energy-routines', () =>
    ok({
      title: '토기 에너지 루틴',
      routines: ['10분 명상하기', '계획 정리하기', '맨발로 땅 밟기'],
    }),
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

  // GET /saju-reports/:reportid/summary - 사주 리포트 조회
  http.get('/saju-reports/:reportid/summary', () =>
    ok({
      reportId: 'report_12345',
      reportType: 'BASIC',
      headline: '깊게 느끼고 천천히 움직이는',
      sajuTypeName: '수목형',
      elementAnalysis: {
        summary: '당신은 수와 목의 조합이 강하고, 화가 부족한 편이에요.',
        primaryElements: ['WATER', 'WOOD'],
        complementaryElement: 'FIRE',
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
      reportId: 'report_12345',
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
];
