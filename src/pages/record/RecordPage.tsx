import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';
import RecordPlaceCard from './components/RecordPlaceCard';
import {
  SAVED_PLACES,
  VISITED_PLACES,
  type Place,
  type VisitedPlace,
} from './recordDummyData';

type RecordTab = 'saved' | 'visited';

const RECORD_TABS: readonly PillTabItem<RecordTab>[] = [
  { value: 'saved', label: '저장한 터' },
  { value: 'visited', label: '다녀온 터' },
];

function dateLabel(date: string) {
  return `저장일 ${date}`;
}

function placesForTab(tab: RecordTab): readonly Place[] {
  switch (tab) {
    case 'saved':
      return SAVED_PLACES;
    case 'visited':
      return VISITED_PLACES;
  }
}

type ShareablePlace = VisitedPlace & {
  shareMessage: string;
  imageUrl: string;
};

function isShareablePlace(place: Place): place is ShareablePlace {
  const candidate = place as VisitedPlace;
  return (
    candidate.isShared === true &&
    typeof candidate.shareMessage === 'string' &&
    typeof candidate.imageUrl === 'string'
  );
}

export default function RecordPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordTab>('saved');

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
            <li key={place.id}>
              <RecordPlaceCard
                name={place.name}
                categories={place.categories}
                dateLabel={dateLabel(place.date)}
                day={place.day}
                imageUrl={isShareablePlace(place) ? place.imageUrl : undefined}
                onClick={
                  activeTab === 'visited'
                    ? () => navigate(`/review/${place.id}`)
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
