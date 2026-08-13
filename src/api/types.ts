/**
 * 백엔드 공통 응답
 * @see todays-ter-backend ApiResponse
 * JSON 순서: isSuccess, code, message, result
 * result가 null이면 응답 JSON에서 필드 생략
 */
export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T;
};

/** 인터셉터에서 정규화한 클라이언트 에러 */
export type ApiError = {
  status: number;
  code: string;
  message: string;
  /** VALIDATION_ERROR 등에서 필드별 메시지 Map이 올 수 있음 */
  result?: unknown;
};

/**
 * 에러의 HTTP status를 꺼낸다. 못 꺼내면 undefined.
 *
 * 인터셉터가 거절값을 ApiError 평범한 객체로 정규화하므로(Error 인스턴스가 아니다)
 * instanceof가 아니라 shape로 본다 — onboardingRequired.ts와 같은 방식이다.
 * 404·400처럼 "다시 시도해도 결과가 같은" 실패를 갈라낼 때 쓴다.
 */
export function apiErrorStatusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const { status } = error as Partial<ApiError>;
  return typeof status === 'number' ? status : undefined;
}

/** @see ErrorCode */
export const ErrorCode = {
  INVALID_REQUEST: 'COMMON400',
  VALIDATION_ERROR: 'COMMON400_1',
  UNAUTHORIZED: 'COMMON401',
  FORBIDDEN: 'COMMON403',
  NOT_FOUND: 'COMMON404',
  CONFLICT: 'COMMON409',
  DUPLICATE_RESOURCE: 'COMMON409_1',
  INTERNAL_SERVER_ERROR: 'COMMON500',
} as const;
