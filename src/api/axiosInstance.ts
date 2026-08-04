import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { reissueToken } from './reissue';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';
import { ErrorCode, type ApiError, type ApiResponse } from './types';

/** 재발급을 시도하면 안 되는 경로 — 재발급 자체이거나, 토큰을 처음 받는 요청. */
const NO_REISSUE_PATHS = ['/auth/reissue', '/auth/kakao/login', '/auth/dev/token'];

/** 재시도 1회 제한 플래그를 실어 나르는 요청 설정. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  // 게스트 세션 쿠키(guest_id) 전송용. dev는 Vite 프록시로 same-origin 처리(vite.config.ts).
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 요청 인터셉터 — Swagger bearerAuth와 동일하게 Bearer JWT 주입 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data;

  return {
    status,
    code: body?.code ?? (status === 0 ? 'NETWORK_ERROR' : ErrorCode.INTERNAL_SERVER_ERROR),
    message: body?.message ?? error.message ?? '요청에 실패했습니다.',
    result: body?.result,
  };
}

/**
 * 진행 중인 재발급 요청.
 * BE의 refresh 토큰은 회전식이라 동시에 두 번 재발급하면 뒤엣것이 무효 토큰으로 깨진다.
 * 401이 여러 개 겹쳐도 재발급은 딱 한 번만 나가도록 프라미스를 공유한다(single-flight).
 */
let reissuePromise: Promise<string> | null = null;

function reissueOnce(): Promise<string> {
  reissuePromise ??= reissueToken()
    .then(({ accessToken }) => {
      setAccessToken(accessToken);
      return accessToken;
    })
    .finally(() => {
      reissuePromise = null;
    });

  return reissuePromise;
}

/**
 * 응답 인터셉터
 * - 성공: AxiosResponse 그대로 반환 (본문은 ApiResponse<T>)
 * - 실패: ExceptionAdvice가 내려준 ApiResponse를 ApiError로 정규화
 * - 401: 회원이면 토큰 재발급 후 원 요청을 1회 재시도. 재발급도 실패하면 토큰을 비운다
 *   (라우트 가드가 토큰 소실을 보고 /login으로 보낸다 — 인터셉터가 직접 이동시키지 않는다).
 *   토큰이 없는 게스트의 401은 손대지 않고 그대로 흘려보낸다.
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const apiError = toApiError(error);
    const config = error.config as RetriableConfig | undefined;
    const isUnauthorized = apiError.status === 401 || apiError.code === ErrorCode.UNAUTHORIZED;

    if (!isUnauthorized || !config) {
      return Promise.reject(apiError);
    }

    const url = config.url ?? '';
    const canReissue =
      getAccessToken() !== null &&
      !config._retry &&
      !NO_REISSUE_PATHS.some((path) => url.includes(path));

    if (!canReissue) {
      // 재시도까지 했는데 또 401이면 세션이 끝난 것. 게스트(토큰 없음)는 그대로 둔다.
      if (getAccessToken() !== null) {
        clearAccessToken();
      }
      return Promise.reject(apiError);
    }

    try {
      const accessToken = await reissueOnce();

      config._retry = true;
      config.headers.Authorization = `Bearer ${accessToken}`;

      return await axiosInstance.request(config);
    } catch {
      // refresh 만료·회전 불일치 등 — 세션 종료
      clearAccessToken();
      return Promise.reject(apiError);
    }
  },
);

export default axiosInstance;
