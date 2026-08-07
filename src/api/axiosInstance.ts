import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { reissueOnce } from './reissue';
import { clearAccessToken, getAccessToken } from './token';
import { ErrorCode, type ApiError, type ApiResponse } from './types';

/** 재발급을 시도하면 안 되는 경로 — 재발급 자체이거나, 토큰을 처음 받는 요청. */
const NO_REISSUE_PATHS = ['/auth/reissue', '/auth/kakao/login', '/auth/dev/token'];

/** 재시도 1회 제한 플래그를 실어 나르는 요청 설정. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const axiosInstance = axios.create({
  // baseURL 없음 = 항상 상대경로. dev는 Vite 프록시(vite.config.ts), prod는 Vercel rewrite(vercel.json)가
  // 같은 오리진에서 BE로 넘긴다. 게스트 쿠키가 SameSite=Lax라 cross-site로 직접 부르면 쿠키가 안 실린다.
  timeout: 10_000,
  // 게스트 세션 쿠키(guest_id) 전송용.
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
 * 응답 인터셉터
 * - 성공: AxiosResponse 그대로 반환 (본문은 ApiResponse<T>)
 * - 실패: ExceptionAdvice가 내려준 ApiResponse를 ApiError로 정규화
 * - 401: 회원이면 토큰 재발급 후 원 요청을 1회 재시도. 재발급이 401/403이면 토큰을 비운다
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

    // try는 재발급만 감싼다. 재시도까지 넣으면 재시도의 실패(예: 500)가 "재발급 실패"로 처리돼
    // 호출자에게 원래의 401이 대신 전달된다.
    try {
      await reissueOnce();
    } catch (reissueError) {
      // 세션이 실제로 끝난 것은 재발급이 401/403일 때뿐이다.
      // 타임아웃·오프라인·5xx까지 로그아웃으로 처리하면 신호가 잠깐 끊긴 것만으로 세션이 날아간다.
      // (reissueClient는 인터셉터가 없어 AxiosError 원형이 그대로 온다.)
      const reissueStatus = (reissueError as AxiosError | undefined)?.response?.status;

      if (reissueStatus === 401 || reissueStatus === 403) {
        clearAccessToken();
      }

      return Promise.reject(apiError);
    }

    // 헤더는 요청 인터셉터가 새 토큰으로 다시 넣는다(여기서 손대지 않는다).
    config._retry = true;

    return axiosInstance.request(config);
  },
);

export default axiosInstance;
