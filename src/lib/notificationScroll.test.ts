import { describe, expect, it } from 'vitest';

import { shouldMarkNotificationsRead } from './notificationScroll';

describe('shouldMarkNotificationsRead', () => {
  it('아래로 스크롤한 뒤 위로 움직일 때만 전체 읽음 처리를 시작한다', () => {
    expect(
      shouldMarkNotificationsRead({
        currentScrollY: 180,
        previousScrollY: 200,
        hasScrolledDown: true,
      }),
    ).toBe(true);
    expect(
      shouldMarkNotificationsRead({
        currentScrollY: 20,
        previousScrollY: 0,
        hasScrolledDown: false,
      }),
    ).toBe(false);
  });
});
