import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useScrollLock } from './scrollLock';

function Sheet({ open }: { open: boolean }) {
  useScrollLock(open);
  return null;
}

beforeEach(() => {
  document.body.style.cssText = '';
  window.scrollTo = vi.fn();
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
});

describe('useScrollLock', () => {
  it('열려 있으면 body를 고정해 뒤 화면이 안 움직이게 한다', () => {
    render(<Sheet open />);

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');
    // fixed가 되면 body가 콘텐츠 폭으로 줄어든다.
    expect(document.body.style.width).toBe('100%');
  });

  it('닫혀 있으면 아무것도 하지 않는다', () => {
    render(<Sheet open={false} />);

    expect(document.body.style.position).toBe('');
  });

  it('보이는 위치가 그대로이도록 스크롤한 만큼 끌어올린다', () => {
    (window as { scrollY: number }).scrollY = 420;
    render(<Sheet open />);

    expect(document.body.style.top).toBe('-420px');
  });

  it('닫으면 원래 스크롤 위치로 되돌린다 — 안 되돌리면 맨 위로 튄다', () => {
    (window as { scrollY: number }).scrollY = 420;
    const { unmount } = render(<Sheet open />);
    unmount();

    expect(document.body.style.position).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 420);
  });

  it('시트가 겹쳐도 마지막 하나가 닫힐 때만 푼다', () => {
    // 온보딩1은 시간 시트를 닫으면서 '시간 모름' 시트를 연다. 각자 풀면 아직 떠 있는
    // 시트 뒤가 다시 스크롤된다.
    const first = render(<Sheet open />);
    const second = render(<Sheet open />);

    first.unmount();
    expect(document.body.style.position).toBe('fixed');

    second.unmount();
    expect(document.body.style.position).toBe('');
  });
});
