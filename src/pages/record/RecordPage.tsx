import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';
import RecordPlaceCard from '../../components/RecordPlaceCard';
import ShareCardModal from '../../components/ShareCardModal';
import {
  SAVED_PLACES,
  SHARED_PLACES,
  VISITED_PLACES,
  type Place,
  type VisitedPlace,
} from './recordDummyData';

type RecordTab = 'saved' | 'visited' | 'shared';

const RECORD_TABS: readonly PillTabItem<RecordTab>[] = [
  { value: 'saved', label: '저장한 터' },
  { value: 'visited', label: '다녀온 터' },
  { value: 'shared', label: '공유 카드' },
];

function dateLabelForTab(tab: RecordTab, date: string) {
  if (tab === 'saved') return `저장일 ${date}`;
  return `방문일 ${date}`;
}

function placesForTab(tab: RecordTab): readonly Place[] {
  switch (tab) {
    case 'saved':
      return SAVED_PLACES;
    case 'visited':
      return VISITED_PLACES;
    case 'shared':
      return SHARED_PLACES;
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
  const [selectedSharePlace, setSelectedSharePlace] = useState<ShareablePlace | null>(
    null,
  );

  const places = useMemo(() => placesForTab(activeTab), [activeTab]);
  const showExploreButton = activeTab !== 'shared';

  return (
    <div className="bg-gray-1">
      <header className="border-b border-gray-3 bg-white px-5 py-4">
        <h1 className="text-xl font-bold text-gray-6">내 터</h1>
      </header>

      <div className="px-5 pt-4 pb-6">
        <PillTabs items={RECORD_TABS} value={activeTab} onChange={setActiveTab} />

        <ul className="mt-4 flex flex-col gap-3">
          {places.map((place) => (
            <li key={place.id}>
              <RecordPlaceCard
                name={place.name}
                categories={place.categories}
                dateLabel={dateLabelForTab(activeTab, place.date)}
                day={place.day}
                imageUrl={isShareablePlace(place) ? place.imageUrl : undefined}
                onClick={
                  activeTab === 'shared' && isShareablePlace(place)
                    ? () => setSelectedSharePlace(place)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>

        {showExploreButton ? (
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="mt-2.5 w-full cursor-pointer rounded-btn border border-primary-light bg-white py-4 text-sm font-bold text-primary-light"
          >
            새로운 터 탐색하기 +
          </button>
        ) : null}
      </div>

      {selectedSharePlace ? (
        <ShareCardModal
          place={selectedSharePlace}
          onClose={() => setSelectedSharePlace(null)}
        />
      ) : null}
    </div>
  );
}
