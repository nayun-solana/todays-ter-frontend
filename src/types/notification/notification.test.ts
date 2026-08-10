import { describe, expect, it } from 'vitest';

import {
  NotificationListResponse,
  NotificationSettingsResponse,
} from './notification';

describe('notification schemas', () => {
  it('parses the notification list contract', () => {
    expect(
      NotificationListResponse.parse({
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
      }),
    ).toEqual({
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
    });
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
