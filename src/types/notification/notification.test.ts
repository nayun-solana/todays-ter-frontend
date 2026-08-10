import { describe, expect, it } from 'vitest';

import {
  NotificationListResponse,
  NotificationSettingsResponse,
  UnreadNotificationCountResponse,
} from './notification';

describe('notification schemas', () => {
  it('parses the notification list contract', () => {
    const page = {
      notifications: [
        {
          notificationId: 102,
          type: 'TODAY_REMIND',
          title: '오늘의 터 리마인드',
          content: '아직 오늘의 추천을 확인하지 않았어요.',
          isRead: false,
          createdAt: '2026-08-10T09:00:00+09:00',
        },
      ],
      nextCursor: 'cursor-2',
      hasNext: true,
    };

    expect(NotificationListResponse.parse(page)).toEqual(page);
  });

  it('parses the last page with a null cursor', () => {
    expect(
      NotificationListResponse.parse({ notifications: [], nextCursor: null, hasNext: false }),
    ).toEqual({ notifications: [], nextCursor: null, hasNext: false });
  });

  it('parses the unread count response', () => {
    expect(UnreadNotificationCountResponse.parse({ unreadCount: 3 })).toEqual({ unreadCount: 3 });
  });

  it('parses notification settings', () => {
    expect(
      NotificationSettingsResponse.parse({
        isTodayRemind: true,
        remindCycle: 'EVERY_3_DAYS',
        remindTime: '09:00',
        isSavedPlace: true,
        isServiceNotice: true,
        isMarketing: true,
      }),
    ).toMatchObject({
      isTodayRemind: true,
      remindCycle: 'EVERY_3_DAYS',
      remindTime: '09:00',
    });
  });
});
