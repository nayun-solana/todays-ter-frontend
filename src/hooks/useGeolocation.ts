import { useEffect, useState } from 'react';

export type Coordinates = { latitude: number; longitude: number };

/** 좌표 없이도 화면은 그대로 동작해야 하므로, 실패는 전부 `null`로 흡수한다. */
const GEOLOCATION_OPTIONS: PositionOptions = {
  // 거리 표시는 "몇 km"까지만 쓴다. 고정밀은 GPS를 깨워 느리고 배터리만 먹는다.
  enableHighAccuracy: false,
  // 이 값이 없으면 브라우저 기본값은 무한이다 — 사용자가 권한 창을 무시하면 영영 안 온다.
  timeout: 5_000,
  // 5분 안에 받아둔 좌표가 있으면 그대로 쓴다. 화면을 오갈 때마다 다시 측위하지 않는다.
  maximumAge: 300_000,
};

/**
 * 현재 위치 1회 조회.
 *
 * 거부·미지원·타임아웃을 구분하지 않고 전부 `null`로 돌려준다 — 호출부는 좌표가 있으면
 * 거리를 보여주고 없으면 안 보여주면 되며, 그 외 분기가 필요 없다.
 * 권한 창을 띄우는 부작용이 있으므로 정말 필요한 화면에서만 부를 것.
 */
export function useGeolocation(enabled = true): Coordinates | null {
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!enabled || !('geolocation' in navigator)) return;

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      // 거부·타임아웃 — 좌표 없이 진행한다. 에러를 화면에 드러내지 않는다.
      () => undefined,
      GEOLOCATION_OPTIONS,
    );

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return coords;
}
