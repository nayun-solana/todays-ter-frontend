import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useGeolocation } from './useGeolocation';

/**
 * 이 훅의 계약은 "좌표를 준다"가 아니라 "언젠가 반드시 끝난다"이다.
 * 소비부가 `isSettled`를 기다렸다가 요청을 내보내므로, 거부·실패·미지원에서 확정 신호가
 * 안 오면 화면이 스켈레톤에 영영 갇힌다. 그 경계만 골라서 검증한다.
 */
const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

function stubGeolocation(value: unknown) {
  Object.defineProperty(navigator, 'geolocation', {
    value,
    configurable: true,
  });
}

afterEach(() => {
  vi.useRealTimers();
  if (originalGeolocation) Object.defineProperty(navigator, 'geolocation', originalGeolocation);
  else Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, 'geolocation');
});

describe('useGeolocation', () => {
  it('측위에 성공하면 좌표와 함께 확정된다', async () => {
    stubGeolocation({
      getCurrentPosition: (onSuccess: PositionCallback) =>
        onSuccess({ coords: { latitude: 37.5, longitude: 127 } } as GeolocationPosition),
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.isSettled).toBe(true));
    expect(result.current.coords).toEqual({ latitude: 37.5, longitude: 127 });
  });

  it('권한을 거부해도 좌표 없이 확정된다', async () => {
    stubGeolocation({
      getCurrentPosition: (_onSuccess: PositionCallback, onError: PositionErrorCallback) =>
        onError({ code: 1, message: 'denied' } as GeolocationPositionError),
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.isSettled).toBe(true));
    expect(result.current.coords).toBeNull();
  });

  it('지오로케이션이 없는 브라우저는 처음부터 확정이다', () => {
    Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, 'geolocation');

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isSettled).toBe(true);
    expect(result.current.coords).toBeNull();
  });

  it('훅을 끈 상태(enabled: false)는 측위를 시도하지 않고 바로 확정이다', () => {
    const getCurrentPosition = vi.fn();
    stubGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useGeolocation(false));

    expect(result.current.isSettled).toBe(true);
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('권한 창을 방치해 콜백이 아예 안 와도 마감 시간이 지나면 확정된다', async () => {
    vi.useFakeTimers();
    // 어떤 콜백도 부르지 않는 브라우저 — 권한 창을 열어둔 채 방치한 상황이다.
    // `timeout` 옵션은 권한을 얻은 뒤부터 재는 값이라 이때는 도움이 안 된다.
    stubGeolocation({ getCurrentPosition: () => undefined });

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.isSettled).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });

    expect(result.current.isSettled).toBe(true);
    expect(result.current.coords).toBeNull();
  });
});
