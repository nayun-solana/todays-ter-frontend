import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';
// import type { ApiError } from '../../api/types';
// import { getMyPlaces } from '../../api/record';
import type { MyPlaceItem } from '../../types/record/myPlace';
import RecordPlaceCard from './components/RecordPlaceCard';
import { SAVED_PLACES, VISITED_PLACES } from './recordDummyData';

type RecordTab = 'saved' | 'visited';

const RECORD_TABS: readonly PillTabItem<RecordTab>[] = [
  { value: 'saved', label: '저장한 터' },
  { value: 'visited', label: '다녀온 터' },
];

/** "2026-06-29" → "저장일 06/29" */
function dateLabel(savedDate: string) {
  const [, month, day] = savedDate.split('-');
  if (!month || !day) return `저장일 ${savedDate}`;
  return `저장일 ${month}/${day}`;
}

function placesForTab(tab: RecordTab): readonly MyPlaceItem[] {
  switch (tab) {
    case 'saved':
      return SAVED_PLACES;
    case 'visited':
      return VISITED_PLACES;
  }
}

export default function RecordPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordTab>('saved');

  // API 연동 시 사용
  // const type: MyPlaceListType = activeTab === 'saved' ? 'saved' : 'recordId';
  // const [places, setPlaces] = useState<MyPlaceItem[]>([]);
  //
  // useEffect(() => {
  //   let cancelled = false;
  //
  //   getMyPlaces(type)
  //     .then((data) => {
  //       if (!cancelled) setPlaces(data);
  //     })
  //     .catch((error: ApiError) => {
  //       if (!cancelled) {
  //         console.error(error.message);
  //         setPlaces([]);
  //       }
  //     });
  //
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [type]);

  const places = useMemo(() => placesForTab(activeTab), [activeTab]);

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col bg-gray-1">
      <header className="bg-white px-5 pb-4 pt-5">
        <h1 className="text-2xl font-extrabold text-primary">내 터</h1>
      </header>

      <div className="px-5 pt-4 pb-6">
        <PillTabs items={RECORD_TABS} value={activeTab} onChange={setActiveTab} />

        <ul className="mt-4 flex flex-col gap-3">
          {places.map((place) => (
            <li key={place.placeId}>
              <RecordPlaceCard
                name={place.placeName}
                categories={place.categories}
                dateLabel={dateLabel(place.savedDate)}
                day={place.element}
                imageUrl={place.thumbnailUrl || undefined}
                onClick={
                  activeTab === 'visited'
                    ? () => navigate(`/review/${place.placeId}`)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>

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
