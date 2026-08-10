import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getNotifications,
  getNotificationSettings,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationSettings,
} from '../../api/notification';
import type {
  NotificationListResponse,
  NotificationSettingsRequest,
} from '../../types/notification/notification';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
};

export function useNotifications(options?: { enabled?: boolean; poll?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
    enabled: options?.enabled ?? true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: options?.poll ? 60_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<NotificationListResponse>(notificationKeys.list());

      queryClient.setQueryData<NotificationListResponse | undefined>(
        notificationKeys.list(),
        (current) => {
          if (!current) return current;
          const wasUnread = current.notifications.some(
            (notification) => notification.notificationId === notificationId && !notification.isRead,
          );

          return {
            ...current,
            notifications: current.notifications.map((notification) =>
              notification.notificationId === notificationId
                ? { ...notification, isRead: true }
                : notification,
            ),
            unreadCount:
              current.unreadCount === undefined
                ? undefined
                : Math.max(0, current.unreadCount - (wasUnread ? 1 : 0)),
          };
        },
      );

      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      queryClient.setQueryData(notificationKeys.list(), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list() }),
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<NotificationListResponse>(notificationKeys.list());

      queryClient.setQueryData<NotificationListResponse | undefined>(
        notificationKeys.list(),
        (current) =>
          current
            ? {
                ...current,
                notifications: current.notifications.map((notification) => ({
                  ...notification,
                  isRead: true,
                })),
                unreadCount: current.unreadCount === undefined ? undefined : 0,
              }
            : current,
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(notificationKeys.list(), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list() }),
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: getNotificationSettings,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: NotificationSettingsRequest) => updateNotificationSettings(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.settings() });
      const previous = queryClient.getQueryData(notificationKeys.settings());
      queryClient.setQueryData(notificationKeys.settings(), body);
      return { previous };
    },
    onError: (_error, _body, context) => {
      queryClient.setQueryData(notificationKeys.settings(), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.settings() }),
  });
}
