import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';

import notificationGear from '../../assets/notification-gear.svg';
import notificationInfo from '../../assets/notification-info.svg';
import notificationRedDot from '../../assets/notification-red-dot.svg';
import notificationSavedPlace from '../../assets/notification-saved-place.png';
import notificationStar from '../../assets/notification-star.svg';
import PageHeader from '../../components/PageHeader';
import SectionError from '../../components/SectionError';
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
import { shouldMarkNotificationsRead } from '../../lib/notificationScroll';
import type { NotificationItem } from '../../types/notification/notification';
import { loadFailureMessageBrief, loadingMessage, loadingMoreMessage } from '../../lib/messages';

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
          <span className="typo-caption text-gray-4">{formatNotificationTime(item.createdAt)}</span>
          <span aria-label="새 알림" className="size-1.5 rounded-full bg-danger" />
        </span>
      ) : null}
    </button>
  );
}

/**
 * 로딩 자리표시자. NotificationCard와 같은 규칙(min-h-20)을 쓴다 —
 * 실물이 최소 높이만 정해두고 내용이 길면 늘어나므로, 높이를 고정하면 오히려 어긋난다.
 */
function NotificationListSkeleton({
  count,
  label = loadingMessage('알림'),
}: {
  count: number;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="min-h-20 w-full animate-pulse rounded-btn bg-gray-2" />
      ))}
    </div>
  );
}

export default function NotificationPage() {
  const notificationsQuery = useNotificationList();
  // 첫 10개가 모두 읽음이어도 더 오래된 page에 미읽음이 남을 수 있어, 목록이 아니라 전체 개수로 판단한다.
  const unreadCountQuery = useUnreadNotificationCount();
  const markNotificationAsRead = useMarkNotificationAsRead();
  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);
  const hasScrolledDown = useRef(false);
  const groups = useMemo(
    () =>
      groupNotifications(
        notificationsQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
      ),
    [notificationsQuery.data],
  );
  const hasUnread = hasUnreadNotificationCount(unreadCountQuery.data);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > previousScrollY.current) hasScrolledDown.current = true;

      if (
        hasUnread &&
        !markAllNotificationsAsRead.isPending &&
        shouldMarkNotificationsRead({
          currentScrollY,
          previousScrollY: previousScrollY.current,
          hasScrolledDown: hasScrolledDown.current,
        })
      ) {
        markAllNotificationsAsRead.mutate();
      }

      previousScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasUnread, markAllNotificationsAsRead]);

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
        {notificationsQuery.isPending ? <NotificationListSkeleton count={3} /> : null}
        {/* 목록이 이미 있으면 실패는 맨 위가 아니라 이어받기 자리(하단)에 붙인다 —
            다음 페이지가 실패한 것뿐인데 상단에 경고가 뜨면 목록 전체가 잘못된 것처럼 보인다. */}
        {notificationsQuery.isError && groups.length === 0 ? (
          <SectionError
            message={loadFailureMessageBrief('알림')}
            onRetry={() => void notificationsQuery.refetch()}
          />
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
          <NotificationListSkeleton count={1} label={loadingMoreMessage('알림')} />
        ) : null}
        {notificationsQuery.isError && groups.length > 0 ? (
          <SectionError
            message="더 불러오지 못했어요."
            onRetry={() => void notificationsQuery.fetchNextPage()}
          />
        ) : null}
      </main>
    </div>
  );
}
