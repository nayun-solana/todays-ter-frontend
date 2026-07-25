import { useEffect, useRef, useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { useParams } from 'react-router';

// import type { ApiError } from '../../api/types';
// import { getVisitedReviewDetail } from '../../api/record';
import type { VisitedReviewDetail } from '../../types/review/visitedReview';
import Button from './components/Button';
import DeleteReviewModal from './components/DeleteReviewModal';
import ReviewHeader from './components/ReviewHeader';
import ReviewMoreMenu from './components/ReviewMoreMenu';
import StarRating from './components/StarRating';

/** "2025-06-28" → "2025.06.28" */
function formatVerifiedAt(date: string) {
  return date.replaceAll('-', '.');
}

/** API 연동 전 더미 */
const DUMMY_REVIEW: VisitedReviewDetail = {
  visitId: 10,
  placeId: 2,
  placeName: '청계천 모전교',
  visitVerifiedAt: '2025-06-28',
  rating: 4,
  content:
    '생각이 많았던 날이었는데, 물길을 따라 걷다 보니 마음이 조금 가라앉았다. 조용히 혼자 있기 좋은 터였다.',
  imageUrls: [],
  createdAt: '2026-07-19T10:00:00',
  updatedAt: '2026-07-19T10:00:00',
};

// type FetchResult = {
//   visitId: string;
//   review?: VisitedReviewDetail;
//   errorMessage?: string;
// };

export default function ReviewDetailPage() {
  const { id: visitId } = useParams();
  const review = DUMMY_REVIEW;
  const photos = review.imageUrls;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // const [result, setResult] = useState<FetchResult | null>(null);
  //
  // useEffect(() => {
  //   if (!visitId) return;
  //
  //   let cancelled = false;
  //
  //   getVisitedReviewDetail(visitId)
  //     .then((review) => {
  //       if (!cancelled) setResult({ visitId, review });
  //     })
  //     .catch((error: ApiError) => {
  //       if (!cancelled) {
  //         setResult({
  //           visitId,
  //           errorMessage: error.message || '후기를 불러오지 못했습니다.',
  //         });
  //       }
  //     });
  //
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [visitId]);
  //
  // const isCurrent = result?.visitId === visitId;
  // const isLoading = Boolean(visitId) && !isCurrent;
  // const review = isCurrent ? result?.review : undefined;
  // const errorMessage = !visitId
  //   ? '후기 정보가 없습니다.'
  //   : isCurrent
  //     ? result?.errorMessage
  //     : undefined;
  // const photos = review?.imageUrls ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-1" data-visit-id={visitId}>
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
                  // TODO: 후기 수정 화면 이동
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

      <div className="flex flex-1 flex-col gap-3">
        <section className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4">
          <div className="size-25 shrink-0 overflow-hidden rounded-xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">
              방문 인증 완료 · {formatVerifiedAt(review.visitVerifiedAt)}
            </p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">
              {review.placeName}
            </h2>
          </div>
        </section>

        <section className="mx-5 flex flex-col gap-3 pt-1">
          <StarRating value={review.rating} readOnly />

          <p className="min-h-24 rounded-2xl border border-gray-3 bg-white px-4 py-3 text-xs leading-relaxed text-gray-6">
            {review.content}
          </p>

          {photos.length > 0 ? (
            <ul className="flex gap-3 overflow-x-auto pl-1">
              {photos.map((photoUrl) => (
                <li
                  key={photoUrl}
                  className="size-20 shrink-0 overflow-hidden rounded-2xl border border-primary-light bg-white"
                >
                  <img src={photoUrl} alt="" className="size-full object-cover" />
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="flex-1" />

        <Button className="mx-5 mb-5 w-auto">스토리 공유하기</Button>
      </div>

      {isDeleteModalOpen ? (
        <DeleteReviewModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            // TODO: 후기 삭제 API 연동
            setIsDeleteModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
