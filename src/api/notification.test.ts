import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import axiosInstance from './axiosInstance';
import {
  getNotifications,
  getNotificationSettings,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationSettings,
} from './notification';

const mockedAxios = vi.mocked(axiosInstance);

const responseWith = (result: unknown) => ({
  data: {
    isSuccess: true,
    code: 'COMMON200',
    message: '성공적으로 요청을 처리했습니다.',
    result,
  },
});

beforeEach(() => vi.clearAllMocks());

describe('notification API', () => {
  it('gets the first notification page without a cursor', async () => {
    const result = {
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
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getNotifications({ size: 10 })).resolves.toEqual(result);
    expect(mockedAxios.get).toHaveBeenCalledWith('/notifications', {
      params: { size: 10 },
    });
  });

  it('gets a notification page with cursor params', async () => {
    const result = { notifications: [], nextCursor: null, hasNext: false };
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getNotifications({ size: 10, cursor: 'cursor-1' })).resolves.toEqual(result);
    expect(mockedAxios.get).toHaveBeenCalledWith('/notifications', {
      params: { size: 10, cursor: 'cursor-1' },
    });
  });

  it('gets the unread notification count', async () => {
    mockedAxios.get.mockResolvedValue(responseWith({ unreadCount: 3 }));

    await expect(getUnreadNotificationCount()).resolves.toEqual({ unreadCount: 3 });
    expect(mockedAxios.get).toHaveBeenCalledWith('/notifications/unread-count');
  });

  it('marks one notification as read', async () => {
    mockedAxios.patch.mockResolvedValue(responseWith({ notificationId: 102 }));

    await expect(markNotificationAsRead(102)).resolves.toEqual({ notificationId: 102 });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/notifications/102/read');
  });

  it('marks all notifications as read', async () => {
    mockedAxios.patch.mockResolvedValue(responseWith({ updatedCount: 5 }));

    await expect(markAllNotificationsAsRead()).resolves.toEqual({ updatedCount: 5 });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('gets notification settings', async () => {
    const result = {
      isTodayRemind: true,
      remindCycle: 'EVERY_3_DAYS',
      remindTime: '09:00',
      isSavedPlace: true,
      isServiceNotice: true,
      isMarketing: true,
    };
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getNotificationSettings()).resolves.toEqual(result);
    expect(mockedAxios.get).toHaveBeenCalledWith('/notifications/settings');
  });

  it('updates notification settings', async () => {
    const body = {
      isTodayRemind: true,
      remindCycle: 'EVERY_3_DAYS',
      remindTime: '09:00',
      isSavedPlace: true,
      isServiceNotice: true,
      isMarketing: true,
    };
    mockedAxios.patch.mockResolvedValue(responseWith(body));

    await expect(updateNotificationSettings(body)).resolves.toEqual(body);
    expect(mockedAxios.patch).toHaveBeenCalledWith('/notifications/settings', body);
  });
});
