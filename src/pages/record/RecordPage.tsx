import { useState } from 'react';
import { useNavigate } from 'react-router';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';
import { useMyPlaces } from '../../hooks/record/useRecord';
import type { MyPlaceListType } from '../../types/record/myPlace';
import RecordPlaceCard from './components/RecordPlaceCard';

type RecordTab = 'saved' | 'visited';

const RECORD_TABS: readonly PillTabItem<RecordTab>[] = [
  { value: 'saved', label: '저장한 터' },
  { value: 'visited', label: '다녀온 터' },
];

const TAB_TO_API_TYPE: Record<RecordTab, MyPlaceListType> = {
  saved: 'saved',
  visited: 'recordId',
};

/** "2026-06-29" → "저장일 06/29" */
function dateLabel(savedDate: string) {
  const [, month, day] = savedDate.split('-');
  if (!month || !day) return `저장일 ${savedDate}`;
  return `저장일 ${month}/${day}`;
}

export default function RecordPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordTab>('saved');
  const listType = TAB_TO_API_TYPE[activeTab];
  const placesQuery = useMyPlaces(listType);
  const places = placesQuery.data ?? [];

  return (
    <div className="flex flex-1 flex-col bg-gray-1">
      <header className="bg-white px-5 pb-4 pt-5">
        <h1 className="text-2xl font-extrabold text-primary">내 터</h1>
      </header>

      <div className="px-5 pt-4 pb-6">
        <PillTabs items={RECORD_TABS} value={activeTab} onChange={setActiveTab} />

        {placesQuery.isPending ? (
          <p className="mt-4 text-sm text-gray-4">불러오는 중…</p>
        ) : placesQuery.isError ? (
          <p className="mt-4 text-sm text-gray-4">목록을 불러오지 못했습니다.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {places.map((place) => (
              <li key={place.visitId ?? place.placeId}>
                <RecordPlaceCard
                  name={place.placeName}
                  categories={place.categories}
                  dateLabel={dateLabel(place.savedDate)}
                  day={place.element}
                  imageUrl={place.thumbnailUrl ?? undefined}
                  onClick={
                    activeTab === 'visited' && place.visitId != null
                      ? () => navigate(`/review/${place.visitId}`)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="mt-2.5 w-full cursor-pointer rounded-btn border border-primary-light bg-white py-4 text-sm font-bold text-primary-light leading-none"
        >
          새로운 터 탐색하기 +
        </button>
      </div>
    </div>
  );
}
