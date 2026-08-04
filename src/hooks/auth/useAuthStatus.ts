import { useAuthStore } from '../../stores/authStore';

/**
 * 회원/게스트 판정. 토큰 스토어를 구독하므로 로그인·로그아웃·세션만료 시 화면이 다시 그려진다.
 * (localStorage를 직접 읽으면 값이 바뀌어도 리렌더가 안 된다.)
 */
export function useAuthStatus(): { isMember: boolean } {
  const accessToken = useAuthStore((state) => state.accessToken);

  return { isMember: accessToken !== null };
}
