import { withObjectParticle } from './korean';

/**
 * 조회 상태 문구.
 *
 * 같은 문장이 20군데 넘게 각자 적혀 있어서 화면마다 조금씩 달랐다 — 어떤 곳은
 * "잠시 후 다시 시도해주세요"가 붙고 어떤 곳은 안 붙는 식이었다. 여기서 한 번만 정한다.
 *
 * 홈은 해요체(`SectionError`에 직접 문구를 넘긴다)라 이 함수들을 쓰지 않는다 —
 * 톤이 다른 건 의도된 것이므로 억지로 합치지 않았다.
 */

/** "장소를 불러오는 중입니다." */
export function loadingMessage(noun: string): string {
  return `${withObjectParticle(noun)} 불러오는 중입니다.`;
}

/** "장소를 더 불러오는 중입니다." — 무한스크롤 다음 페이지 */
export function loadingMoreMessage(noun: string): string {
  return `${withObjectParticle(noun)} 더 불러오는 중입니다.`;
}

/** "장소를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." */
export function loadFailureMessage(noun: string): string {
  return `${loadFailureMessageBrief(noun)} 잠시 후 다시 시도해주세요.`;
}

/**
 * "장소를 불러오지 못했습니다." — 재시도 안내 없는 짧은 형태.
 *
 * 화면마다 재시도 문장이 붙기도 하고 안 붙기도 한다. 어느 쪽이 맞는지는 카피 결정이라
 * 여기서 통일하지 않고 각 화면이 쓰던 형태를 그대로 유지한다.
 */
export function loadFailureMessageBrief(noun: string): string {
  return `${withObjectParticle(noun)} 불러오지 못했습니다.`;
}
