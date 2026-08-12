import { useEffect } from 'react';

/**
 * 화면 맨 윗부분의 색을 브라우저에 알려준다.
 *
 * 노치 영역과 고무줄 스크롤(아래로 당겼을 때 늘어나는 부분)은 **페이지가 그릴 수 없는 자리**다.
 * 거기엔 `html`의 배경과 브라우저가 아는 테마색이 비친다. 화면 상단 색과 다르면 띠처럼 보인다.
 *
 * ⚠️ **iOS 홈화면 앱에서는 노치 색이 이걸로 바뀌지 않는다.** `apple-mobile-web-app-status-bar-style`이
 * `default`인 동안 iOS는 상태바를 시스템이 칠하고 `theme-color`를 무시한다(실기기에서 확인 —
 * 메타는 파란색인데 상태바는 흰색이었다). 노치까지 맞추려면 그 값을 `black-translucent`로 바꿔
 * 웹뷰를 상태바 밑까지 넓혀야 하고, 그러면 상태바 글자가 항상 흰색이 되어 흰 배경 화면들이
 * 읽히지 않는다 — 별도 결정이 필요하다.
 *
 * 그래서 지금 이 훅이 실제로 고치는 것은 **고무줄 틈**(모든 플랫폼)과 **안드로이드 상태바 색**이다.
 */
const DEFAULT_TOP_COLOR = 'var(--color-gray-1)';

/**
 * `var(--x)` 형태면 실제 색으로 바꿔준다.
 *
 * `theme-color` 메타는 CSS 변수를 해석하지 못해서 계산된 값을 넣어야 한다.
 * 변수 형태가 아니면 그대로 돌려준다.
 */
export function resolveCssColor(value: string): string {
  const variable = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim());
  if (!variable) return value;

  const resolved = getComputedStyle(document.documentElement).getPropertyValue(variable[1]).trim();
  return resolved || value;
}

/**
 * 이 화면이 켜져 있는 동안 상단 색을 바꾼다. 화면을 벗어나면 이전 값으로 되돌린다.
 *
 * `color`에 CSS 변수(`var(--color-ohaeng-water)`)를 그대로 넘겨도 된다.
 */
export function useTopColor(color: string = DEFAULT_TOP_COLOR): void {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousMeta = meta?.content ?? null;
    const previousBackground = document.documentElement.style.backgroundColor;
    const resolved = resolveCssColor(color);

    if (meta) meta.content = resolved;
    document.documentElement.style.backgroundColor = resolved;

    return () => {
      // 되돌리지 않으면 다음 화면이 자기 색을 지정하지 않았을 때 이전 화면 색이 남는다.
      if (meta && previousMeta !== null) meta.content = previousMeta;
      document.documentElement.style.backgroundColor = previousBackground;
    };
  }, [color]);
}
