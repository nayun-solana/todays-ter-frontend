import { useAuthStore } from '../../stores/authStore';

/**
 * 회원/게스트 판정. 토큰 스토어를 구독하므로 로그인·로그아웃·세션만료 시 화면이 다시 그려진다.
 * (localStorage를 직접 읽으면 값이 바뀌어도 리렌더가 안 된다.)
 *
 * `isPending`은 부팅 복원(api/session.ts)이 아직 안 끝났다는 뜻 — 이때의 `isMember: false`는
 * "게스트"가 아니라 "아직 모름"이다. 회원/게스트로 갈리는 동작(리다이렉트 등)은 이 값을 봐야 한다.
 */
export function useAuthStatus(): { isMember: boolean; isPending: boolean } {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);

  return { isMember: accessToken !== null, isPending: isRestoringSession };
}
