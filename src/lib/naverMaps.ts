type NaverMaps = {
  maps: {
    LatLng: new (latitude: number, longitude: number) => unknown;
    Map: new (
      element: HTMLElement,
      options: { center: unknown; zoom: number; zoomControl: boolean },
    ) => unknown;
    Marker: new (options: { map: unknown; position: unknown }) => unknown;
  };
};

declare global {
  interface Window {
    naver?: NaverMaps;
  }
}

let mapsPromise: Promise<NaverMaps> | undefined;

export function getNaverMapsScriptUrl(clientId: string): string {
  return `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
}

export function loadNaverMaps(clientId: string): Promise<NaverMaps> {
  if (window.naver?.maps) return Promise.resolve(window.naver);
  if (!clientId) return Promise.reject(new Error('네이버 지도 Client ID가 없습니다.'));

  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = getNaverMapsScriptUrl(clientId);
      script.async = true;
      script.onload = () =>
        window.naver?.maps ? resolve(window.naver) : reject(new Error('지도 SDK 로드 실패'));
      script.onerror = () => reject(new Error('지도 SDK 로드 실패'));
      document.head.append(script);
    });
  }

  return mapsPromise;
}
