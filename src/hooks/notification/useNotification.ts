import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import {
  getNotifications,
  getNotificationSettings,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationSettings,
} from '../../api/notification';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationSettingsRequest,
  UnreadNotificationCountResponse,
} from '../../types/notification/notification';

const NOTIFICATION_PAGE_SIZE = 10;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
};

/** hasNext만 믿으면 커서 없이 같은 page를 무한히 다시 부른다 — 커서가 있어야 다음 page다. */
export function getNextNotificationCursor(lastPage: NotificationListResponse) {
  return lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined;
}

/** 로드된 모든 page의 알림에 같은 변환을 적용한다. 읽음 처리는 목록에서 제거하지 않는다. */
export function updateNotificationPages(
  data: InfiniteData<NotificationListResponse> | undefined,
  update: (notification: NotificationItem) => NotificationItem,
) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      notifications: page.notifications.map(update),
    })),
  };
}

export function useNotificationList() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getNotifications({ size: NOTIFICATION_PAGE_SIZE, cursor: pageParam }),
    getNextPageParam: getNextNotificationCursor,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useUnreadNotificationCount(options?: { enabled?: boolean; poll?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled: options?.enabled ?? true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: options?.poll ? 60_000 : false,
    refetchIntervalInBackground: false,
  });
}

/** 읽음 처리는 목록과 미읽음 개수를 함께 건드린다 — 둘을 같이 잠그고, 같이 되돌린다. */
async function snapshotNotificationCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: notificationKeys.list() }),
    queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
  ]);

  return {
    list: queryClient.getQueryData<InfiniteData<NotificationListResponse>>(
      notificationKeys.list(),
    ),
    unreadCount: queryClient.getQueryData<UnreadNotificationCountResponse>(
      notificationKeys.unreadCount(),
    ),
  };
}

function rollbackNotificationCaches(
  queryClient: QueryClient,
  previous?: Awaited<ReturnType<typeof snapshotNotificationCaches>>,
) {
  queryClient.setQueryData(notificationKeys.list(), previous?.list);
  queryClient.setQueryData(notificationKeys.unreadCount(), previous?.unreadCount);
}

function invalidateNotificationCaches(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
  void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      const previous = await snapshotNotificationCaches(queryClient);
      const wasUnread =
        previous.list?.pages.some((page) =>
          page.notifications.some(
            (notification) =>
              notification.notificationId === notificationId && !notification.isRead,
          ),
        ) ?? false;

      queryClient.setQueryData<InfiniteData<NotificationListResponse>>(
        notificationKeys.list(),
        (current) =>
          updateNotificationPages(current, (notification) =>
            notification.notificationId === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
      );

      if (wasUnread) {
        queryClient.setQueryData<UnreadNotificationCountResponse>(
          notificationKeys.unreadCount(),
          (current) => (current ? { unreadCount: Math.max(0, current.unreadCount - 1) } : current),
        );
      }

      return previous;
    },
    onError: (_error, _notificationId, previous) =>
      rollbackNotificationCaches(queryClient, previous),
    onSettled: () => invalidateNotificationCaches(queryClient),
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      const previous = await snapshotNotificationCaches(queryClient);

      queryClient.setQueryData<InfiniteData<NotificationListResponse>>(
        notificationKeys.list(),
        (current) =>
          updateNotificationPages(current, (notification) => ({ ...notification, isRead: true })),
      );
      queryClient.setQueryData<UnreadNotificationCountResponse>(notificationKeys.unreadCount(), {
        unreadCount: 0,
      });

      return previous;
    },
    onError: (_error, _variables, previous) => rollbackNotificationCaches(queryClient, previous),
    onSettled: () => invalidateNotificationCaches(queryClient),
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
