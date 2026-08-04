import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'accessToken';

function getStoredAccessToken() {
  return typeof localStorage?.getItem === 'function' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

function persistAccessToken(token: string) {
  if (typeof localStorage?.setItem === 'function') localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function removeStoredAccessToken() {
  if (typeof localStorage?.removeItem === 'function') localStorage.removeItem(ACCESS_TOKEN_KEY);
}

type AuthState = {
  /** 회원 accessToken. null이면 비회원(게스트) 또는 로그아웃 상태. */
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
};

/**
 * 회원 인증 상태.
 * localStorage는 값이 바뀌어도 리렌더를 유발하지 않아 화면 분기에 쓸 수 없다.
 * 스토어를 단일 소스로 두고 localStorage에는 새로고침 복원용으로만 미러링한다.
 * (refresh 토큰은 BE가 HttpOnly 쿠키로만 내려주므로 FE가 보관하지 않는다.)
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStoredAccessToken(),

  setAccessToken: (token) => {
    persistAccessToken(token);
    set({ accessToken: token });
  },

  clearAccessToken: () => {
    removeStoredAccessToken();
    set({ accessToken: null });
  },
}));
