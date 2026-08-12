import { useEffect, useRef, useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { useDeleteRecord } from '../../hooks/record/useRecord';
import { useRecordDetail } from '../../hooks/review/useReview';
import { recordDetailImagesOf } from '../../types/record/record';
import ShareCardModal from '../../components/ShareCardModal';
import type { OhaengLabel } from '../../lib/ohaeng';
import Button from '../../components/Button';
import DeleteReviewModal from '../../components/DeleteReviewModal';
import ReviewHeader from './components/ReviewHeader';
import ReviewMoreMenu from '../../components/ReviewMoreMenu';
import StarRating from '../../components/StarRating';
import { loadFailureMessageBrief } from '../../lib/messages';
import { getPlaceThumbnailUrl } from '../../lib/placeThumbnail';

type ReviewDetailLocationState = {
  element?: OhaengLabel;
};

/** ISO/날짜 문자열 → "2025.06.28" */
function formatDate(date: string) {
  return date.slice(0, 10).replaceAll('-', '.');
}

export default function ReviewDetailPage() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const { state } = useLocation();
  const listElement = (state as ReviewDetailLocationState | null)?.element;
  const reviewQuery = useRecordDetail(recordId);
  const deleteRecord = useDeleteRecord();
  const review = reviewQuery.data;
  const photos = review ? recordDetailImagesOf(review).map((image) => image.imageUrl) : [];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isMenuOpen]);

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1" data-record-id={recordId}>
      <ReviewHeader
        title="후기 상세"
        rightSlot={
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="더보기"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex size-6 items-center justify-center text-gray-5"
            >
              <EllipsisVertical size={24} aria-hidden />
            </button>
            {isMenuOpen ? (
              <ReviewMoreMenu
                onEdit={() => {
                  setIsMenuOpen(false);
                  if (recordId) navigate(`/review/${recordId}/edit`);
                }}
                onDelete={() => {
                  setIsMenuOpen(false);
                  setIsDeleteModalOpen(true);
                }}
              />
            ) : null}
          </div>
        }
      />

      {reviewQuery.isPending ? (
        <p className="px-5 py-8 text-sm text-gray-4">불러오는 중…</p>
      ) : reviewQuery.isError ? (
        <p className="px-5 py-8 text-sm text-gray-4">{loadFailureMessageBrief('후기')}</p>
      ) : review ? (
        <div className="flex flex-1 flex-col gap-3">
          <section className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4">
            <PlaceThumbnail placeId={review.placeId} placeName={review.placeName} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-4">방문 인증 완료 · {formatDate(review.createdAt)}</p>
              <h2 className="mt-2 truncate text-base font-bold text-gray-6">{review.placeName}</h2>
            </div>
          </section>

          <section className="mx-5 flex flex-col gap-3 pt-1">
            <StarRating value={review.rating} readOnly />

            <p className="min-h-24 rounded-2xl border border-gray-3 bg-white px-4 py-3 text-xs leading-relaxed text-gray-6">
              {review.content}
            </p>

            {photos.length > 0 ? (
              <ul className="flex gap-3 overflow-x-auto pl-1">
                {photos.map((url) => (
                  <li
                    key={url}
                    className="size-20 shrink-0 overflow-hidden rounded-2xl border border-primary-light bg-white"
                  >
                    <img src={url} alt="" className="size-full object-cover" />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <div className="flex-1" />

          <Button size="padded" className="mx-5 mb-5 w-auto" onClick={() => setIsShareOpen(true)}>
            스토리 공유하기
          </Button>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <DeleteReviewModal
          onCancel={() => {
            if (!deleteRecord.isPending) setIsDeleteModalOpen(false);
          }}
          onConfirm={() => {
            if (!recordId || !review || deleteRecord.isPending) return;
            deleteRecord.mutate(
              { recordId, placeId: review.placeId },
              {
                onSuccess: () => {
                  setIsDeleteModalOpen(false);
                  navigate('/record', { replace: true });
                },
              },
            );
          }}
        />
      ) : null}

      {isShareOpen && review ? (
        <ShareCardModal
          placeId={review.placeId}
          fallbackPlaceName={review.placeName}
          element={listElement}
          onClose={() => setIsShareOpen(false)}
        />
      ) : null}

      {deleteRecord.isError ? (
        <p className="fixed right-5 bottom-2 left-5 text-center text-xs text-danger">
          후기 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : null}
    </div>
  );
}

/** GET /places/{placeId}/thumbnail — 실패 시 회색 폴백 */
function PlaceThumbnail({ placeId, placeName }: { placeId: number; placeName: string }) {
  const thumbnailUrl = getPlaceThumbnailUrl(placeId);
  const [failed, setFailed] = useState(false);

  return (
    <div className="size-25 shrink-0 overflow-hidden rounded-xl">
      {failed ? (
        <div className="size-full bg-placeholder" />
      ) : (
        <img
          src={thumbnailUrl}
          alt={placeName}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
