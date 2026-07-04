import { useState } from 'react';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';

type RecordTab = 'saved' | 'visited' | 'shared';

const RECORD_TABS: readonly PillTabItem<RecordTab>[] = [
  { value: 'saved', label: '저장한 터' },
  { value: 'visited', label: '다녀온 터' },
  { value: 'shared', label: '공유 카드' },
];

export default function RecordPage() {
  const [activeTab, setActiveTab] = useState<RecordTab>('saved');

  return (
    <div>
      <header className="border-b border-gray-3 px-5 py-4">
        <h1 className="text-xl font-bold text-gray-6">내 터</h1>
      </header>

      <div className="px-5 pt-4">
        <PillTabs items={RECORD_TABS} value={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
