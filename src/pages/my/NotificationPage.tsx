import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';

import notificationGear from '../../assets/notification-gear.svg';
import notificationInfo from '../../assets/notification-info.svg';
import notificationRedDot from '../../assets/notification-red-dot.svg';
import notificationSavedPlace from '../../assets/notification-saved-place.png';
import notificationStar from '../../assets/notification-star.svg';
import PageHeader from '../../components/PageHeader';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationList,
  useUnreadNotificationCount,
} from '../../hooks/notification/useNotification';
import {
  formatNotificationTime,
  groupNotifications,
  hasUnreadNotificationCount,
} from '../../lib/notification';
import type { NotificationItem } from '../../types/notification/notification';

function NotificationTypeIcon({ type }: { type: string }) {
  const normalizedType = type.toUpperCase();
  const icon = normalizedType.includes('SAVED')
    ? notificationSavedPlace
    : normalizedType.includes('REMIND')
      ? notificationRedDot
      : normalizedType.includes('RECOMMEND')
        ? notificationStar
        : notificationInfo;

  if (icon === notificationInfo) {
    return (
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center rounded-full border border-primary"
      >
        <img src={notificationInfo} alt="" className="h-[8px] w-[3px]" />
      </span>
    );
  }

  return <img src={icon} alt="" className="size-4 shrink-0 object-contain" />;
}

function NotificationCard({
  item,
  onRead,
  disabled,
}: {
  item: NotificationItem;
  onRead: (notificationId: number) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onRead(item.notificationId)}
      disabled={disabled}
      className="relative flex min-h-20 w-full items-start gap-2 rounded-btn bg-white p-5 text-left shadow-card disabled:cursor-not-allowed"
    >
      <NotificationTypeIcon type={item.type} />
      <span className="min-w-0 flex-1">
        <span className="typo-body-3 block text-gray-6">{item.title}</span>
        <span className="typo-caption mt-2 block text-primary">{item.content}</span>
      </span>
      {!item.isRead ? (
        <span className="flex shrink-0 items-center gap-2 pl-2">
          <span className="typo-caption text-gray-4">
            {formatNotificationTime(item.createdAt)}
          </span>
          <span aria-label="새 알림" className="size-1.5 rounded-full bg-danger" />
        </span>
      ) : null}
    </button>
  );
}

export default function NotificationPage() {
  const notificationsQuery = useNotificationList();
  // 첫 10개가 모두 읽음이어도 더 오래된 page에 미읽음이 남을 수 있어, 목록이 아니라 전체 개수로 판단한다.
  const unreadCountQuery = useUnreadNotificationCount();
  const markNotificationAsRead = useMarkNotificationAsRead();
  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(
    () =>
      groupNotifications(
        notificationsQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
      ),
    [notificationsQuery.data],
  );
  const hasUnread = hasUnreadNotificationCount(unreadCountQuery.data);

  useEffect(() => {
    const target = loadMoreRef.current;
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = notificationsQuery;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void fetchNextPage();
      },
      { rootMargin: '160px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [notificationsQuery]);

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader
        title="알림"
        backTo="/home"
        trailing={
          <Link
            to="/my/notification-settings"
            aria-label="알림 설정"
            className="flex size-6 items-center justify-center"
          >
            <img src={notificationGear} alt="" className="size-6" />
          </Link>
        }
      />

      <main className="space-y-5 px-[18px] pt-5 pb-8" aria-busy={notificationsQuery.isPending}>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => markAllNotificationsAsRead.mutate()}
            disabled={!hasUnread || markAllNotificationsAsRead.isPending}
            className="typo-sub-2 text-primary disabled:cursor-not-allowed disabled:text-gray-3"
          >
            전체 읽음
          </button>
        </div>

        {notificationsQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">알림을 불러오는 중입니다.</p>
        ) : null}
        {notificationsQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">
            알림을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : null}
        {!notificationsQuery.isPending && !notificationsQuery.isError && groups.length === 0 ? (
          <p className="rounded-btn bg-white px-5 py-8 text-center typo-sub-2 text-gray-4 shadow-card">
            새로운 알림이 없어요.
          </p>
        ) : null}

        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="typo-head-4 text-gray-6">{group.label}</h2>
            <div className="mt-3 space-y-3">
              {group.items.map((item) => (
                <NotificationCard
                  key={item.notificationId}
                  item={item}
                  onRead={(notificationId) => {
                    if (!item.isRead) markNotificationAsRead.mutate(notificationId);
                  }}
                  disabled={
                    markNotificationAsRead.isPending &&
                    markNotificationAsRead.variables === item.notificationId
                  }
                />
              ))}
            </div>
          </section>
        ))}

        <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
        {notificationsQuery.isFetchingNextPage ? (
          <p className="typo-sub-2 text-center text-gray-4">알림을 더 불러오는 중입니다.</p>
        ) : null}
      </main>
    </div>
  );
}
