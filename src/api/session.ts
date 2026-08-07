import { queryClient } from '../app/queryClient';
import { useAuthStore } from '../stores/authStore';
import { reissueOnce } from './reissue';

/**
 * 부팅 시 세션 복원.
 *
 * accessToken은 localStorage에, refresh 토큰은 HttpOnly 쿠키(14일)에 있다. 둘의 수명이 다르다:
 * **Safari ITP는 스크립트가 쓴 localStorage를 7일 미사용 시 삭제**한다. 그러면 서버 세션은
 * 멀쩡한데 FE만 "토큰 없음 = 게스트"로 보고 재발급을 시도조차 하지 않아 로그아웃된 것처럼 보인다.
 *
 * 그래서 토큰이 없어도 refresh 쿠키로 한 번은 재발급을 시도한다.
 * 쿠키가 없는 진짜 게스트는 401이 떨어지고, 조용히 게스트로 남는다(에러를 드러내지 않는다).
 *
 * 복원을 기다리느라 화면 전체를 잡아두지는 않는다(서버가 죽으면 모든 방문자가 빈 화면을 본다).
 * 대신 회원 판정이 필요한 곳 — 라우트 가드 — 만 기다리고, 복원에 성공하면 그 사이에 게스트로
 * 나가서 받아온 응답을 캐시에서 버린다.
 */
export async function restoreSession(): Promise<void> {
  const { accessToken, finishSessionRestore } = useAuthStore.getState();

  // 토큰이 이미 있으면 복원할 게 없다. 만료됐다면 첫 401에서 인터셉터가 재발급한다.
  if (accessToken !== null) return;

  try {
    await reissueOnce();
    // 게스트로 받아온 응답이 회원 화면에 눌러붙지 않게 비운다(staleTime 30s라 그냥 두면 남는다).
    queryClient.clear();
  } catch {
    // 게스트이거나 refresh가 만료된 것 — 정상 경로다.
  } finally {
    finishSessionRestore();
  }
}
