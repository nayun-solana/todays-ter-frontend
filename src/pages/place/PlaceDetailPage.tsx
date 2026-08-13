import { useEffect, useRef, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { apiErrorStatusOf } from '../../api/types';
import iconStar from '../../assets/icon-star.svg';
import Button from '../../components/Button';
import OhaengOrb from '../../components/OhaengOrb';
import PageHeader from '../../components/PageHeader';
import SectionError from '../../components/SectionError';
import { MoreVerticalIcon, PencilIcon, PinIcon, TrashIcon } from '../../components/icons';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import {
  usePlaceBookmarkToggle,
  usePlaceDetail,
  usePlaceReviews,
} from '../../hooks/place/usePlace';
import { useDeleteRecord } from '../../hooks/record/useRecord';
import { cn } from '../../lib/cn';
import { loadNaverMaps } from '../../lib/naverMaps';
import { ohaengByLabel } from '../../lib/ohaeng';
import { getPlaceThumbnailUrl } from '../../lib/placeThumbnail';
import DeleteReviewModal from '../../components/DeleteReviewModal';
import { loadFailureMessage, loadFailureMessageBrief, loadingMessage } from '../../lib/messages';

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

function PlaceMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapUnavailable, setIsMapUnavailable] = useState(false);

  useEffect(() => {
    const mapElement = mapRef.current;
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
    if (!mapElement || !clientId) {
      setIsMapUnavailable(true);
      return;
    }

    let isUnmounted = false;
    loadNaverMaps(clientId)
      .then((naver) => {
        if (isUnmounted) return;

        const position = new naver.maps.LatLng(latitude, longitude);
        const map = new naver.maps.Map(mapElement, {
          center: position,
          zoom: 15,
          zoomControl: false,
        });
        new naver.maps.Marker({ map, position });
      })
      .catch(() => {
        if (!isUnmounted) setIsMapUnavailable(true);
      });

    return () => {
      isUnmounted = true;
    };
  }, [latitude, longitude]);

  // 지도를 못 띄워도 주소는 아래에 그대로 있다. 빈 회색 박스만 남으면 왜 안 보이는지 알 수 없다.
  if (isMapUnavailable) {
    return (
      <div className="flex h-40 items-center justify-center rounded-btn bg-placeholder px-5">
        <p className="typo-sub-2 text-center text-gray-5">
          지도를 불러오지 못했어요. 아래 주소를 확인해주세요.
        </p>
      </div>
    );
  }

  return <div ref={mapRef} className="h-40 rounded-btn" />;
}

