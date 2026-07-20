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

/** @see SuccessCode */
export const SuccessCode = {
  OK: 'COMMON200',
  CREATED: 'COMMON201',
  ACCEPTED: 'COMMON202',
  NO_CONTENT: 'COMMON204',
} as const;

export type SuccessCodeValue = (typeof SuccessCode)[keyof typeof SuccessCode];

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

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
