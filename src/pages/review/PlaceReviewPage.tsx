import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FileAttachButton from '../../components/FileAttachButton';
import PageHeader from '../../components/PageHeader';
import TextInput from '../../components/TextInput';
import { usePlaceDetail, usePlaceReviews } from '../../hooks/place/usePlace';
import {
  useCreateRecord,
  useUpdateRecord,
  useUploadRecordImages,
} from '../../hooks/record/useRecord';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

interface PlaceReviewPageProps {
  /** edit: 기존 후기를 불러와 수정. 변경이 있을 때만 저장 가능 */
  mode?: 'create' | 'edit';
}

export default function PlaceReviewPage({ mode = 'create' }: PlaceReviewPageProps) {
  const navigate = useNavigate();
  const { id: placeId } = useParams();
  const isEdit = mode === 'edit';
  const placeQuery = usePlaceDetail(placeId);
  const reviewsQuery = usePlaceReviews(isEdit ? placeId : undefined);
  const createRecordMutation = useCreateRecord();
  const updateRecordMutation = useUpdateRecord();
  const uploadImagesMutation = useUploadRecordImages();
  const [draft, setDraft] = useState<{ rating: number; memo: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const myReview = reviewsQuery.data?.myReview;
  const form = draft ?? { rating: myReview?.rating ?? 0, memo: myReview?.content ?? '' };
  const { rating, memo } = form;
  const initialRating = myReview?.rating ?? 0;
  const initialMemo = myReview?.content ?? '';
  const setRating = (nextRating: number) =>
    setDraft((current) => ({ ...(current ?? form), rating: nextRating }));
  const setMemo = (nextMemo: string) =>
    setDraft((current) => ({ ...(current ?? form), memo: nextMemo }));

  // Figma: 작성은 별점만 있으면 저장, 수정은 값이 바뀌어야 저장 활성
  const canSubmit = isEdit
    ? rating > 0 && memo.trim().length > 0 && (rating !== initialRating || memo !== initialMemo)
    : rating > 0 && memo.trim().length > 0;

  const isPending =
    createRecordMutation.isPending ||
    updateRecordMutation.isPending ||
    uploadImagesMutation.isPending;

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
        <section className="flex items-center gap-5 bg-white border-b border-gray-2 px-5 py-4">
          <div className="size-[100px] shrink-0 rounded-xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-4">
              {placeQuery.data?.isVisited ? '방문 인증 완료' : '방문 장소'}
            </p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">
              {placeQuery.data?.placeName ?? '장소 정보를 불러오는 중입니다.'}
            </h2>
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

        <FileAttachButton className="mx-6" maxCount={5} onFilesChange={setFiles} />
        <div className="flex-1" />

        <Button
          disabled={
            !canSubmit ||
            isPending ||
            placeQuery.isPending ||
            placeQuery.isError ||
            (isEdit && (reviewsQuery.isPending || reviewsQuery.isError))
          }
          className="mb-5 mx-5 w-auto"
          onClick={async () => {
            if (!placeId || !canSubmit || !placeQuery.data) return;

            try {
              const uploadedImages = files.length
                ? await uploadImagesMutation.mutateAsync(files)
                : null;
              const imageIds = uploadedImages?.images.map((image) => image.imageId) ?? [];

              if (isEdit && myReview) {
                updateRecordMutation.mutate(
                  {
                    recordId: myReview.reviewId,
                    body: { rating, content: memo.trim(), imageIds },
                  },
                  { onSuccess: () => navigate(`/place/${placeId}`) },
                );
                return;
              }

              createRecordMutation.mutate(
                {
                  placeId: Number(placeId),
                  type: 'REVIEW',
                  rating,
                  content: memo.trim(),
                  imageIds,
                },
                { onSuccess: () => navigate(`/place/${placeId}/review/complete`) },
              );
            } catch {
              // mutation state renders the error message below
            }
          }}
        >
          {isEdit ? '수정 완료' : '후기 저장하기'}
        </Button>
        {createRecordMutation.isError ||
        updateRecordMutation.isError ||
        uploadImagesMutation.isError ? (
          <p className="mb-5 px-5 text-center text-xs text-danger">
            후기 저장에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : null}
      </div>
    </div>
  );
}
