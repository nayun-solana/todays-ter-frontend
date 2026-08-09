import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import iconBookmark from '../../assets/icon-bookmark.svg';
import iconStar from '../../assets/icon-star.svg';
import placeImage from '../../assets/place-cheonggyecheon.png';
import Button from '../../components/Button';
import OhaengOrb from '../../components/OhaengOrb';
import PageHeader from '../../components/PageHeader';
import { MoreVerticalIcon, PencilIcon, PinIcon, TrashIcon } from '../../components/icons';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { usePlaceDetail, usePlaceReviews, placeKeys } from '../../hooks/place/usePlace';
import { useDeleteRecord } from '../../hooks/record/useRecord';
import { cn } from '../../lib/cn';
import { ohaengByLabel } from '../../lib/ohaeng';
import DeleteReviewModal from '../review/components/DeleteReviewModal';

const TABS = ['지도', '후기'] as const;
type Tab = (typeof TABS)[number];

type Review = {
  id: string;
  writer: string;
  date: string;
  rating: number;
  content: string;
  imageUrls: string[];
  isMine?: boolean;
};

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

function ReviewPhotos({ imageUrls }: { imageUrls: string[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {imageUrls.map((imageUrl, index) => (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={`후기 사진 ${index + 1}`}
          className="size-[120px] shrink-0 rounded-btn object-cover"
        />
      ))}
    </div>
  );
}

function toReview(
  review: {
    reviewId: number;
    writerNickname: string;
    rating: number;
    content: string;
    images: { imageUrl: string }[];
    createdAt: string;
  },
  isMine = false,
): Review {
  return {
    id: String(review.reviewId),
    writer: review.writerNickname,
    date: review.createdAt.slice(0, 10).replaceAll('-', '.'),
    rating: review.rating,
    content: review.content,
    imageUrls: review.images.map((image) => image.imageUrl),
    isMine,
  };
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
            <PinIcon className="text-primary-light" />내 리뷰
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

      {review.imageUrls.length > 0 ? <ReviewPhotos imageUrls={review.imageUrls} /> : null}
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
      {review.imageUrls.length > 0 ? <ReviewPhotos imageUrls={review.imageUrls} /> : null}
      <p className="text-xs leading-[18px] text-gray-5">{review.content}</p>
    </article>
  );
}

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  // 장소 상세는 게스트에게 열려 있지만(#109) 후기 작성은 회원 전용이다.
  const { isMember } = useAuthStatus();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() =>
    searchParams.get('tab') === 'reviews' ? '후기' : '지도',
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const placeQuery = usePlaceDetail(id);
  const reviewsQuery = usePlaceReviews(id);
  const deleteReviewMutation = useDeleteRecord();
  const place = placeQuery.data;

  if (placeQuery.isPending) {
    return (
      <div className="min-h-dvh w-full bg-white">
        <PageHeader title="장소 상세" />
        <p className="px-5 py-8 text-sm text-gray-4">장소 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (placeQuery.isError || !place) {
    return (
      <div className="min-h-dvh w-full bg-white">
        <PageHeader title="장소 상세" />
        <div className="px-5 py-8">
          <p className="text-sm text-gray-4">장소 정보를 불러오지 못했습니다.</p>
          <Button variant="secondary" onClick={() => placeQuery.refetch()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  const placeName = place.placeName;
  const element = ohaengByLabel(place.element)!;
  const theme = place.hashtags[0] ?? '터';
  const featureQuestion = place.description.question;
  const feature = place.description.answer;
  const address = place.address;

  const myReview = reviewsQuery.data?.myReview
    ? toReview(reviewsQuery.data.myReview, true)
    : undefined;
  const otherReviews = reviewsQuery.data?.reviews.map((review) => toReview(review)) ?? [];

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
        src={place.imageUrl ?? placeImage}
        alt={placeName}
        className="mx-5 mt-[5px] h-[210px] rounded-btn object-cover"
      />

      <h2 className="typo-head-2 mt-5 px-5 text-gray-6">{placeName}</h2>

      <div className="mt-2 flex gap-1 px-5">
        <span className={cn('flex h-8 items-center gap-1 rounded-btn px-3', element.bg)}>
          <span className="typo-body-4 text-white">{element.label}</span>
          <OhaengOrb element={element.key} size={16} />
        </span>
        <span className="typo-body-4 flex h-8 items-center gap-1 rounded-btn border border-gray-2 bg-white px-3 text-gray-5">
          <span>#</span>
          <span>{theme}</span>
        </span>
      </div>

      <div className="mx-5 mt-2 flex flex-col gap-2.5 rounded-btn border border-gray-2 px-4 py-3">
        <p className="typo-body-4 text-primary">{featureQuestion}</p>
        <p className="typo-sub-3 text-gray-5">{feature}</p>
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
                <span className={tab === t ? 'text-primary' : 'text-gray-4'}>
                  {' '}
                  {reviewsQuery.data?.totalCount ?? place.reviewCount}
                </span>
              )}
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

      <div className="flex-1">
        {tab === '지도' && (
          <div className="px-5 pt-4">
            {/* ponytail: 지도 SDK는 새 dependency라 금지, SDK 결정 후 교체 */}
            <div className="h-40 rounded-btn bg-placeholder" />
            <p className="typo-body-3 mt-2.5 pl-2.5 text-gray-6">{address}</p>
          </div>
        )}

        {tab === '후기' && (
          <div className="pt-4">
            {reviewsQuery.isPending ? (
              <p className="px-5 py-4 text-sm text-gray-4">후기를 불러오는 중입니다.</p>
            ) : reviewsQuery.isError ? (
              <p className="px-5 py-4 text-sm text-gray-4">
                후기를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
              </p>
            ) : myReview ? (
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
        {/* 후기 작성은 회원 전용이다. 게스트가 누르면 /login으로 튕겼는데,
            눌리는 버튼이 튕기는 것보다 처음부터 잠겨 있는 편이 낫다. */}
        <Button disabled={!isMember} onClick={() => navigate(`/place/${id}/review`)}>
          다녀왔어요
        </Button>
        <Button variant="secondary">길찾기</Button>
      </div>

      {deleteTarget ? (
        <DeleteReviewModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteReviewMutation.mutate(deleteTarget, {
              onSuccess: () => {
                void queryClient.invalidateQueries({ queryKey: placeKeys.reviews(id ?? '') });
                setDeleteTarget(null);
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
