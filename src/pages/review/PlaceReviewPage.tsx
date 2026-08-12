import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { apiErrorStatusOf } from '../../api/types';
import FileAttachButton from '../../components/FileAttachButton';
import PageHeader from '../../components/PageHeader';
import SectionError from '../../components/SectionError';
import TextInput from '../../components/TextInput';
import { loadFailureMessageBrief, loadingMessage } from '../../lib/messages';
import { usePlaceDetail, usePlaceReviews } from '../../hooks/place/usePlace';
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

/**
 * 로딩 자리표시자. 장소 카드(size-25 이미지 + 텍스트 두 줄)와 같은 높이를 잡는다.
 * 폭은 실물과 같이 부모를 따라간다 — 고정하는 건 높이뿐이다.
 */
function PlaceCardSkeleton() {
  return (
    <section
      role="status"
      aria-label={loadingMessage('장소 정보')}
      className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4"
    >
      <div className="size-25 shrink-0 animate-pulse rounded-xl bg-gray-2" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-3 w-20 max-w-full animate-pulse rounded bg-gray-2" />
        <div className="h-5 w-40 max-w-full animate-pulse rounded bg-gray-2" />
      </div>
    </section>
  );
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

  // 작성 모드인데 이미 후기가 있는 경우. 서버가 409로 막기 때문에 저장을 시도할 이유가 없다.
  const hasExistingReview = !isEdit && !!myReview;

  // 수정 모드인데 고칠 후기가 없는 경우(이미 지웠거나 잘못 들어옴).
  // 저장을 누르면 아래 `isEdit && myReview` 분기를 지나쳐 **create로 흘러가** 새 후기가
  // 만들어지고 완료 화면도 작성 경로로 갔다. 아예 못 누르게 막고 이유를 알려준다.
  const missingReviewToEdit =
    isEdit && !reviewsQuery.isPending && !reviewsQuery.isError && !myReview;

  // 없는 장소(404)·잘못된 id(400)는 다시 시도해봐야 결과가 같다.
  const placeStatus = apiErrorStatusOf(placeQuery.error);
  const placeUnreachable = placeStatus === 404 || placeStatus === 400;

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
        {/* 장소명을 '장소 정보를 불러오는 중입니다.'로 폴백해두면 실패한 뒤에도 그 문구가
            영구히 박혀 있고 저장 버튼만 잠겨서, 사용자는 왜 저장이 안 되는지 알 수 없다.
            로딩·실패·정상을 갈라 보여준다. */}
        {placeQuery.isPending ? (
          <PlaceCardSkeleton />
        ) : placeQuery.isError || !placeQuery.data ? (
          <div className="border-b border-gray-2 bg-white px-5 py-4">
            {placeUnreachable ? (
              <>
                <p className="text-sm text-gray-4">
                  {placeStatus === 404
                    ? '찾을 수 없는 장소예요. 삭제되었을 수 있어요.'
                    : '잘못된 주소로 들어왔어요.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/search', { replace: true })}
                  className="mt-3 rounded-btn border border-primary bg-white px-4 py-2 text-sm font-bold text-primary"
                >
                  탐색으로 돌아가기
                </button>
              </>
            ) : (
              <SectionError
                message={loadFailureMessageBrief('장소 정보')}
                onRetry={() => void placeQuery.refetch()}
              />
            )}
          </div>
        ) : (
          <section className="flex items-center gap-5 border-b border-gray-2 bg-white px-5 py-4">
            <div className="size-25 shrink-0 rounded-xl bg-gray-3" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-4">
                {placeQuery.data.isVisited ? '방문 인증 완료' : '방문 장소'}
              </p>
              <h2 className="mt-2 truncate text-base font-bold text-gray-6">
                {placeQuery.data.placeName}
              </h2>
            </div>
          </section>
        )}

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

        <FileAttachButton className="mx-6" maxCount={5} onFilesChange={setFiles} />
        <div className="flex-1" />

        {/* 안내는 버튼 위에 둔다. 아래에 두면 화면 최하단이라 눈에 안 들어온다. */}
        {hasExistingReview ? (
          <p className="px-5 text-center text-xs text-gray-5">
            이 장소에는 이미 후기를 작성했어요. 내용을 바꾸려면 후기 수정에서 고칠 수 있어요.
          </p>
        ) : missingReviewToEdit ? (
          <p role="alert" className="px-5 text-center text-xs text-danger">
            고칠 후기가 없어요. 이미 삭제되었을 수 있어요.
          </p>
        ) : uploadImagesMutation.isError ? (
          // 업로드 실패를 "후기 저장 실패"로 뭉뚱그리면 사용자가 글을 다시 쓴다.
          <p role="alert" className="px-5 text-center text-xs text-danger">
            사진을 올리지 못했어요. 사진을 빼거나 잠시 후 다시 시도해주세요.
          </p>
        ) : createRecordMutation.isError || updateRecordMutation.isError ? (
          <p role="alert" className="px-5 text-center text-xs text-danger">
            {isDuplicateReviewError(createRecordMutation.error)
              ? '이미 이 장소에 후기를 작성했어요. 새로고침 후 후기 수정에서 고쳐주세요.'
              : '후기 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'}
          </p>
        ) : null}

        <Button
          disabled={
            hasExistingReview ||
            missingReviewToEdit ||
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
                    body: { rating, content: memo.trim(), imageIds },
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
          {isPending ? (isEdit ? '수정 중…' : '저장 중…') : isEdit ? '수정 완료' : '후기 저장하기'}
        </Button>
      </div>
    </div>
  );
}
