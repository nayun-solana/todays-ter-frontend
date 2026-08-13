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
 * 최후의 안전망. `timeout` 옵션은 명세상 "권한을 얻은 뒤" 측위에 쓸 수 있는 시간이라,
 * 사용자가 권한 창을 닫지도 누르지도 않으면 성공·실패 어느 콜백도 오지 않는다.
 * 그 상태로 두면 소비부가 `isSettled`를 영영 못 받아 스켈레톤에 갇힌다 —
 * 여기서 끊고 "좌표 없음"으로 확정해 화면을 진행시킨다.
 *
 * 이 값이 곧 **권한 창을 방치했을 때 본문이 늦어지는 시간**이다. 거부·측위 실패는
 * `timeout`(5초) 안에 콜백으로 오므로 여기까지 오지 않는다. 즉 마감을 짧게 잡아도
 * 정상 경로는 영향이 없고, 방치한 사용자만 더 빨리 목록을 본다.
 */
const SETTLE_DEADLINE_MS = 3_000;

export type GeolocationState = {
  /** 측위 성공 시 좌표. 미확정·거부·실패는 전부 `null`. */
  coords: Coordinates | null;
  /**
   * 측위 시도가 끝났는지. 성공뿐 아니라 거부·타임아웃·미지원·미사용(`enabled: false`)까지
   * 전부 "끝난 것"으로 본다. 좌표를 queryKey에 싣는 쪽은 이 값이 참이 될 때까지
   * 요청을 미뤄야 한다 — 안 그러면 좌표 없는 요청 1회 + 좌표 있는 요청 1회가 나간다.
   */
  isSettled: boolean;
};

function isSupported() {
  return 'geolocation' in navigator;
}

/**
 * 현재 위치 1회 조회.
 *
 * 거부·미지원·타임아웃을 구분하지 않고 전부 `null`로 돌려준다 — 호출부는 좌표가 있으면
 * 거리를 보여주고 없으면 안 보여주면 되며, 그 외 분기가 필요 없다.
 * 권한 창을 띄우는 부작용이 있으므로 정말 필요한 화면에서만 부를 것.
 */
export function useGeolocation(enabled = true): GeolocationState {
  const shouldLocate = enabled && isSupported();
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  // 시도 자체가 없으면(비활성·미지원) 처음부터 확정이다. 이걸 상태로 들고 있으면
  // 지오로케이션이 없는 브라우저에서 확정 신호가 영영 안 와 요청이 한 번도 안 나간다.
  const isSettled = !shouldLocate || hasAttempted;

  useEffect(() => {
    if (!shouldLocate) return;

    let cancelled = false;
    let deadline = 0;
    const settle = () => {
      if (cancelled) return;
      // 콜백이 먼저 왔으면 마감 타이머는 더 볼 일이 없다.
      window.clearTimeout(deadline);
      setHasAttempted(true);
    };

    deadline = window.setTimeout(settle, SETTLE_DEADLINE_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        settle();
      },
      // 거부·타임아웃 — 좌표 없이 진행한다. 에러를 화면에 드러내지 않는다.
      // 다만 "끝났다"는 사실은 알려야 소비부가 좌표 없이 요청을 낼 수 있다.
      settle,
      GEOLOCATION_OPTIONS,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(deadline);
    };
  }, [shouldLocate]);

  return { coords, isSettled };
}
