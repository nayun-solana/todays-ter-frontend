import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FileAttachButton from '../../components/FileAttachButton';
import TextInput from '../../components/TextInput';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

/** 페이지 더미 — API 연동 전 */
const PLACE = {
  name: '청계천 모전교',
  verifiedAt: '2025.06.28',
};

export default function PlaceReviewPage() {
  const navigate = useNavigate();
  const { id: placeId } = useParams();
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');
  const canSubmit = rating > 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-1" data-place-id={placeId}>
      <ReviewHeader title="후기 작성하기" />

      <div className="flex flex-1 flex-col gap-3">
        {/* TODO: placeId로 장소/방문 인증 정보 조회 */}
        <section className="flex items-center gap-5 bg-white border-b border-gray-2 px-5 py-4">
          <div className="size-[100px] shrink-0 rounded-xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">
              방문 인증 완료 · {PLACE.verifiedAt}
            </p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">{PLACE.name}</h2>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-2 bg-white p-5 mx-4">
          <h3 className="text-sm font-bold text-gray-6">별점을 선택해주세요</h3>
          <StarRating value={rating} onChange={setRating} className="mt-3" />

          <TextInput
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="이 장소의 분위기는 어떠셨나요?"
            rows={4}
            className="mt-5"
          />
        </section>

        <FileAttachButton className="mx-6" />
        <div className="flex-1" />

        <Button
          disabled={!canSubmit}
          className="mb-5 mx-5 w-auto"
          onClick={() => {
            // TODO: 후기 저장 API 연동
            navigate(`/place/${placeId}/review/complete`);
          }}
        >
          후기 저장하기
        </Button>
      </div>
    </div>
  );
}