function PlaceThumbnail({ placeId, placeName }: { placeId: number; placeName: string }) {
  const [isThumbnailUnavailable, setIsThumbnailUnavailable] = useState(false);

  if (isThumbnailUnavailable) {
    return <div className="mx-5 mt-[5px] h-[210px] rounded-btn bg-placeholder" />;
  }

  return (
    <img
      src={getPlaceThumbnailUrl(placeId)}
      alt={placeName}
      className="mx-5 mt-[5px] h-[210px] rounded-btn object-cover"
      onError={() => setIsThumbnailUnavailable(true)}
    />
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

/**
 * 로딩 자리표시자. 실제 영역과 같은 높이를 잡아 데이터가 들어올 때 화면이 튀지 않게 한다.
 * 폭은 실물과 같이 여백(mx-5)을 따라간다 — 고정하는 건 높이뿐이다.
 */
function PlaceDetailSkeleton() {
  return (
    <div className="min-h-dvh w-full bg-white" aria-busy="true">
      <PageHeader title="장소 상세" className="border-b-0" />
      <span className="sr-only" role="status">
        {loadingMessage('장소 정보')}
      </span>
      <div className="mx-5 mt-[5px] h-[210px] animate-pulse rounded-btn bg-gray-2" />
      <div className="mx-5 mt-5 h-7 w-40 max-w-full animate-pulse rounded-lg bg-gray-2" />
      <div className="mt-2 flex gap-1 px-5">
        <div className="h-8 w-[72px] animate-pulse rounded-btn bg-gray-2" />
        <div className="h-8 w-20 animate-pulse rounded-btn bg-gray-2" />
      </div>
      <div className="mx-5 mt-2 h-[86px] animate-pulse rounded-btn bg-gray-2" />
    </div>
  );
}

export default function PlaceDetailPage() {
  const navigate = useNavigate();
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
  const bookmark = usePlaceBookmarkToggle(id);
  const deleteReviewMutation = useDeleteRecord();
  const place = placeQuery.data;

  if (placeQuery.isPending) return <PlaceDetailSkeleton />;

  if (placeQuery.isError || !place) {
    // 없는 장소(404)나 잘못된 id(400)는 다시 시도해봐야 결과가 같다.
    // 재시도 버튼을 물리면 빠져나갈 길이 없으므로 탐색으로 돌려보낸다.
    const status = apiErrorStatusOf(placeQuery.error);
    const isUnreachable = status === 404 || status === 400;

    return (
      <div className="min-h-dvh w-full bg-white">
        <PageHeader title="장소 상세" />
        <div className="px-5 py-8">
          <p className="text-sm text-gray-4">
            {status === 404
              ? '찾을 수 없는 장소예요. 삭제되었을 수 있어요.'
              : status === 400
                ? '잘못된 주소로 들어왔어요.'
                : loadFailureMessageBrief('장소 정보')}
          </p>
          <Button
            variant="secondary"
            onClick={() => (isUnreachable ? navigate('/search') : placeQuery.refetch())}
            className="mt-4"
          >
            {isUnreachable ? '탐색으로 돌아가기' : '다시 시도'}
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
          // 저장도 회원 전용이다. 게스트가 누르면 /login으로 튕겼는데, 아래 '다녀왔어요'와
          // 같은 화면에서 규칙이 정반대였다(그쪽은 잠금). 장소를 보다가 저장을 눌렀다고
          // 로그인 화면으로 끌려가면 보던 맥락이 끊긴다 — 처음부터 잠가 둔다.
          <button
            type="button"
            aria-label={isMember ? (place.isSaved ? '저장 해제' : '저장') : '저장 (로그인 필요)'}
            aria-pressed={place.isSaved}
            disabled={!isMember || bookmark.isPending}
            onClick={() => bookmark.mutate(!place.isSaved)}
            className="flex size-6 items-center justify-center text-gray-4 disabled:opacity-40"
          >
            <Bookmark
              className={place.isSaved ? 'size-6 text-primary' : 'size-6 text-gray-4'}
              fill={place.isSaved ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        }
      />

      <PlaceThumbnail key={place.placeId} placeId={place.placeId} placeName={placeName} />

      {/* 저장 실패는 낙관적 갱신을 되돌리기만 해서, 켜졌던 북마크가 조용히 꺼진다.
          왜 되돌아갔는지 알려준다. */}
      {bookmark.isError ? (
        <p role="alert" aria-live="polite" className="mt-2 px-5 text-xs text-danger">
          저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : null}

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
            <PlaceMap latitude={place.latitude} longitude={place.longitude} />
            <p className="typo-body-3 mt-2.5 pl-2.5 text-gray-6">{address}</p>
          </div>
        )}

        {tab === '후기' && (
          <div className="pt-4">
            {reviewsQuery.isPending ? (
              <div
                role="status"
                aria-label={loadingMessage('후기')}
                className="flex flex-col gap-2 px-5"
              >
                <div className="h-[17px] w-[92px] animate-pulse rounded bg-gray-2" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-2" />
                <div className="mt-1 h-3 w-full animate-pulse rounded bg-gray-2" />
              </div>
            ) : reviewsQuery.isError ? (
              <SectionError
                className="mx-5"
                message={loadFailureMessage('후기')}
                onRetry={() => void reviewsQuery.refetch()}
              />
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
            ) : otherReviews.length === 0 ? (
              <p className="typo-body-2 px-5 py-[34px] text-center text-gray-5">
                아직 등록된 후기가 없어요
              </p>
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

      {/* `fixed`는 뷰포트 기준이라 앱 셸의 폭 상한이 안 먹는다 — 하단바와 같은 방식으로 직접 맞춘다. */}
      <div className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex w-full max-w-app -translate-x-1/2 gap-[7px] px-5">
        {/* 후기 작성은 회원 전용이다. 게스트가 누르면 /login으로 튕겼는데,
            눌리는 버튼이 튕기는 것보다 처음부터 잠겨 있는 편이 낫다. */}
        <Button disabled={!isMember} onClick={() => navigate(`/place/${id}/review`)}>
          다녀왔어요
        </Button>
        <Button
          variant="secondary"
          disabled={!place.mapUrl}
          onClick={() => place.mapUrl && window.open(place.mapUrl, '_blank', 'noopener,noreferrer')}
        >
          길찾기
        </Button>
      </div>

      {deleteTarget ? (
        <DeleteReviewModal
          isPending={deleteReviewMutation.isPending}
          // 실패하면 모달을 닫지 않는다 — 닫아버리면 왜 안 지워졌는지 알 수 없고
          // 다시 시도하려면 메뉴부터 다시 열어야 한다. 이 자리에서 바로 다시 누르게 한다.
          errorMessage={
            deleteReviewMutation.isError ? '후기를 삭제하지 못했어요. 다시 시도해주세요.' : undefined
          }
          onCancel={() => {
            if (deleteReviewMutation.isPending) return;
            deleteReviewMutation.reset();
            setDeleteTarget(null);
          }}
          onConfirm={() => {
            if (deleteReviewMutation.isPending) return;

            // 후기 목록 무효화는 useDeleteRecord가 한다 — 작성·수정과 같은 규칙을 쓰도록.
            deleteReviewMutation.mutate(
              { recordId: deleteTarget, placeId: place.placeId },
              { onSuccess: () => setDeleteTarget(null) },
            );
          }}
        />
      ) : null}
    </div>
  );
}
