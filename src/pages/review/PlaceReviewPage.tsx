import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FileAttachButton from '../../components/FileAttachButton';
import PageHeader from '../../components/PageHeader';
import TextInput from '../../components/TextInput';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

/** 페이지 더미 — API 연동 전 */
const PLACE = {
  name: '청계천 모전교',
  verifiedAt: '2025.06.28',
};

/** 수정 모드에서 불러오는 기존 후기 더미 — API 연동 시 교체 */
const MY_REVIEW = {
  rating: 5,
  memo: '생각이 많았던 날이었는데, 물길을 따라 걷다 보니\n마음이 조금 가라앉았다. 조용히 혼자 있기 좋은 터였다.',
};

interface PlaceReviewPageProps {
  /** edit: 기존 후기를 불러와 수정. 변경이 있을 때만 저장 가능 */
  mode?: 'create' | 'edit';
}

export default function PlaceReviewPage({ mode = 'create' }: PlaceReviewPageProps) {
  const navigate = useNavigate();
  const { id: placeId } = useParams();
  const isEdit = mode === 'edit';
  const [rating, setRating] = useState(isEdit ? MY_REVIEW.rating : 0);
  const [memo, setMemo] = useState(isEdit ? MY_REVIEW.memo : '');

  // Figma: 작성은 별점만 있으면 저장, 수정은 값이 바뀌어야 저장 활성
  const canSubmit = isEdit
    ? rating > 0 && (rating !== MY_REVIEW.rating || memo !== MY_REVIEW.memo)
    : rating > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1" data-place-id={placeId}>
      {/* 수정 화면은 Figma 실측(헤더 99px, X 12×12 @20,60)에 맞춰 PageHeader를 쓴다.
          작성 화면은 기존 ReviewHeader 유지 — 다른 후기 플로우와 공유하는 컴포넌트라 건드리지 않음 */}
      {isEdit ? (
        <PageHeader
          title="후기 수정하기"
          leading="close"
          backTo={`/place/${placeId}`}
          className="border-gray-2"
        />
      ) : (
        <ReviewHeader title="후기 작성하기" />
      )}

      <div className="flex flex-1 flex-col gap-3">
        {/* TODO: placeId로 장소/방문 인증 정보 조회 */}
        <section className="flex items-center gap-5 bg-white border-b border-gray-2 px-5 py-4">
          <div className="size-[100px] shrink-0 rounded-xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">방문 인증 완료 · {PLACE.verifiedAt}</p>
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
            // TODO: 후기 저장/수정 API 연동
            if (isEdit) {
              navigate(`/place/${placeId}`);
              return;
            }
            navigate(`/place/${placeId}/review/complete`);
          }}
        >
          {isEdit ? '수정 완료' : '후기 저장하기'}
        </Button>
      </div>
    </div>
  );
}
