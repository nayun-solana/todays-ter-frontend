import { describe, expect, it } from 'vitest';

import {
  formatNotificationTime,
  groupNotifications,
  hasUnreadNotificationCount,
} from './notification';

const today = '2026-08-10T09:00:00+09:00';

const notification = (overrides: Record<string, unknown> = {}) => ({
  notificationId: 1,
  type: 'TODAY_REMIND',
  title: '오늘의 터 리마인드',
  content: '아직 오늘의 추천을 확인하지 않았어요.',
  isRead: false,
  createdAt: today,
  ...overrides,
});

describe('notification helpers', () => {
  it('shows the badge only when the unread count is positive', () => {
    expect(hasUnreadNotificationCount({ unreadCount: 1 })).toBe(true);
    expect(hasUnreadNotificationCount({ unreadCount: 0 })).toBe(false);
    expect(hasUnreadNotificationCount(undefined)).toBe(false);
  });

  // 읽은 알림은 이력으로 남는다 — 읽음 처리해도 카드가 사라지면 안 된다.
  it('keeps read notifications in the grouped history', () => {
    const groups = groupNotifications(
      [
        notification({ notificationId: 1, isRead: true }),
        notification({ notificationId: 2, isRead: false }),
      ],
      new Date(today),
    );

    expect(groups[0].items.map((item) => item.notificationId)).toEqual([1, 2]);
  });

  it('groups notifications into today, yesterday, and date labels', () => {
    const groups = groupNotifications(
      [
        notification({ notificationId: 1, createdAt: today }),
        notification({ notificationId: 2, createdAt: '2026-08-09T09:00:00+09:00' }),
        notification({ notificationId: 3, createdAt: '2026-07-18T09:00:00+09:00' }),
      ],
      new Date(today),
    );

    expect(groups.map((group) => group.label)).toEqual(['오늘', '어제', '7월 18일']);
    expect(groups[0].items).toHaveLength(1);
  });

  it('formats recent notification times for the card metadata', () => {
    expect(formatNotificationTime('2026-08-10T08:30:00+09:00', new Date(today))).toBe('30분 전');
  });
});
