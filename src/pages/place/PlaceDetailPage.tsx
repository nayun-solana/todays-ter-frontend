import { useState } from 'react';
import { useNavigate } from 'react-router';

import iconBookmark from '../../assets/icon-bookmark.svg';
import iconChevronLeft from '../../assets/icon-chevron-left.svg';
import iconShare from '../../assets/icon-share.svg';
import placeImage from '../../assets/place-cheonggyecheon.png';
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
      <header className="relative flex items-center justify-between px-5 pt-[15px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconChevronLeft} alt="" className="h-3.5 w-[7px]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-sans text-sm font-bold text-gray-6">
          장소 상세
        </h1>
        <button
          type="button"
          aria-label="공유하기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconShare} alt="" className="h-[16px] w-[14px]" />
        </button>
      </header>

      <img
        src={placeImage}
        alt={PLACE.name}
        className="mx-5 mt-5 h-[210px] rounded-btn object-cover"
      />

      <div className="mt-5 flex items-center justify-between px-5">
        <h2 className="font-sans text-xl font-extrabold text-gray-6">{PLACE.name}</h2>
        <button
          type="button"
          aria-label="저장하기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconBookmark} alt="" className="h-[15.5px] w-[12px]" />
        </button>
      </div>

      <div className="mt-2.5 flex gap-1 px-5 drop-shadow-[0_2px_1px_rgba(0,0,0,0.05)]">
        <Chip selected className="border-ohaeng-water bg-ohaeng-water">
          {PLACE.element}
        </Chip>
        <Chip>{PLACE.theme}</Chip>
      </div>

      <nav className="mt-[30px] flex gap-7 px-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex flex-col items-center gap-2 font-sans text-sm font-bold',
              tab === t ? 'text-gray-6' : 'text-gray-4',
            )}
          >
            {t}
            <span
              className={cn(
                'h-0.5 w-full rounded-[2px]',
                tab === t ? 'bg-primary' : 'bg-transparent',
              )}
            />
          </button>
        ))}
      </nav>
      <div className="h-px w-full bg-gray-3" />

      <div className="flex-1 bg-gray-1 px-5 pt-4 pb-32">
        {tab === '지도' && (
          <>
            {/* ponytail: 지도 SDK는 새 dependency라 금지, SDK 결정 후 교체 */}
            <div className="h-40 rounded-btn bg-[#e1e1e1]" />
            <p className="mt-2.5 pl-2.5 font-sans text-sm font-bold text-black1">{PLACE.address}</p>
            <p className="mt-1.5 pl-2.5 font-sans text-[10px] font-normal text-black1">
              {PLACE.addressDetail}
            </p>
          </>
        )}

        {tab === '특징' && (
          <div className="flex flex-col gap-2.5 rounded-btn border border-gray-3 bg-white p-5">
            <p className="font-sans text-sm font-bold text-primary">이 터의 특징은 무엇인가요?</p>
            <p className="font-sans text-xs font-normal leading-[18px] text-gray-5">
              {PLACE.feature}
            </p>
          </div>
        )}

        {tab === '후기' && (
          <StatusView
            title="아직 후기가 없어요"
            description="다녀온 뒤 첫 후기를 남겨보세요"
            className="rounded-btn bg-white"
          />
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 flex w-full max-w-[390px] -translate-x-1/2 gap-[7px] bg-gray-1 px-5 pt-2 pb-4">
        <Button fullWidth className="flex h-[52px] items-center justify-center py-0 text-base">
          다녀왔어요
        </Button>
        <Button
          variant="secondary"
          fullWidth
          className="flex h-[52px] items-center justify-center py-0 text-base"
        >
          길찾기
        </Button>
      </div>
    </div>
  );
}
