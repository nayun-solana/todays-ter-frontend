import type { ApiError } from './types';

/**
 * "사주 리포트가 아직 없다"는 뜻의 BE 에러 코드들.
 *
 * 홈 4개 중 header를 뺀 3개는 리포트를 전제로 한다. 온보딩을 안 끝낸 사용자에게
 * 서버는 404 + 아래 코드를 주는데, 이건 **장애가 아니라 정상 응답**이다.
 * 실측(2026-08-06, 게스트 세션):
 *   - /home/today-energy, /home/energy-routines → 404 FORTUNE404_1
 *   - /home/recommended-place                   → 404 HOME404_2
 * 리포트를 만들고 다시 부르면 셋 다 200이 된다.
 */
const ONBOARDING_REQUIRED_CODES = new Set(['FORTUNE404_1', 'HOME404_2']);

/**
 * 이 에러가 "온보딩이 필요하다"는 신호인지 판정.
 *
 * 다시 시도해봐야 영영 404다. 실패 UI("다시 시도")로 보여주면 사용자가 빠져나갈 길이
 * 없으므로, 호출부는 이걸 보고 온보딩 유도로 갈라야 한다.
 * 인터셉터가 거절값을 ApiError 평범한 객체로 정규화하므로(Error 인스턴스가 아니다)
 * instanceof가 아니라 shape로 본다.
 */
export function isOnboardingRequired(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { status, code } = error as Partial<ApiError>;
  return status === 404 && typeof code === 'string' && ONBOARDING_REQUIRED_CODES.has(code);
}
