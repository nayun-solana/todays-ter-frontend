import { EllipsisVertical } from 'lucide-react';
import { useParams } from 'react-router';

import placeImage from '../../assets/place-cheonggyecheon.png';
import { VISITED_PLACES } from '../record/recordDummyData';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

/** 페이지 더미 — API 연동 전 */
const REVIEW = {
  name: '청계천 모전교',
  verifiedAt: '2025.06.28',
  rating: 5,
  content:
    '생각이 많았던 날이었는데, 물길을 따라 걷다 보니 마음이 조금 가라앉았다. 조용히 혼자 있기 좋은 터였다.',
  imageUrl: placeImage,
  /** 첨부 이미지 URL. 없으면 빈 슬롯으로 표시 */
  photos: [] as readonly string[],
  photoSlotCount: 2,
};

function formatVerifiedAt(date: string) {
  const [month, day] = date.split('/');
  if (!month || !day) return date;
  return `2025.${month.padStart(2, '0')}.${day.padStart(2, '0')}`;
}

export default function ReviewDetailPage() {
  const { id: reviewId } = useParams();
  const place = VISITED_PLACES.find((item) => item.id === reviewId);

  const name = place?.name ?? REVIEW.name;
  const verifiedAt = place ? formatVerifiedAt(place.date) : REVIEW.verifiedAt;
  const imageUrl = place?.imageUrl ?? REVIEW.imageUrl;
  const photoSlots = Math.max(REVIEW.photoSlotCount, REVIEW.photos.length);

  return (
    <div className="flex min-h-screen flex-col bg-gray-1" data-review-id={reviewId}>
      <ReviewHeader
        title="후기 상세"
        rightSlot={
          <button
            type="button"
            aria-label="더보기"
            className="flex size-6 shrink-0 items-center justify-center text-gray-5"
          >
            <EllipsisVertical size={24} aria-hidden />
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-3">
        <section className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4">
          <div className="size-25 shrink-0 overflow-hidden rounded-xl bg-gray-3">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="size-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">방문 인증 완료 · {verifiedAt}</p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">{name}</h2>
          </div>
        </section>

        <section className="mx-5 flex flex-col gap-3 pt-1">
          <StarRating value={REVIEW.rating} readOnly />

          <p className="min-h-24 rounded-2xl border border-gray-3 bg-white px-4 py-3 text-xs leading-relaxed text-gray-6">
            {REVIEW.content}
          </p>

          <ul className="flex gap-3 pl-1">
            {Array.from({ length: photoSlots }, (_, index) => {
              const photoUrl = REVIEW.photos[index];

              return (
                <li
                  key={photoUrl ?? `photo-slot-${index}`}
                  className="size-20 shrink-0 overflow-hidden rounded-2xl border border-primary-light bg-white"
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="size-full object-cover" />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex-1" />

        <Button className="mx-5 mb-5 w-auto">스토리 공유하기</Button>
      </div>
    </div>
  );
}
