import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FileAttachButton from '../../components/FileAttachButton';
import OhaengBadge from '../../components/OhaengBadge';
import TextInput from '../../components/TextInput';
import Button from './components/Button';
import ReviewHeader from './components/ReviewHeader';
import StarRating from './components/StarRating';

/** 페이지 더미 — API 연동 전 */
const PLACE = {
  label: '오늘 추천받은 터',
  name: '청계천 모전교',
  day: '수' as const,
  tag: '# 감정 회복',
};

export default function ReviewPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');
  const canSubmit = rating > 0;
  const { id: matchedTerId } = useParams();

  return (
    <div className="flex min-h-screen flex-col bg-gray-1">
      <ReviewHeader title="방문 기록하기" />

      <div className="flex flex-1 flex-col gap-3">
        <section className="flex items-center gap-4 border-b border-gray-2 bg-white px-5 py-4">
          <div className="size-25 shrink-0 rounded-2xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-4">{PLACE.label}</p>
            <h2 className="mt-1 truncate text-sm font-bold text-gray-6">{PLACE.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <OhaengBadge element={PLACE.day} className="px-3 py-2 text-xs" />
              <span className="rounded-full border border-gray-3 bg-white px-3 py-2 text-xs font-bold text-gray-5">
                {PLACE.tag}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-2 bg-white p-5 mx-4 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-6">별점을 선택해주세요</h3>
          <StarRating value={rating} onChange={setRating} />
         <span className="text-sm text-gray-6 font-bold mt-2">오늘 기운은 어땠나요?</span>
          <TextInput
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="한 줄 메모를 남겨보세요"
            rows={4}
          />

          <FileAttachButton maxCount={1} />
        </section>

        <div className="flex-1" />

        <Button
          disabled={!canSubmit}
          className="mb-5 mx-5 w-auto"
          onClick={() =>
            navigate(`/matched-ter/${matchedTerId}/review/complete`, {
              replace: true,
              state: { matchedTerName: PLACE.name },
            })
          }
        >
          방문 기록 저장하기
        </Button>
      </div>
    </div>
  );
}
