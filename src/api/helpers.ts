import type { AxiosResponse } from 'axios';

import type { ApiResponse } from './types';

/** Axios 응답에서 ApiResponse.result만 꺼냄 */
export function getResult<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.result as T;
}
