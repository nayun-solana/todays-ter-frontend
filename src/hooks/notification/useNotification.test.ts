import { describe, expect, it, vi } from 'vitest';

vi.mock('../../api/notification', () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  getNotificationSettings: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn(),
  updateNotificationSettings: vi.fn(),
}));

import { getNextNotificationCursor, updateNotificationPages } from './useNotification';
import type { NotificationListResponse } from '../../types/notification/notification';

const notification = (notificationId: number, isRead = false) => ({
  notificationId,
  type: 'TODAY_REMIND',
  title: '오늘의 터 리마인드',
  content: '아직 오늘의 추천을 확인하지 않았어요.',
  isRead,
  createdAt: '2026-08-10T09:00:00+09:00',
});

const infiniteData = (pages: NotificationListResponse[]) => ({
  pages,
  pageParams: pages.map((_, index) => (index === 0 ? undefined : `cursor-${index + 1}`)),
});

describe('getNextNotificationCursor', () => {
  it('returns the next cursor only while another page exists', () => {
    expect(
      getNextNotificationCursor({ notifications: [], nextCursor: 'cursor-2', hasNext: true }),
    ).toBe('cursor-2');
    expect(
      getNextNotificationCursor({ notifications: [], nextCursor: null, hasNext: false }),
    ).toBeUndefined();
  });

  // hasNext=true인데 커서가 비어 오면 같은 페이지를 무한히 다시 부르게 된다.
  it('stops when the API claims another page but sends no cursor', () => {
    expect(
      getNextNotificationCursor({ notifications: [], nextCursor: null, hasNext: true }),
    ).toBeUndefined();
  });
});

describe('updateNotificationPages', () => {
  const data = infiniteData([
    { notifications: [notification(1), notification(2)], nextCursor: 'cursor-2', hasNext: true },
    { notifications: [notification(3, true)], nextCursor: null, hasNext: false },
  ]);

  it('marks every loaded page as read without dropping items', () => {
    const updated = updateNotificationPages(data, (item) => ({ ...item, isRead: true }));

    expect(updated?.pages.flatMap((page) => page.notifications)).toEqual([
      notification(1, true),
      notification(2, true),
      notification(3, true),
    ]);
    expect(updated?.pages[0].nextCursor).toBe('cursor-2');
  });

  it('marks one notification across pages and leaves the others untouched', () => {
    const updated = updateNotificationPages(data, (item) =>
      item.notificationId === 3 ? { ...item, isRead: true } : item,
    );

    expect(updated?.pages.flatMap((page) => page.notifications)).toEqual([
      notification(1),
      notification(2),
      notification(3, true),
    ]);
  });

  it('returns undefined when nothing is cached yet', () => {
    expect(updateNotificationPages(undefined, (item) => item)).toBeUndefined();
  });
});
