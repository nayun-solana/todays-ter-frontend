import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FileAttachButton from '../../components/FileAttachButton';
import PageHeader from '../../components/PageHeader';
import TextInput from '../../components/TextInput';
import { usePlaceDetail, usePlaceReviews } from '../../hooks/place/usePlace';
import type { PlaceReviewItem } from '../../types/place/place';
import {
  useCreateRecord,
  useUpdateRecord,
  useUploadRecordImages,
} from '../../hooks/record/useRecord';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

/**
 * "이미 이 장소에 후기가 있다"는 서버 응답인지.
 * BE는 한 장소당 REVIEW 하나만 허용한다(`RecordService`의 existsByMemberIdAndPlaceIdAndType).
 * 재시도해도 영영 409이므로 "잠시 후 다시 시도"로 안내하면 안 된다.
 */
function isDuplicateReviewError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  return (error as { code?: unknown }).code === 'RECORD409_1';
}

interface PlaceReviewPageProps {
  /** edit: 기존 후기를 불러와 수정. 변경이 있을 때만 저장 가능 */
  mode?: 'create' | 'edit';
}

export default function PlaceReviewPage({ mode = 'create' }: PlaceReviewPageProps) {
  const navigate = useNavigate();
  const { id: placeIdParam } = useParams();
  const placeId = Number(placeIdParam);
  const isEdit = mode === 'edit';
  const placeQuery = usePlaceDetail(placeId);
  // 작성 모드에서도 불러온다. BE는 한 장소당 후기 1개만 허용하므로(RECORD409_1),
  // 이미 쓴 후기가 있는지 **누르기 전에** 알아야 한다.
  const reviewsQuery = usePlaceReviews(placeId);
  const createRecordMutation = useCreateRecord();
  const updateRecordMutation = useUpdateRecord();
  const uploadImagesMutation = useUploadRecordImages();
  const [draft, setDraft] = useState<{ rating: number; memo: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  /** 사용자가 기존 사진을 지우기 전까지는 null — 서버 값을 그대로 보여준다. */
  const [keptImages, setKeptImages] = useState<PlaceReviewItem['images'] | null>(null);
  const myReview = reviewsQuery.data?.myReview;
  const form = draft ?? { rating: myReview?.rating ?? 0, memo: myReview?.content ?? '' };
  const { rating, memo } = form;
  const initialRating = myReview?.rating ?? 0;
  const initialMemo = myReview?.content ?? '';
  // 수정 모드에서만 기존 사진을 다룬다. 작성 모드에는 애초에 붙어 있는 사진이 없다.
  const serverImages = isEdit ? (myReview?.images ?? []) : [];
  const existingImages = keptImages ?? serverImages;
  const imagesChanged = files.length > 0 || existingImages.length !== serverImages.length;
  const setRating = (nextRating: number) =>
    setDraft((current) => ({ ...(current ?? form), rating: nextRating }));
  const setMemo = (nextMemo: string) =>
    setDraft((current) => ({ ...(current ?? form), memo: nextMemo }));

  // Figma: 작성은 별점만 있으면 저장, 수정은 값이 바뀌어야 저장 활성
  // 사진만 바꿔도 저장할 수 있어야 한다 — 예전에는 별점·본문이 그대로면 버튼이 잠겼다.
  const canSubmit = isEdit
    ? rating > 0 &&
      memo.trim().length > 0 &&
      (rating !== initialRating || memo !== initialMemo || imagesChanged)
    : rating > 0 && memo.trim().length > 0;

  // 작성 모드인데 이미 후기가 있는 경우. 서버가 409로 막기 때문에 저장을 시도할 이유가 없다.
  const hasExistingReview = !isEdit && !!myReview;

  const isPending =
    createRecordMutation.isPending ||
    updateRecordMutation.isPending ||
    uploadImagesMutation.isPending;

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
            <p className="text-xs text-gray-4">
              {placeQuery.data?.isVisited ? '방문 인증 완료' : '방문 장소'}
            </p>
            <h2 className="mt-2 truncate text-base font-bold text-gray-6">
              {placeQuery.data?.placeName ?? '장소 정보를 불러오는 중입니다.'}
            </h2>
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

        <FileAttachButton
          className="mx-6"
          maxCount={5}
          existingImages={existingImages.map((image) => ({
            key: String(image.imageId),
            url: image.imageUrl,
          }))}
          onExistingImagesChange={(next) => {
            const remaining = new Set(next.map((image) => image.key));
            setKeptImages(existingImages.filter((image) => remaining.has(String(image.imageId))));
          }}
          onFilesChange={setFiles}
        />
        <div className="flex-1" />

        <Button
          disabled={
            hasExistingReview ||
            !canSubmit ||
            isPending ||
            placeQuery.isPending ||
            placeQuery.isError ||
            (isEdit && (reviewsQuery.isPending || reviewsQuery.isError))
          }
          className="mx-5 mb-5 w-auto"
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
                    placeId,
                    body: {
                      rating,
                      content: memo.trim(),
                      // ⚠️ 사진을 안 건드렸으면 `imageIds`를 **아예 보내지 않는다.**
                      // BE는 이 필드가 오면 전체 교체로 처리하므로(`RecordService.resolveImagesForUpdate`)
                      // 빈 배열은 곧 "사진 전부 삭제"다. 예전에는 항상 `[]`가 나가서
                      // 후기를 고칠 때마다 붙어 있던 사진이 조용히 날아갔다(#174).
                      ...(imagesChanged
                        ? {
                            imageIds: [
                              ...existingImages.map((image) => image.imageId),
                              ...imageIds,
                            ],
                          }
                        : {}),
                    },
                  },
                  { onSuccess: () => navigate(`/place/${placeId}`, { replace: true }) },
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
                {
                  // replace로 넘어간다. push하면 완료 화면이 장소 상세로 replace된 뒤에도
                  // **작성 폼이 히스토리에 남아**, 상세에서 뒤로가기를 누르면 방금 저장한
                  // 폼으로 되돌아간다(거기서 다시 저장하면 409다).
                  onSuccess: () => navigate(`/place/${placeId}/review/complete`, { replace: true }),
                },
              );
            } catch {
              // mutation state renders the error message below
            }
          }}
        >
          {isEdit ? '수정 완료' : '후기 저장하기'}
        </Button>
        {hasExistingReview ? (
          <p className="mb-5 px-5 text-center text-xs text-gray-5">
            이 장소에는 이미 후기를 작성했어요. 내용을 바꾸려면 후기 수정에서 고칠 수 있어요.
          </p>
        ) : createRecordMutation.isError ||
          updateRecordMutation.isError ||
          uploadImagesMutation.isError ? (
          <p className="mb-5 px-5 text-center text-xs text-danger">
            {isDuplicateReviewError(createRecordMutation.error)
              ? '이미 이 장소에 후기를 작성했어요. 새로고침 후 후기 수정에서 고쳐주세요.'
              : '후기 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'}
          </p>
        ) : null}
      </div>
    </div>
  );
}
