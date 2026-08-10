import { useMemo } from 'react';
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
  useNotifications,
} from '../../hooks/notification/useNotification';
import {
  formatNotificationTime,
  groupNotifications,
  hasUnreadNotifications,
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
  const notificationsQuery = useNotifications();
  const markNotificationAsRead = useMarkNotificationAsRead();
  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead();
  const groups = useMemo(
    () => groupNotifications(notificationsQuery.data?.notifications ?? []),
    [notificationsQuery.data],
  );
  const hasUnread = hasUnreadNotifications(notificationsQuery.data);

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
      </main>
    </div>
  );
}
