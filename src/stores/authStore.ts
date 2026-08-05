import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'accessToken';

function getStoredAccessToken() {
  return typeof localStorage?.getItem === 'function'
    ? localStorage.getItem(ACCESS_TOKEN_KEY)
    : null;
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
  /**
   * 부팅 시 refresh 쿠키로 세션을 복원하는 중인지.
   * 토큰이 이미 있으면 복원할 게 없으므로 처음부터 false다.
   */
  isRestoringSession: boolean;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  finishSessionRestore: () => void;
};

/**
 * 회원 인증 상태.
 * localStorage는 값이 바뀌어도 리렌더를 유발하지 않아 화면 분기에 쓸 수 없다.
 * 스토어를 단일 소스로 두고 localStorage에는 새로고침 복원용으로만 미러링한다.
 * (refresh 토큰은 BE가 HttpOnly 쿠키로만 내려주므로 FE가 보관하지 않는다.)
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStoredAccessToken(),
  isRestoringSession: getStoredAccessToken() === null,

  setAccessToken: (token) => {
    persistAccessToken(token);
    set({ accessToken: token });
  },

  clearAccessToken: () => {
    removeStoredAccessToken();
    set({ accessToken: null });
  },

  finishSessionRestore: () => set({ isRestoringSession: false }),
}));

/**
 * 탭 간 로그인 상태 동기화.
 * storage 이벤트는 **다른 탭**에서 localStorage가 바뀔 때만 온다. 이걸 구독하지 않으면
 * 한 탭에서 로그아웃해도 다른 탭은 메모리에 남은 토큰으로 회원 화면을 계속 보여준다.
 * 여기서는 이미 저장된 값을 스토어에 반영만 하므로 localStorage에 되쓰지 않는다.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.storageArea && event.storageArea !== localStorage) return;
    // key가 null이면 localStorage.clear() — 토큰도 함께 날아간 것으로 본다.
    if (event.key !== null && event.key !== ACCESS_TOKEN_KEY) return;

    useAuthStore.setState({ accessToken: event.newValue, isRestoringSession: false });
  });
}
