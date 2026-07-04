import { useMemo, useState } from 'react';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';
import RecordPlaceCard from '../../components/RecordPlaceCard';
import {
  SAVED_PLACES,
  SHARED_PLACES,
  VISITED_PLACES,
  type Place,
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

export default function RecordPage() {
  const [activeTab, setActiveTab] = useState<RecordTab>('saved');

  const places = useMemo(() => placesForTab(activeTab), [activeTab]);

  return (
    <div className="bg-gray-1">
      <header className="border-b border-gray-3 bg-white px-5 py-4">
        <h1 className="text-xl font-bold text-gray-6">내 터</h1>
      </header>

      <div className="px-5 pt-4">
        <PillTabs items={RECORD_TABS} value={activeTab} onChange={setActiveTab} />

        <ul className="mt-4 flex flex-col gap-3">
          {places.map((place) => (
            <li key={place.id}>
              <RecordPlaceCard
                name={place.name}
                categories={place.categories}
                dateLabel={dateLabelForTab(activeTab, place.date)}
                day={place.day}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
