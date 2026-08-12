import type {
  NotificationItem,
  UnreadNotificationCountResponse,
} from '../types/notification/notification';

export type NotificationGroup = {
  label: string;
  items: NotificationItem[];
};

function dateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(date);
}

function notificationDateKey(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? createdAt.slice(0, 10) : dateKey(date);
}

function dateLabel(key: string, todayKey: string, yesterdayKey: string) {
  if (key === todayKey) return '오늘';
  if (key === yesterdayKey) return '어제';

  const [, month, day] = key.split('-');
  return month && day ? `${Number(month)}월 ${Number(day)}일` : key;
}

export function hasUnreadNotificationCount(response?: UnreadNotificationCountResponse) {
  return (response?.unreadCount ?? 0) > 0;
}

export function formatNotificationTime(createdAt: string, now = new Date()) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

export function groupNotifications(
  items: NotificationItem[],
  now = new Date(),
): NotificationGroup[] {
  const todayKey = dateKey(now);
  const yesterdayKey = dateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const groups = new Map<string, NotificationGroup>();

  [...items]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .forEach((item) => {
      const key = notificationDateKey(item.createdAt);
      const group = groups.get(key) ?? {
        label: dateLabel(key, todayKey, yesterdayKey),
        items: [],
      };
      group.items.push(item);
      groups.set(key, group);
    });

  return [...groups.values()];
}
