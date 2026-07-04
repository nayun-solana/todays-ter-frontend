import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';

import FileAttachButton from '../../components/FileAttachButton';
import OhaengBadge from '../../components/OhaengBadge';
import TextInput from '../../components/TextInput';

/** 페이지 더미 — API 연동 전 */
const PLACE = {
  label: '오늘 추천받은 터',
  name: '청계천 모전교',
  day: '수' as const,
  tag: '# 감정 회복',
};

export default function ReviewPage() {
  const navigate = useNavigate();
  const [memo, setMemo] = useState('');

  return (
    <div className="flex min-h-screen flex-col bg-gray-1">
      <header className="flex items-center border-b border-gray-3 bg-white p-5">
        <button
          type="button"
          aria-label="닫기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-gray-5"
        >
          <X size={24} aria-hidden />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold text-gray-6">방문 기록하기</h1>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-5 py-3">
        {/* 장소 정보 */}
        <section className="flex items-center gap-3 rounded-2xl border border-primary-light bg-white p-3">
          <div className="size-20 shrink-0 rounded-xl bg-gray-3" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-4">{PLACE.label}</p>
            <h2 className="mt-1 truncate text-sm font-bold text-gray-6">{PLACE.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <OhaengBadge element={PLACE.day} className="px-3 py-1 text-sm" />
              <span className="rounded-full border border-gray-3 bg-white px-3 py-1 text-sm font-bold text-gray-5">
                {PLACE.tag}
              </span>
            </div>
          </div>
        </section>

        {/* 기운 메모 */}
        <section className="rounded-2xl bg-white p-4 border text-black-1 border-gray-2">
          <h3 className="text-base font-bold text-gray-6">오늘 기운은 어땠나요?</h3>
          <TextInput
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="한 줄 메모를 남겨보세요"
            rows={3}
            className="mt-3"
          />
        </section>

        {/* 파일 첨부 */}
        <FileAttachButton />

        <div className="flex-1" />

        <button
          type="button"
          className="mb-3 w-full rounded-btn bg-gray-3 py-4 text-base font-bold text-gray-4"
        >
          방문 기록 저장하기
        </button>
      </div>
    </div>
  );
}
