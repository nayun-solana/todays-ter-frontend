import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { ApiError } from '../../api/types';
import FileAttachButton from '../../components/FileAttachButton';
import OhaengBadge from '../../components/OhaengBadge';
import TextInput from '../../components/TextInput';
import { useSubmitRecord } from '../../hooks/record/useRecord';
import { useRecommendationDetail } from '../../hooks/recommendation/useRecommendation';
import { ohaengByKey } from '../../lib/ohaeng';
import { viewStateOf } from '../../lib/queryState';
import { toOhaengKey } from '../../types/home/homeEnergy';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { id: placeIdParam } = useParams();
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
    <div className="flex min-h-screen flex-col bg-gray-1">
      <ReviewHeader title="방문 기록하기" />

      {viewState === 'loading' ? (
        <p className="px-5 py-8 text-sm text-gray-4">불러오는 중…</p>
      ) : viewState === 'failed' || !place ? (
        <p className="px-5 py-8 text-sm text-gray-4">장소 정보를 불러오지 못했습니다.</p>
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
                  <span className="rounded-full border border-gray-3 bg-white px-3 py-2 text-xs font-bold text-gray-5">
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

          <Button disabled={!canSubmit} className="mx-5 mb-5 w-auto" onClick={handleSubmit}>
            {submitRecord.isPending ? '저장 중…' : '방문 기록 저장하기'}
          </Button>
        </div>
      )}
    </div>
  );
}
