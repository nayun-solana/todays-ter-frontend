import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Chip from '../../components/Chip';
import OhaengOrb from '../../components/OhaengOrb';
import PlaceListItem from '../../components/PlaceListItem';
import SearchBar from '../../components/SearchBar';
import { cn } from '../../lib/cn';
import { OHAENG_LIST, ohaengByKey, type OhaengKey, type OhaengMeta } from '../../lib/ohaeng';

const REGIONS = ['전체', '서울', '수도권', '부산', '강원', '제주'];

const THEMES = ['연애 터', '커리어 터', '재물 터', '인간관계 터', '건강 터', '기타'];

interface Place {
  id: string;
  name: string;
  description: string;
  tags: string[];
  rating: number;
  distance: string;
  element: OhaengKey;
}

// TODO: API 연동 시 교체 (Figma 시안 데이터)
const PLACES: Place[] = [
  {
    id: 'gyeongbokgung',
    name: '경복궁',
    description: '안정과 번영의 기운, 토기 충전',
    tags: ['재물', '커리어'],
    rating: 4.7,
    distance: '3.5km',
    element: 'earth',
  },
  {
    id: 'cheonggyecheon',
    name: '청계천',
    description: '도심 속 힐링 물길, 수기 충전',
    tags: ['연애', '건강'],
    rating: 4.8,
    distance: '2.1km',
    element: 'water',
  },
  {
    id: 'bukhansan',
    name: '북한산 둘레길',
    description: '새로운 시작의 기운, 목기 충전',
    tags: ['건강', '커리어'],
    rating: 4.9,
    distance: '8.3km',
    element: 'wood',
  },
  {
    id: 'yeouido',
    name: '한강공원 여의도',
    description: '광활한 수기로 마음 열기',
    tags: ['연애', '인간관계'],
    rating: 4.6,
    distance: '5.2km',
    element: 'water',
  },
  {
    id: 'jingwansa',
    name: '진관사',
    description: '천년의 기운, 명상과 치유의 성지',
    tags: ['건강', '기타'],
    rating: 4.8,
    distance: '11.4km',
    element: 'wood',
  },
  {
    id: 'namsan',
    name: '남산공원',
    description: '서울 중심의 화기, 열정 충전',
    tags: ['연애', '인간관계'],
    rating: 4.5,
    distance: '4.1km',
    element: 'fire',
  },
];

const EDITOR_PICKS: { name: string; course: string; description: string; element: OhaengKey }[] = [
  {
    name: '북한산 둘레길',
    course: '목기 창작 코스',
    description: '창작 슬럼프를 깨는 최고의 오행 터',
    element: 'wood',
  },
  {
    name: '청계천',
    course: '수기 감정 정화 루트',
    description: '마음이 무거울 때 꼭 가야 하는 곳',
    element: 'water',
  },
  {
    name: '경복궁',
    course: '토기 안정 충전지',
    description: '결정을 앞둔 날, 중심 잡기 최적 터',
    element: 'earth',
  },
];

/** 오행별 터 찾기 타일. 선택 시 오행색 채움. */
function OhaengTile({
  meta,
  selected,
  onClick,
}: {
  meta: OhaengMeta;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-15 flex-col items-center gap-1.5 rounded-xl border pt-3 pb-2',
        selected ? cn('border-transparent', meta.bg) : cn('bg-white', meta.border),
      )}
    >
      <OhaengOrb color={meta.cssVar} />
      <span className={cn('font-sans text-sm font-bold', selected ? 'text-white' : meta.text)}>
        {meta.label}
      </span>
    </button>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [region, setRegion] = useState('전체');

  const selected = ohaengByKey(params.get('element'));
  const places = selected ? PLACES.filter((p) => p.element === selected.key) : PLACES;

  const toggleElement = (key: OhaengKey) => {
    setParams(selected?.key === key ? {} : { element: key });
  };

  return (
    <div className="mx-auto max-w-[390px] pb-6">
      {/* 헤더 */}
      <header className="rounded-b-2xl bg-primary px-5 pt-8 pb-5">
        <h1 className="font-sans text-xl font-extrabold text-white">모든 터 탐색</h1>
        <SearchBar placeholder="지도에서 탐색" className="mt-3" />
      </header>

      {/* 지역 필터 */}
      <div className="flex gap-2 overflow-x-auto px-5 pt-5">
        {REGIONS.map((r) => (
          <Chip key={r} selected={region === r} onClick={() => setRegion(r)}>
            {r}
          </Chip>
        ))}
      </div>

      {/* 테마별 터 컬렉션 */}
      <section className="mt-6 pl-5">
        <h2 className="font-sans text-base font-extrabold text-gray-6">테마별 터 컬렉션</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pr-5">
          {THEMES.map((theme) => (
            <div
              key={theme}
              className="w-[110px] shrink-0 rounded-2xl border border-gray-3/60 bg-white p-4 shadow-btn"
            >
              {/* ponytail: 테마 아이콘 asset 미확보 → 회색 placeholder */}
              <div className="h-[30px] w-[30px] rounded-lg bg-gray-3" />
              <p className="mt-3.5 font-sans text-sm font-bold text-gray-6">{theme}</p>
              <p className="mt-1.5 font-sans text-[11px] text-gray-4">장소 3개</p>
            </div>
          ))}
        </div>
      </section>

      {/* 오행별 터 찾기 + 장소 리스트 */}
      <section className="mt-6 px-5">
        <h2 className="font-sans text-base font-extrabold text-gray-6">오행별 터 찾기</h2>
        <div className="mt-3 flex justify-between">
          {OHAENG_LIST.map((meta) => (
            <OhaengTile
              key={meta.key}
              meta={meta}
              selected={selected?.key === meta.key}
              onClick={() => toggleElement(meta.key)}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {places.map((place) => (
            <PlaceListItem
              key={place.id}
              name={place.name}
              description={place.description}
              tags={place.tags}
              rating={place.rating}
              distance={place.distance}
              element={ohaengByKey(place.element)!}
              onClick={() => navigate(`/place/${place.id}`)}
            />
          ))}
        </div>
      </section>

      {/* 에디터 오행 픽 */}
      <section className="mt-6 px-5">
        <h2 className="font-sans text-base font-extrabold text-gray-6">에디터 오행 픽</h2>
        <div className="mt-3 flex flex-col gap-2">
          {EDITOR_PICKS.map((pick) => {
            const meta = ohaengByKey(pick.element)!;
            return (
              <div
                key={pick.name}
                className={cn('flex items-center gap-3 rounded-2xl p-4', meta.bg)}
              >
                <OhaengOrb color={meta.cssVar} />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 font-sans text-white">
                    <span className="text-base font-bold">{pick.name}</span>
                    <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-white" />
                    <span className="text-[11px]">{pick.course}</span>
                  </p>
                  <p className="mt-2 font-sans text-[13px] text-white">{pick.description}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-white"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
