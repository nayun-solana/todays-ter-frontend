import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * localStorage가 없는 환경(테스트 러너 등)을 위한 가드.
 * `typeof localStorage?.getItem`으로는 막을 수 없다 — 옵셔널 체이닝은 `localStorage`를 먼저
 * 평가하므로 식별자 자체가 선언돼 있지 않으면 ReferenceError가 난다. `typeof`를 식별자에 직접 써야 한다.
 */
function getStorage(): Storage | null {
  // 존재만 봐서는 부족하다 — Node 25는 `--localstorage-file` 없이도 전역 localStorage를
  // 노출하는데 메서드가 없어서, 있는 줄 알고 부르면 테스트가 통째로 죽는다(실측).
  return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
    ? localStorage
    : null;
}

function getStoredAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

function persistAccessToken(token: string) {
  getStorage()?.setItem(ACCESS_TOKEN_KEY, token);
}

function removeStoredAccessToken() {
  getStorage()?.removeItem(ACCESS_TOKEN_KEY);
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
