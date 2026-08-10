import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { ApiError } from '../../api/types';
import FileAttachButton from '../../components/FileAttachButton';
import PageHeader from '../../components/PageHeader';
import TextInput from '../../components/TextInput';
import { useSubmitRecord } from '../../hooks/record/useRecord';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

/** 페이지 더미 — 장소 메타 API 연동 전 */
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
  const { id: placeIdParam } = useParams();
  const placeId = Number(placeIdParam);
  const isEdit = mode === 'edit';
  const submitRecord = useSubmitRecord();
  const [rating, setRating] = useState(isEdit ? MY_REVIEW.rating : 0);
  const [memo, setMemo] = useState(isEdit ? MY_REVIEW.memo : '');
  const [files, setFiles] = useState<File[]>([]);

  // Figma: 작성은 별점만 있으면 저장, 수정은 값이 바뀌어야 저장 활성
  const canSubmitBase = isEdit
    ? rating > 0 && (rating !== MY_REVIEW.rating || memo !== MY_REVIEW.memo)
    : rating > 0;
  const canSubmit =
    canSubmitBase && Number.isFinite(placeId) && placeId > 0 && !submitRecord.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // TODO: 수정 API 연동 시 edit 분기
    if (isEdit) {
      navigate(`/place/${placeId}`);
      return;
    }

    submitRecord.mutate(
      {
        placeId,
        type: 'REVIEW',
        rating,
        content: memo,
        files,
      },
      {
        onSuccess: () => {
          navigate(`/place/${placeId}/review/complete`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1" data-place-id={placeIdParam}>
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
        <section className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4">
          <div className="size-25 shrink-0 rounded-xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">방문 인증 완료 · {PLACE.verifiedAt}</p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">{PLACE.name}</h2>
          </div>
        </section>

        <section className="mx-4 rounded-2xl border border-gray-2 bg-white p-5">
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

        {!isEdit ? (
          <FileAttachButton
            className="mx-6"
            maxCount={5}
            onFilesChange={setFiles}
          />
        ) : null}
        <div className="flex-1" />

        {submitRecord.isError ? (
          <p className="px-5 text-sm text-ohaeng-fire">
            {(submitRecord.error as unknown as ApiError)?.message ?? '저장에 실패했습니다.'}
          </p>
        ) : null}

        <Button disabled={!canSubmit} className="mx-5 mb-5 w-auto" onClick={handleSubmit}>
          {submitRecord.isPending
            ? '저장 중…'
            : isEdit
              ? '수정 완료'
              : '후기 저장하기'}
        </Button>
      </div>
    </div>
  );
}
