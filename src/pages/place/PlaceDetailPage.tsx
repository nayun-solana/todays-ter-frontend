import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import iconBookmark from '../../assets/icon-bookmark.svg';
import iconStar from '../../assets/icon-star.svg';
import placeImage from '../../assets/place-cheonggyecheon.png';
import Button from '../../components/Button';
import OhaengOrb from '../../components/OhaengOrb';
import PageHeader from '../../components/PageHeader';
import { MoreVerticalIcon, PencilIcon, PinIcon, TrashIcon } from '../../components/icons';
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

type Review = {
  id: string;
  writer: string;
  date: string;
  rating: number;
  content: string;
  photoCount: number;
  isMine?: boolean;
};

// TODO: API 연동 시 교체. isMine 후기는 목록 상단에 고정된다.
const REVIEWS: Review[] = [
  {
    id: 'mine',
    writer: '내 닉네임',
    date: '2025.06.28',
    rating: 4,
    content: '',
    photoCount: 3,
    isMine: true,
  },
  {
    id: 'r1',
    writer: '리뷰 작성자 닉네임',
    date: '2025.06.28',
    rating: 4,
    content: '리뷰 작성 내용',
    photoCount: 3,
  },
  {
    id: 'r2',
    writer: '리뷰 작성자 닉네임',
    date: '2025.06.28',
    rating: 4,
    content: '리뷰 작성 내용',
    photoCount: 3,
  },
];

/** Figma: 별 18×17, 활성 #ffd310 / 비활성 gray-3 */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-px" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <img
          key={index}
          src={iconStar}
          alt=""
          className={cn('h-[17px] w-[18px]', index >= rating && 'opacity-40 grayscale')}
        />
      ))}
    </div>
  );
}

function ReviewPhotos({ count }: { count: number }) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {Array.from({ length: count }, (_, index) => (
        // ponytail: 후기 사진 asset 미확보 → placeholder. API 연동 시 <img>로 교체
        <div key={index} className="size-[120px] shrink-0 rounded-btn bg-placeholder" />
      ))}
    </div>
  );
}

/** 내 후기 — 목록 상단 고정. 우측 ⋮ 로 수정/삭제 */
function MyReviewCard({
  review,
  onEdit,
  onDelete,
}: {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div ref={wrapperRef} className="relative flex h-5 items-center justify-between">
          <p className="typo-body-3 flex items-center gap-1 text-gray-6">
            <PinIcon className="text-primary" />
            내 리뷰
          </p>
          <button
            type="button"
            aria-label="내 후기 관리"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-5 items-center justify-center text-gray-4"
          >
            <MoreVerticalIcon />
          </button>

          {menuOpen ? (
            <div className="absolute top-0 right-0 z-20 w-[126px] overflow-hidden rounded-btn bg-white shadow-popover">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="typo-body-3 flex h-12 w-full items-center justify-between px-5 text-gray-5"
              >
                수정하기
                <PencilIcon />
              </button>
              <span className="block h-px bg-gray-2" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="typo-body-3 flex h-12 w-full items-center justify-between px-5 text-gray-5"
              >
                삭제하기
                <TrashIcon />
              </button>
            </div>
          ) : null}
        </div>

        <p className="typo-sub-2 flex items-center gap-1 text-gray-4">
          {review.writer}
          <span aria-hidden="true" className="size-0.5 rounded-full bg-gray-4" />
          {review.date}
        </p>
        <StarRow rating={review.rating} />
      </div>

      <ReviewPhotos count={review.photoCount} />
      {review.content ? (
        <p className="text-xs leading-[18px] text-gray-5">{review.content}</p>
      ) : null}
    </article>
  );
}

/** 일반 후기 — Figma 순서: 별점 → 작성자·날짜 → 사진 → 본문 */
function ReviewItem({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <StarRow rating={review.rating} />
        <p className="typo-sub-2 flex items-center gap-1 text-gray-4">
          {review.writer}
          <span aria-hidden="true" className="size-0.5 rounded-full bg-gray-4" />
          {review.date}
        </p>
      </div>
      <ReviewPhotos count={review.photoCount} />
      <p className="text-xs leading-[18px] text-gray-5">{review.content}</p>
    </article>
  );
}

function DeleteReviewDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-[25px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-review-title"
        className="w-full max-w-[324px] rounded-btn bg-white px-5 pt-[30px] pb-5 shadow-dialog"
      >
        <div className="text-center">
          <h2 id="delete-review-title" className="typo-head-2 text-gray-6">
            후기를 삭제하시겠어요?
          </h2>
          <p className="typo-sub-2 mt-3 text-gray-6">삭제된 후기는 복구할 수 없습니다.</p>
        </div>
        {/* Figma: 버튼 가로 2분할 138×48 gap8 */}
        <div className="mt-10 flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onConfirm}>삭제</Button>
        </div>
      </section>
    </div>
  );
}

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>('지도');
  const [reviews, setReviews] = useState(REVIEWS);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const element = ohaengByKey(PLACE.element)!;

  const myReview = reviews.find((review) => review.isMine);
  const otherReviews = reviews.filter((review) => !review.isMine);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white pb-[106px]">
      <PageHeader
        title="장소 상세"
        className="border-b-0"
        trailing={
          <button
            type="button"
            aria-label="저장하기"
            className="flex size-6 items-center justify-center"
          >
            <img src={iconBookmark} alt="" className="h-[17px] w-[14px]" />
          </button>
        }
      />

      <img
        src={placeImage}
        alt={PLACE.name}
        className="mx-5 mt-[5px] h-[210px] rounded-btn object-cover"
      />

      <h2 className="typo-head-2 mt-5 px-5 text-gray-6">{PLACE.name}</h2>

      <div className="mt-2 flex gap-1 px-5">
        <span className={cn('flex h-8 items-center gap-1 rounded-btn px-3', element.bg)}>
          <span className="typo-body-4 text-white">{element.label}</span>
          <OhaengOrb element={element.key} size={16} />
        </span>
        <span className="typo-body-4 flex h-8 items-center gap-1 rounded-btn border border-gray-2 bg-white px-3 text-gray-5">
          <span>#</span>
          <span>{PLACE.theme}</span>
        </span>
      </div>

      <div className="mx-5 mt-2 flex flex-col gap-2.5 rounded-btn border border-gray-2 px-4 py-3">
        <p className="typo-body-4 text-primary">이 터의 특징은 무엇인가요?</p>
        <p className="typo-sub-3 text-gray-5">{PLACE.feature}</p>
      </div>

      <nav className="mt-4 flex gap-[30px] px-8">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'typo-body-3 flex flex-col items-center gap-1.5',
              tab === t ? 'text-gray-6' : 'text-gray-4',
            )}
          >
            <span>
              {t}
              {t === '후기' && (
                <span className={tab === t ? 'text-primary' : 'text-gray-4'}> {reviews.length}</span>
              )}
            </span>
            <span
              className={cn('h-0.5 w-full rounded-[2px]', tab === t ? 'bg-primary' : 'bg-transparent')}
            />
          </button>
        ))}
      </nav>
      <div className="h-px w-full bg-gray-3" />

      <div className="flex-1">
        {tab === '지도' && (
          <div className="px-5 pt-4">
            {/* ponytail: 지도 SDK는 새 dependency라 금지, SDK 결정 후 교체 */}
            <div className="h-40 rounded-btn bg-placeholder" />
            <p className="typo-body-3 mt-2.5 pl-2.5 text-gray-6">{PLACE.address}</p>
            <p className="typo-sub-3 mt-1.5 pl-2.5 text-gray-6">{PLACE.addressDetail}</p>
          </div>
        )}

        {tab === '후기' && (
          <div className="pt-4">
            {myReview ? (
              <>
                <div className="px-5">
                  <MyReviewCard
                    review={myReview}
                    onEdit={() => navigate(`/place/${id}/review/edit`)}
                    onDelete={() => setDeleteTarget(myReview.id)}
                  />
                </div>
                {/* Figma: 고정된 내 후기와 나머지 후기를 8px full-bleed 띠로 분리 */}
                <div aria-hidden="true" className="mt-4 h-2 bg-gray-2" />
              </>
            ) : null}

            <div className="flex flex-col gap-3 px-5 pt-4">
              {otherReviews.map((review, index) => (
                <div key={review.id} className="flex flex-col gap-3">
                  {index > 0 ? <span className="h-px bg-gray-3" /> : null}
                  <ReviewItem review={review} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 z-10 flex w-full max-w-[390px] -translate-x-1/2 gap-[7px] px-5">
        <Button onClick={() => navigate(`/place/${id}/review`)}>다녀왔어요</Button>
        <Button variant="secondary">길찾기</Button>
      </div>

      {deleteTarget ? (
        <DeleteReviewDialog
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            // TODO: 후기 삭제 API 연동
            setReviews((current) => current.filter((review) => review.id !== deleteTarget));
            setDeleteTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}
