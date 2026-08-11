import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBrowserPermissionState, requestBrowserPermission } from './browserPermissions';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestBrowserPermission', () => {
  it('카메라 권한이 허용되면 미디어 스트림을 정리하고 granted를 반환한다', async () => {
    const stop = vi.fn();
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] });
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    await expect(requestBrowserPermission('camera')).resolves.toBe('granted');

    expect(getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(stop).toHaveBeenCalledOnce();
  });

  it('카메라 API가 없는 환경에서는 unavailable을 반환한다', async () => {
    vi.stubGlobal('navigator', {});

    await expect(requestBrowserPermission('camera')).resolves.toBe('unavailable');
  });

  it('위치 권한이 허용되면 granted를 반환한다', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({} as GeolocationPosition);
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    await expect(requestBrowserPermission('location')).resolves.toBe('granted');

    expect(getCurrentPosition).toHaveBeenCalledOnce();
  });

  it('위치 권한 요청이 거부되면 denied를 반환한다', async () => {
    const getCurrentPosition = vi.fn(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, message: 'denied' } as GeolocationPositionError);
      },
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    await expect(requestBrowserPermission('location')).resolves.toBe('denied');
  });
});

describe('getBrowserPermissionState', () => {
  it('브라우저가 카메라 권한 상태를 제공하면 그 상태를 반환한다', async () => {
    const query = vi.fn().mockResolvedValue({ state: 'granted' });
    vi.stubGlobal('navigator', { permissions: { query } });

    await expect(getBrowserPermissionState('camera')).resolves.toBe('granted');
    expect(query).toHaveBeenCalledWith({ name: 'camera' });
  });

  it('브라우저 권한 API가 없으면 unavailable을 반환한다', async () => {
    vi.stubGlobal('navigator', {});

    await expect(getBrowserPermissionState('location')).resolves.toBe('unavailable');
  });

  it('권한 상태 조회가 지원되지 않으면 unavailable을 반환한다', async () => {
    const query = vi.fn().mockRejectedValue(new Error('unsupported permission name'));
    vi.stubGlobal('navigator', { permissions: { query } });

    await expect(getBrowserPermissionState('camera')).resolves.toBe('unavailable');
  });
});
