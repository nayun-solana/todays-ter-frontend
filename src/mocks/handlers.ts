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
];
