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
];
