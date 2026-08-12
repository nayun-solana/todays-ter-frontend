export type BrowserPermissionKind = 'camera' | 'location';
export type BrowserPermissionResult = 'granted' | 'denied' | 'unavailable';
export type BrowserPermissionState = PermissionState | 'unavailable';

const permissionNameOf: Record<BrowserPermissionKind, string> = {
  camera: 'camera',
  location: 'geolocation',
};

export async function getBrowserPermissionState(
  kind: BrowserPermissionKind,
): Promise<BrowserPermissionState> {
  const permissions = globalThis.navigator?.permissions;
  if (!permissions?.query) return 'unavailable';

  try {
    const status = await permissions.query({
      name: permissionNameOf[kind],
    } as PermissionDescriptor);
    return status.state;
  } catch {
    // 브라우저별로 camera 권한 조회를 지원하지 않는 경우가 있다.
    return 'unavailable';
  }
}

export async function requestBrowserPermission(
  kind: BrowserPermissionKind,
): Promise<BrowserPermissionResult> {
  if (kind === 'camera') {
    const getUserMedia = globalThis.navigator?.mediaDevices?.getUserMedia;
    if (!getUserMedia) return 'unavailable';

    try {
      const stream = await getUserMedia.call(globalThis.navigator.mediaDevices, { video: true });
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch {
      return 'denied';
    }
  }

  const geolocation = globalThis.navigator?.geolocation;
  if (!geolocation) return 'unavailable';

  return new Promise((resolve) => {
    try {
      geolocation.getCurrentPosition(
        () => resolve('granted'),
        () => resolve('denied'),
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 },
      );
    } catch {
      resolve('denied');
    }
  });
}
