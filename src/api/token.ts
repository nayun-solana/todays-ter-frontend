import { useAuthStore } from '../stores/authStore';

// 토큰 접근은 authStore 단일 소스를 경유한다(React 밖 — 인터셉터 등 — 에서 쓰기 위한 얇은 래퍼).
// 컴포넌트에서는 useAuthStatus를 쓸 것. 아래 함수들은 구독이 아니라 스냅샷이라 리렌더를 유발하지 않는다.

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string): void {
  useAuthStore.getState().setAccessToken(token);
}

export function clearAccessToken(): void {
  useAuthStore.getState().clearAccessToken();
}
