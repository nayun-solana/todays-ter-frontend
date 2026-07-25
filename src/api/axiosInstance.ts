import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { clearAccessToken, getAccessToken } from './token';
import { ErrorCode, type ApiError, type ApiResponse } from './types';

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
 * 응답 인터셉터
 * - 성공: AxiosResponse 그대로 반환 (본문은 ApiResponse<T>)
 * - 실패: ExceptionAdvice가 내려준 ApiResponse를 ApiError로 정규화
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const apiError = toApiError(error);

    // COMMON401 / HTTP 401 — 토큰 무효. 로그인 리다이렉트는 이후 연동
    if (apiError.status === 401 || apiError.code === ErrorCode.UNAUTHORIZED) {
      clearAccessToken();
    }

    return Promise.reject(apiError);
  },
);

export default axiosInstance;
