import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./reissue', () => ({ reissueOnce: vi.fn() }));

import axiosInstance from './axiosInstance';
import { reissueOnce } from './reissue';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';

/**
 * 응답 인터셉터의 401 처리 테스트.
 *
 * 여기를 테스트로 덮는 이유: "재발급이 실패했을 때 세션을 끝낼 것인가"는 사용자에게
 * 강제 로그아웃으로 드러나는데, 실서버에 refresh 만료나 네트워크 단절을 임의로 만들 수 없어
 * 브라우저로는 일부 갈래를 재현할 수 없다.
 */

const mockedReissueOnce = vi.mocked(reissueOnce);

/** 호출 순서대로 상태를 돌려주는 가짜 어댑터. 2xx면 resolve, 아니면 AxiosError로 reject. */
function adapterReturning(...statuses: number[]) {
  const adapter: AxiosAdapter = vi.fn((config: InternalAxiosRequestConfig) => {
    const status = statuses.shift() ?? 500;
    const response = {
      data: { isSuccess: status < 300, code: 'X', message: 'm', result: { ok: status } },
      status,
      statusText: '',
      headers: {},
      config,
    } as AxiosResponse;

    if (status >= 200 && status < 300) return Promise.resolve(response);
    return Promise.reject(new AxiosError('failed', String(status), config, {}, response));
  });

  axiosInstance.defaults.adapter = adapter;
  return adapter;
}

/** 서버 응답이 아예 없는 실패 — 타임아웃·오프라인·연결 거부가 이 모양이다. */
function networkError() {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK, undefined, {});
}

/** 서버가 재발급을 거부한 실패 — 세션이 실제로 끝난 경우. */
function httpError(status: number) {
  const response = { data: {}, status, statusText: '', headers: {}, config: {} } as AxiosResponse;
  return new AxiosError('rejected', String(status), undefined, {}, response);
}

beforeEach(() => {
  vi.clearAllMocks();
  clearAccessToken();
});

describe('401 응답 처리', () => {
  it('재발급에 성공하면 원 요청을 1회 재시도하고 세션을 유지한다', async () => {
    setAccessToken('old-token');
    mockedReissueOnce.mockImplementation(async () => {
      setAccessToken('new-token');
      return 'new-token';
    });
    const adapter = adapterReturning(401, 200);

    const res = await axiosInstance.get('/home/header');

    expect(res.status).toBe(200);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBe('new-token');
  });

  it('재발급이 네트워크 실패면 세션을 유지한다 (지하철에서 신호가 끊겨도 로그아웃되지 않는다)', async () => {
    setAccessToken('old-token');
    mockedReissueOnce.mockRejectedValue(networkError());
    adapterReturning(401);

    await expect(axiosInstance.get('/home/header')).rejects.toMatchObject({ status: 401 });

    expect(getAccessToken()).toBe('old-token');
  });

  it('재발급이 5xx여도 세션을 유지한다 (서버 장애는 세션 만료가 아니다)', async () => {
    setAccessToken('old-token');
    mockedReissueOnce.mockRejectedValue(httpError(503));
    adapterReturning(401);

    await expect(axiosInstance.get('/home/header')).rejects.toMatchObject({ status: 401 });

    expect(getAccessToken()).toBe('old-token');
  });

  it.each([401, 403])('재발급이 %i면 세션을 끝낸다 (refresh 만료·회전 불일치)', async (status) => {
    setAccessToken('old-token');
    mockedReissueOnce.mockRejectedValue(httpError(status));
    adapterReturning(401);

    await expect(axiosInstance.get('/home/header')).rejects.toMatchObject({ status: 401 });

    expect(getAccessToken()).toBeNull();
  });

  it('재발급 후 재시도했는데 또 401이면 세션을 끝낸다', async () => {
    setAccessToken('old-token');
    mockedReissueOnce.mockResolvedValue('new-token');
    const adapter = adapterReturning(401, 401);

    await expect(axiosInstance.get('/home/header')).rejects.toMatchObject({ status: 401 });

    // 재발급은 한 번만 — 401이 반복돼도 무한루프에 빠지지 않는다
    expect(mockedReissueOnce).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBeNull();
  });

  it('재시도가 다른 이유로 실패하면 그 실패를 그대로 전한다 (401로 뭉뚱그리지 않는다)', async () => {
    setAccessToken('old-token');
    mockedReissueOnce.mockResolvedValue('new-token');
    adapterReturning(401, 500);

    // 재시도의 500이 "재발급 실패"로 처리되면 호출자는 원래의 401을 받게 된다
    await expect(axiosInstance.get('/home/header')).rejects.toMatchObject({ status: 500 });

    expect(getAccessToken()).toBe('old-token');
  });

  it('토큰이 없는 게스트의 401은 건드리지 않는다', async () => {
    adapterReturning(401);

    await expect(axiosInstance.get('/api/onboarding')).rejects.toMatchObject({ status: 401 });

    expect(mockedReissueOnce).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it('재발급 경로 자체의 401로 다시 재발급하지 않는다', async () => {
    setAccessToken('old-token');
    adapterReturning(401);

    await expect(axiosInstance.post('/auth/reissue')).rejects.toMatchObject({ status: 401 });

    expect(mockedReissueOnce).not.toHaveBeenCalled();
  });

  // 로그인 실패는 "가지고 있던 세션이 끝났다"는 뜻이 아니다.
  // 카카오 로그인을 디버깅하다 실패 한 번에 멀쩡하던 세션이 날아간 적이 있다.
  it('카카오 로그인이 401이어도 기존 세션을 유지한다', async () => {
    setAccessToken('valid-token');
    adapterReturning(401);

    await expect(axiosInstance.post('/auth/kakao/login')).rejects.toMatchObject({ status: 401 });

    expect(mockedReissueOnce).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('valid-token');
  });

  it('dev 토큰 발급이 401이어도 기존 세션을 유지한다', async () => {
    setAccessToken('valid-token');
    adapterReturning(401);

    await expect(axiosInstance.post('/auth/dev/token')).rejects.toMatchObject({ status: 401 });

    expect(getAccessToken()).toBe('valid-token');
  });
});
