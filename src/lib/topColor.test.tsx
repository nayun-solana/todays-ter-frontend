import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resolveCssColor, useTopColor } from './topColor';

function Screen({ color }: { color?: string }) {
  useTopColor(color);
  return null;
}

const themeColor = () =>
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content;

beforeEach(() => {
  document.head.innerHTML = '<meta name="theme-color" content="#ffffff">';
  document.documentElement.style.backgroundColor = '';
  document.documentElement.style.setProperty('--color-ohaeng-water', '#5599ff');
});

describe('resolveCssColor', () => {
  it('CSS 변수를 실제 색으로 바꾼다 — theme-color 메타는 변수를 못 읽는다', () => {
    expect(resolveCssColor('var(--color-ohaeng-water)')).toBe('#5599ff');
  });

  it('변수가 아니면 그대로 둔다', () => {
    expect(resolveCssColor('#ffffff')).toBe('#ffffff');
  });

  it('정의되지 않은 변수는 원문을 돌려준다 — 빈 문자열로 덮어써 색을 잃지 않는다', () => {
    expect(resolveCssColor('var(--nope)')).toBe('var(--nope)');
  });
});

describe('useTopColor', () => {
  it('theme-color와 html 배경을 함께 바꾼다', () => {
    // 노치는 theme-color를, 고무줄 영역은 html 배경을 본다. 한쪽만 바꾸면 반쪽만 고쳐진다.
    render(<Screen color="var(--color-ohaeng-water)" />);

    expect(themeColor()).toBe('#5599ff');
    expect(document.documentElement.style.backgroundColor).toBe('rgb(85, 153, 255)');
  });

  it('화면을 벗어나면 이전 값으로 되돌린다', () => {
    const { unmount } = render(<Screen color="var(--color-ohaeng-water)" />);
    unmount();

    // 되돌리지 않으면 색을 지정하지 않은 다음 화면에 홈 색이 남는다.
    expect(themeColor()).toBe('#ffffff');
    expect(document.documentElement.style.backgroundColor).toBe('');
  });

  it('색을 안 넘기면 기본값(gray-1)을 쓴다', () => {
    document.documentElement.style.setProperty('--color-gray-1', '#fafafa');
    render(<Screen />);

    expect(themeColor()).toBe('#fafafa');
  });
});
