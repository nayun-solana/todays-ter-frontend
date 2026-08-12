import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 테스트마다 렌더된 DOM을 걷어낸다. 남겨두면 다음 테스트의 쿼리가 이전 화면을 먼저 찾는다.
afterEach(cleanup);

// jsdom에는 Element.scrollTo가 없다(레이아웃을 계산하지 않는다). 휠 피커가 열릴 때
// 현재 값 위치로 스크롤하므로 없으면 TypeError로 렌더가 죽는다 — 호출만 삼킨다.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
