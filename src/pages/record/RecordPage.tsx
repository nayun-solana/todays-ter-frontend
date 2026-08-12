import { useNavigate, useSearchParams } from 'react-router';

import PillTabs, { type PillTabItem } from '../../components/PillTabs';
import { useMyPlaces } from '../../hooks/record/useRecord';
import type { MyPlaceListType } from '../../types/record/myPlace';
import RecordPlaceCard from './components/RecordPlaceCard';
import { loadFailureMessageBrief } from '../../lib/messages';
import TabPageHeader from '../../components/TabPageHeader';

type RecordTab = 'saved' | 'visited';

const RECORD_TABS: readonly PillTabItem<RecordTab>[] = [
  { value: 'saved', label: '저장한 터' },
  { value: 'visited', label: '다녀온 터' },
];

const TAB_TO_API_TYPE: Record<RecordTab, MyPlaceListType> = {
  saved: 'saved',
  visited: 'visited',
};

/** 후기 작성 완료 등 외부에서 특정 탭으로 진입시키기 위해 URL로 탭을 노출한다. */
function parseTab(value: string | null): RecordTab {
  return value === 'visited' || value === 'saved' ? value : 'saved';
}

/** "2026-06-29" → "저장일 06/29" | "작성일 06/29" */
function dateLabel(date: string, tab: RecordTab) {
  const prefix = tab === 'visited' ? '작성일' : '저장일';
  const [, month, day] = date.split('-');
  if (!month || !day) return `${prefix} ${date}`;
  return `${prefix} ${month}/${day}`;
}

export default function RecordPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  /**
   * 탭 상태를 URL에만 두어 새로고침·공유에도 같은 탭이 열리게 한다.
   * 탭 전환은 뒤로가기로 되돌릴 만한 이동이 아니고 히스토리만 쌓이므로 replace로 바꾼다.
   */
  const activeTab = parseTab(searchParams.get('tab'));
  const setActiveTab = (tab: RecordTab) =>
    // 객체를 통째로 넘기면 다른 쿼리 파라미터가 같이 지워진다 — tab만 갈아끼운다.
    setSearchParams(
      (previous) => {
        previous.set('tab', tab);
        return previous;
      },
      { replace: true },
    );
  const listType = TAB_TO_API_TYPE[activeTab];
  const placesQuery = useMyPlaces(listType);
  const places = placesQuery.data?.places ?? [];

  return (
    <div className="flex flex-1 flex-col bg-gray-1">
      <TabPageHeader title="내 터" />

      <div className="px-5 pt-4 pb-6">
        <PillTabs items={RECORD_TABS} value={activeTab} onChange={setActiveTab} />

        {placesQuery.isPending ? (
          <p className="mt-4 text-sm text-gray-4">불러오는 중…</p>
        ) : placesQuery.isError ? (
          <p className="mt-4 text-sm text-gray-4">{loadFailureMessageBrief('목록')}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {places.map((place) => {
              /** 다녀온 터 상세: GET /records/{recordId} */
              const recordId = place.recordId;

              return (
                <li key={recordId ?? place.placeId}>
                  <RecordPlaceCard
                    name={place.placeName}
                    categories={place.categories}
                    dateLabel={dateLabel(place.savedDate, activeTab)}
                    day={place.element}
                    imageUrl={place.thumbnailUrl || undefined}
                    onClick={
                      activeTab === 'saved'
                        ? () => navigate(`/place/${place.placeId}`)
                        : recordId != null && recordId > 0
                          ? () =>
                              navigate(`/review/${recordId}`, {
                                state: { element: place.element },
                              })
                          : undefined
                    }
                  />
                </li>
              );
            })}
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
