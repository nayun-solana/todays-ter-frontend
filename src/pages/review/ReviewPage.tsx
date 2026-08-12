import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { ApiError } from '../../api/types';
import FileAttachButton from '../../components/FileAttachButton';
import OhaengBadge from '../../components/OhaengBadge';
import TextInput from '../../components/TextInput';
import { useSubmitRecord, useSubmitRecordUpdate } from '../../hooks/record/useRecord';
import { useRecommendationDetail } from '../../hooks/recommendation/useRecommendation';
import { useRecordDetail } from '../../hooks/review/useReview';
import { ohaengByKey } from '../../lib/ohaeng';
import { viewStateOf } from '../../lib/queryState';
import { toOhaengKey } from '../../lib/ohaeng';
import {
  recordDetailImagesOf,
  type RecordDetailImage,
  type RecordDetailResponse,
} from '../../types/record/record';
import Button from '../../components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from '../../components/StarRating';
import { loadFailureMessageBrief } from '../../lib/messages';

type ReviewPageProps = {
  mode?: 'create' | 'edit';
};

/** ISO/날짜 문자열 → "2025.06.28" */
function formatDate(date: string) {
  return date.slice(0, 10).replaceAll('-', '.');
}

function CreateReviewForm({ placeIdParam }: { placeIdParam?: string }) {
  const navigate = useNavigate();
  const placeId = Number(placeIdParam);
  const detailQuery = useRecommendationDetail(placeIdParam);
  const submitRecord = useSubmitRecord();
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const viewState = viewStateOf(detailQuery);
  const place = detailQuery.data;
  const elementLabel = place?.primaryElement
    ? ohaengByKey(toOhaengKey(place.primaryElement.code))?.label
    : undefined;
  const hashtag = place?.topCategories[0];
  const canSubmit =
    rating > 0 &&
    Number.isFinite(placeId) &&
    placeId > 0 &&
    !submitRecord.isPending &&
    viewState === 'ready';

  const handleSubmit = () => {
    if (!canSubmit || !place) return;

    submitRecord.mutate(
      {
        placeId,
        type: 'RECORD',
        rating,
        content: memo,
        files,
      },
      {
        onSuccess: (result) => {
          navigate(`/matched-ter/${placeId}/review/complete`, {
            replace: true,
            state: { matchedTerName: result.placeName || place.placeName },
          });
        },
      },
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1">
      <ReviewHeader title="방문 기록하기" />

      {viewState === 'loading' ? (
        <p className="px-5 py-8 text-sm text-gray-4">불러오는 중…</p>
      ) : viewState === 'failed' || !place ? (
        <p className="px-5 py-8 text-sm text-gray-4">{loadFailureMessageBrief('장소 정보')}</p>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <section className="flex items-center gap-4 border-b border-gray-2 bg-white px-5 py-4">
            <div className="size-25 shrink-0 overflow-hidden rounded-2xl bg-gray-3">
              {place.imageUrl ? (
                <img src={place.imageUrl} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-4">오늘 추천받은 터</p>
              <h2 className="mt-1 truncate text-sm font-bold text-gray-6">{place.placeName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {elementLabel ? (
                  <OhaengBadge element={elementLabel} className="px-3 py-2 text-xs" />
                ) : null}
                {hashtag ? (
                  <span className="rounded-full border border-gray-3 bg-white px-3 py-2 typo-body-4 text-gray-5">
                    # {hashtag}
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mx-4 flex flex-col gap-3 rounded-2xl border border-gray-2 bg-white p-5">
            <h3 className="text-sm font-bold text-gray-6">별점을 선택해주세요</h3>
            <StarRating value={rating} onChange={setRating} />
            <span className="mt-2 text-sm font-bold text-gray-6">오늘 기운은 어땠나요?</span>
            <TextInput
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="한 줄 메모를 남겨보세요"
              rows={4}
            />

            <FileAttachButton maxCount={1} onFilesChange={setFiles} />
          </section>

          {submitRecord.isError ? (
            <p className="px-5 text-sm text-ohaeng-fire">
              {(submitRecord.error as unknown as ApiError)?.message ?? '저장에 실패했습니다.'}
            </p>
          ) : null}

          <div className="flex-1" />

          <Button
            size="padded"
            disabled={!canSubmit}
            className="mx-5 mb-5 w-auto"
            onClick={handleSubmit}
          >
            {submitRecord.isPending ? '저장 중…' : '방문 기록 저장하기'}
          </Button>
        </div>
      )}
    </div>
  );
}

function EditReviewForm({
  recordId,
  initial,
}: {
  recordId: string;
  initial: RecordDetailResponse;
}) {
  const navigate = useNavigate();
  const updateRecord = useSubmitRecordUpdate();
  const initialImages = recordDetailImagesOf(initial);
  const [rating, setRating] = useState(initial.rating);
  const [memo, setMemo] = useState(initial.content);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<RecordDetailImage[]>(initialImages);
  const headerPhoto = existingImages[0]?.imageUrl ?? initialImages[0]?.imageUrl;

  const imagesChanged =
    files.length > 0 ||
    existingImages.length !== initialImages.length ||
    existingImages.some((image, index) => image.key !== initialImages[index]?.key);

  const canSubmit =
    rating > 0 &&
    (rating !== initial.rating || memo !== initial.content || imagesChanged) &&
    !updateRecord.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const keepImageIds = existingImages
      .map((image) => image.imageId)
      .filter((imageId): imageId is number => imageId != null);
    const canSendImageIds =
      existingImages.length === 0 ||
      keepImageIds.length === existingImages.length ||
      files.length > 0;

    updateRecord.mutate(
      {
        recordId,
        rating,
        content: memo,
        files,
        replaceImages: imagesChanged && canSendImageIds,
        keepImageIds,
      },
      {
        onSuccess: () => {
          navigate(`/review/${recordId}`, { replace: true });
        },
      },
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1">
      <ReviewHeader title="후기 수정하기" />

      <div className="flex flex-1 flex-col gap-3">
        <section className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4">
          <div className="size-25 shrink-0 overflow-hidden rounded-xl bg-gray-3">
            {headerPhoto ? (
              <img src={headerPhoto} alt="" className="size-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">방문 인증 완료 · {formatDate(initial.createdAt)}</p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">{initial.placeName}</h2>
          </div>
        </section>

        <section className="mx-4 flex flex-col gap-3 rounded-2xl border border-gray-2 bg-white p-5">
          <h3 className="text-sm font-bold text-gray-6">별점을 선택해주세요</h3>
          <StarRating value={rating} onChange={setRating} />
          <span className="mt-2 text-sm font-bold text-gray-6">오늘 기운은 어땠나요?</span>
          <TextInput
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="한 줄 메모를 남겨보세요"
            rows={4}
          />

          <FileAttachButton
            maxCount={5}
            existingImages={existingImages.map((image) => ({
              key: image.key,
              url: image.imageUrl,
            }))}
            onExistingImagesChange={(next) => {
              const nextKeys = new Set(next.map((image) => image.key));
              setExistingImages((prev) => prev.filter((image) => nextKeys.has(image.key)));
            }}
            onFilesChange={setFiles}
          />
        </section>

        {updateRecord.isError ? (
          <p className="px-5 text-sm text-ohaeng-fire">
            {(updateRecord.error as unknown as ApiError)?.message ?? '수정에 실패했습니다.'}
          </p>
        ) : null}

        <div className="flex-1" />

        <Button
          size="padded"
          disabled={!canSubmit}
          className="mx-5 mb-5 w-auto"
          onClick={handleSubmit}
        >
          {updateRecord.isPending ? '수정 중…' : '후기 수정하기'}
        </Button>
      </div>
    </div>
  );
}

export default function ReviewPage({ mode = 'create' }: ReviewPageProps) {
  const { id: placeIdParam, recordId } = useParams();
  const isEdit = mode === 'edit';
  const reviewQuery = useRecordDetail(isEdit ? recordId : undefined);

  if (isEdit) {
    if (reviewQuery.isPending) {
      return (
        <div className="flex min-h-dvh flex-col bg-gray-1">
          <ReviewHeader title="후기 수정하기" />
          <p className="px-5 py-8 text-sm text-gray-4">불러오는 중…</p>
        </div>
      );
    }

    if (reviewQuery.isError || !reviewQuery.data || !recordId) {
      return (
        <div className="flex min-h-dvh flex-col bg-gray-1">
          <ReviewHeader title="후기 수정하기" />
          <p className="px-5 py-8 text-sm text-gray-4">{loadFailureMessageBrief('후기')}</p>
        </div>
      );
    }

    return <EditReviewForm recordId={recordId} initial={reviewQuery.data} />;
  }

  return <CreateReviewForm placeIdParam={placeIdParam} />;
}
