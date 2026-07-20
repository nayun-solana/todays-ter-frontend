import { useState } from 'react';
import OhaengOrb from '../../components/OhaengOrb';
import { useNavigate } from 'react-router';

const NOTIFICATIONS_READ_KEY = 'todays-ter:notifications-read';

const SETTINGS: { label: string; path?: string }[] = [
  { label: '사주 정보 수정', path: '/my/saju' },
  { label: '알림 설정' },
  { label: '계정 연동 관리', path: '/my/account-links' },
  { label: '권한 안내', path: '/my/permissions' },
  { label: '개인정보 및 약관' },
  { label: '회원 탈퇴' },
] as const;

function ChevronRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 9 16" className="h-2.5 w-[5px]">
      <path
        d="M8 1L1 8L8 15"
        transform="translate(9) scale(-1 1)"
        fill="none"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NotificationIcon({ hasUnread }: { hasUnread: boolean }) {
  return (
    <span className="relative size-6">
      <svg aria-label="알림" viewBox="0 0 24 24" className="size-6">
        <path
          d="M13 20.5C13.5523 20.5 14 20.9477 14 21.5C14 22.0523 13.5523 22.5 13 22.5H11C10.4477 22.5 10 22.0523 10 21.5C10 20.9477 10.4477 20.5 11 20.5H13ZM12 1.5C13.1046 1.5 14 2.39543 14 3.5C14 3.59664 13.9898 3.6912 13.9766 3.78418C16.8799 4.63731 19 7.32054 19 10.5V16.5H20C20.5523 16.5 21 16.9477 21 17.5C21 18.0523 20.5523 18.5 20 18.5H4C3.44772 18.5 3 18.0523 3 17.5C3 16.9477 3.44772 16.5 4 16.5H5V10.5C5 7.32087 7.11957 4.6376 10.0225 3.78418C10.0092 3.69125 10 3.59659 10 3.5C10 2.39543 10.8954 1.5 12 1.5Z"
          fill="#3f3f46"
        />
      </svg>
      {hasUnread ? (
        <span
          aria-label="새 알림"
          className="absolute top-0 right-0 size-1.5 rounded-full bg-[#ff5353]"
        />
      ) : null}
    </span>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const [hasUnread] = useState(() => sessionStorage.getItem(NOTIFICATIONS_READ_KEY) !== 'true');

  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-gray-1 pb-24">
      <header className="flex h-[111px] items-end justify-between bg-white px-5 pb-3">
        <h1 className="text-[28px] leading-8 font-extrabold text-primary">마이페이지</h1>
        <button type="button" onClick={() => navigate('/my/notifications')} aria-label="알림 보기">
          <NotificationIcon hasUnread={hasUnread} />
        </button>
      </header>

      <main className="px-5 pt-5">
        <section className="flex flex-col items-center gap-4 rounded-btn bg-white p-5 shadow-[0_2px_1px_rgba(0,0,0,0.05)]">
          <div aria-hidden="true" className="size-25 rounded-full bg-[#d9d9d9]" />
          <p className="text-sm leading-[18px] font-extrabold text-primary">계수님의 오늘의 사주</p>
          <div className="flex gap-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-ohaeng-water bg-ohaeng-water px-3 py-2 text-xs leading-4 font-bold text-white">
              주 오행 : 수 <OhaengOrb element="water" size={16} />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-ohaeng-fire bg-ohaeng-fire px-3 py-2 text-xs leading-4 font-bold text-white">
              보완 오행 : 화 <OhaengOrb element="fire" size={16} />
            </span>
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-lg font-extrabold text-gray-6">설정</h2>
          <ul className="mt-3 overflow-hidden rounded-btn bg-white px-5 shadow-[0_2px_1px_rgba(0,0,0,0.05)]">
            {SETTINGS.map((setting, index) => (
              <li key={setting.label} className={index > 0 ? 'border-t border-gray-2' : undefined}>
                <button
                  type="button"
                  onClick={setting.path ? () => navigate(setting.path!) : undefined}
                  className="flex h-11 w-full items-center justify-between text-left text-sm font-bold text-gray-5"
                >
                  {setting.label}
                  <ChevronRight />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
