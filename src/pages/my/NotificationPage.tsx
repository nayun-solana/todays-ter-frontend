import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import PageHeader from '../../components/PageHeader';

const NOTIFICATIONS_READ_KEY = 'todays-ter:notifications-read';

type NotificationItem = { title: string; message: string; unread?: boolean };

const NOTIFICATION_GROUPS: { label: string; items: NotificationItem[] }[] = [
  {
    label: '오늘',
    items: [
      {
        title: '저장한 터 알림',
        message: '주말에 가기 좋은 저장한 터 2곳이 있어요.',
        unread: true,
      },
      { title: '공지', message: '서비스 베타 테스트 안내' },
    ],
  },
  {
    label: '어제',
    items: [
      { title: '저장한 터 알림', message: '내 주변에서 인기 있는 터를 확인해 보세요.' },
      { title: '공지', message: '오늘의 터 이용 안내를 확인해 보세요.' },
    ],
  },
  {
    label: '6월 9일',
    items: [
      { title: '저장한 터 알림', message: '저장한 터에 새로운 후기가 등록되었어요.' },
      { title: '공지', message: '서비스 업데이트 안내' },
    ],
  },
] as const;

export default function NotificationPage() {
  const [unread] = useState(() => sessionStorage.getItem(NOTIFICATIONS_READ_KEY) !== 'true');

  useEffect(() => {
    sessionStorage.setItem(NOTIFICATIONS_READ_KEY, 'true');
  }, []);

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="알림" leading="close" backTo="/my" />

      <main className="space-y-5 px-[18px] pt-5 pb-8">
        {NOTIFICATION_GROUPS.map((group) => (
          <section key={group.label}>
            <h2 className="typo-head-4 text-gray-6">{group.label}</h2>
            <div className="mt-3 space-y-3">
              {group.items.map((item) => (
                <Link
                  key={`${group.label}-${item.title}`}
                  to="/record"
                  className="relative flex h-[66px] flex-col justify-center rounded-btn bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
                >
                  <span className="typo-body-3 text-gray-6">{item.title}</span>
                  <span className="typo-caption mt-2 text-primary">{item.message}</span>
                  {item.unread && unread ? (
                    <span
                      aria-label="새 알림"
                      className="absolute top-4 right-4 size-1.5 rounded-full bg-danger"
                    />
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
