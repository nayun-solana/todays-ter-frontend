import { useState } from 'react';
import { useNavigate } from 'react-router';

import iconChevronLeft from '../../assets/icon-chevron-left.svg';
import iconBookmark from '../../assets/icon-bookmark.svg';
import iconStar from '../../assets/icon-star.svg';
import placeImage from '../../assets/place-cheonggyecheon.png';
import Button from '../../components/Button';
import OhaengOrb from '../../components/OhaengOrb';
import { cn } from '../../lib/cn';
import { ohaengByKey } from '../../lib/ohaeng';

const TABS = ['지도', '후기'] as const;
type Tab = (typeof TABS)[number];

// TODO: API 연동 시 교체 (Figma 시안 데이터)
const PLACE = {
  name: '청계전 모전교',
  element: 'water' as const,
  theme: '감정 회복',
  address: '서울 중구 무교동',
  addressDetail: '광화문역 5번 출구에서 223m',
  feature: '수(水) 기운이 강해 감정 정리와 회복에 좋고 오늘의 흐름과 잘 맞아요.',
};

const REVIEWS = Array.from({ length: 3 }, () => ({
  writer: '리뷰 작성자 닉네임',
  date: '2025.06.28',
  content: '리뷰 작성 내용',
}));

function ReviewItem({ writer, date, content }: (typeof REVIEWS)[number]) {
  return (
    <article className="border-b border-gray-3 py-4 first:pt-3">
      <div className="flex gap-0.5" aria-label="별점 4점">
        {Array.from({ length: 5 }, (_, index) => (
          <img
            key={index}
            src={iconStar}
            alt=""
            className={cn('size-[13px]', index === 4 && 'grayscale opacity-60')}
          />
        ))}
      </div>
      <p className="mt-1.5 font-sans text-xs font-normal text-gray-4">
        {writer} · {date}
      </p>
      <div className="mt-2.5 flex h-[120px] gap-1 overflow-x-auto">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-[120px] w-[120px] shrink-0 rounded-btn bg-[#d9d9d9]" />
        ))}
      </div>
      <p className="mt-2.5 font-sans text-sm font-normal text-gray-5">{content}</p>
    </article>
  );
}

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('지도');
  const element = ohaengByKey(PLACE.element)!;

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-white pb-[106px]">
      <header className="relative flex h-[104px] items-end justify-between px-5 pb-[19px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconChevronLeft} alt="" className="h-3.5 w-[7px]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-sans text-[14px] font-body3 text-gray-6">
          장소 상세
        </h1>
        <button
          type="button"
          aria-label="저장하기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconBookmark} alt="" className="h-[17px] w-[14px]" />
        </button>
      </header>

      <img
        src={placeImage}
        alt={PLACE.name}
        className="mx-5 mt-1 h-[210px] rounded-btn object-cover"
      />

      <div className="mt-5 px-5">
        <h2 className="font-sans text-xl font-extrabold text-gray-6">{PLACE.name}</h2>
      </div>

      <div className="mt-2.5 flex gap-1 px-5">
        <span className={cn('flex h-8 items-center gap-1 rounded-btn px-3', element.bg)}>
          <span className="text-xs leading-4 font-bold text-white">{element.label}</span>
          <OhaengOrb element={element.key} size={16} />
        </span>
        <span className="flex h-8 items-center gap-1 rounded-btn border border-gray-2 bg-white px-3 text-xs leading-4 font-bold text-gray-5">
          <span>#</span>
          <span>{PLACE.theme}</span>
        </span>
      </div>

      <div className="mx-5 mt-2.5 rounded-btn border border-gray-2 px-4 py-3">
        <p className="font-sans text-xs font-bold text-primary">이 터의 특징은 무엇인가요?</p>
        <p className="mt-2 font-sans text-[10px] font-normal leading-[14px] text-gray-5">
          {PLACE.feature}
        </p>
      </div>

      <nav className="mt-3 flex gap-6 px-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex flex-col items-center gap-1.5 font-sans text-sm font-bold',
              tab === t ? 'text-gray-6' : 'text-gray-4',
            )}
          >
            <span>
              {t}
              {t === '후기' && <span className={tab === t ? 'text-primary' : 'text-gray-4'}> 9</span>}
            </span>
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

      <div className="flex-1 px-5 pt-4">
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

        {tab === '후기' && (
          <div>
            {REVIEWS.map((review, index) => (
              <ReviewItem key={index} {...review} />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 z-10 flex w-full max-w-[390px] -translate-x-1/2 gap-[7px] px-5">
        <Button fullWidth className="flex h-[50px] items-center justify-center py-0 text-sm">
          다녀왔어요
        </Button>
        <Button
          variant="secondary"
          fullWidth
          className="flex h-[50px] items-center justify-center py-0 text-sm"
        >
          길찾기
        </Button>
      </div>
    </div>
  );
}
