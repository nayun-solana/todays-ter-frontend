import { useState } from 'react';
import { useNavigate } from 'react-router';

import Button from '../../components/Button';
import Chip from '../../components/Chip';
import StatusView from '../../components/StatusView';
import { cn } from '../../lib/cn';

const TABS = ['지도', '특징', '후기'] as const;
type Tab = (typeof TABS)[number];

// TODO: API 연동 시 교체 (Figma 시안 데이터)
const PLACE = {
  name: '청계전 모전교',
  element: '수(水)',
  theme: '감정 회복',
  address: '서울 중구 무교동',
  addressDetail: '광화문역 5번 출구에서 223m',
  feature: '수(水) 기운이 강해 감정 정리와 회복에 좋고 오늘의 흐름과 잘 맞아요.',
};

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('지도');

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col">
      <header className="relative flex h-14 items-center justify-between px-5">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-6"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-sans text-sm font-bold text-gray-6">
          장소 상세
        </h1>
        <button type="button" aria-label="공유하기">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-6"
            aria-hidden="true"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="m16 6-4-4-4 4" />
            <path d="M12 2v13" />
          </svg>
        </button>
      </header>

      {/* ponytail: 사진 asset 미확보, export되면 img로 교체 */}
      <div className="mx-5 h-[210px] rounded-2xl bg-gray-3" />

      <div className="mt-5 flex items-center justify-between px-5">
        <h2 className="font-sans text-lg font-extrabold text-gray-6">{PLACE.name}</h2>
        <button type="button" aria-label="저장하기">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-6"
            aria-hidden="true"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex gap-2 px-5">
        <Chip selected>{PLACE.element}</Chip>
        <Chip>{PLACE.theme}</Chip>
      </div>

      <nav className="mt-4 flex gap-7 border-b border-gray-3 px-5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 pb-2.5 font-sans text-sm',
              tab === t
                ? 'border-gray-6 font-bold text-gray-6'
                : 'border-transparent text-gray-4',
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="flex-1 bg-gray-1 px-5 pt-4 pb-32">
        {tab === '지도' && (
          <>
            {/* ponytail: 지도 SDK는 새 dependency라 금지, SDK 결정 후 교체 */}
            <div className="h-40 rounded-2xl bg-gray-3" />
            <p className="mt-3 font-sans text-sm font-bold text-gray-6">{PLACE.address}</p>
            <p className="mt-1 font-sans text-[11px] text-gray-4">{PLACE.addressDetail}</p>
          </>
        )}

        {tab === '특징' && (
          <div className="rounded-2xl border border-primary-light bg-white p-5">
            <p className="font-sans text-sm font-bold text-primary">이 터의 특징은 무엇인가요?</p>
            <p className="mt-2.5 font-sans text-[13px] leading-relaxed text-gray-5">
              {PLACE.feature}
            </p>
          </div>
        )}

        {tab === '후기' && (
          <StatusView
            title="아직 후기가 없어요"
            description="다녀온 뒤 첫 후기를 남겨보세요"
            className="rounded-2xl bg-white"
          />
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 flex w-full max-w-[390px] -translate-x-1/2 gap-2 bg-gray-1 px-5 pt-2 pb-4">
        <Button fullWidth className="rounded-full py-3.5 text-base">
          다녀왔어요
        </Button>
        <Button
          variant="secondary"
          fullWidth
          className="rounded-full border-0 bg-primary-bg py-3.5 text-base"
        >
          길찾기
        </Button>
      </div>
    </div>
  );
}
