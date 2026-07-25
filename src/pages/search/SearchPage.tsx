import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import iconChevronRight from '../../assets/icon-chevron-right.svg';
import themeCareer from '../../assets/search/theme-career.svg';
import themeHealth from '../../assets/search/theme-health.svg';
import themeLove from '../../assets/search/theme-love.svg';
import themeMoney from '../../assets/search/theme-money.svg';
import themeOther from '../../assets/search/theme-other.svg';
import themeRelationship from '../../assets/search/theme-relationship.svg';
import Chip from '../../components/Chip';
import OhaengOrb from '../../components/OhaengOrb';
import PlaceListItem from '../../components/PlaceListItem';
import SearchBar from '../../components/SearchBar';
import { cn } from '../../lib/cn';
import { ohaengByKey, type OhaengKey } from '../../lib/ohaeng';

const REGIONS = ['전체', '서울', '제주', '부산', '강원', '수도권'];

const THEMES = [
  { label: '연애 터', icon: themeLove },
  { label: '커리어 터', icon: themeCareer },
  { label: '재물 터', icon: themeMoney },
  { label: '인간관계 터', icon: themeRelationship },
  { label: '건강 터', icon: themeHealth },
  { label: '기타', icon: themeOther },
];

const ELEMENT_CHIPS: { label: string; key?: OhaengKey }[] = [
  { label: '전체' },
  { label: '화', key: 'fire' },
  { label: '토', key: 'earth' },
  { label: '목', key: 'wood' },
  { label: '수', key: 'water' },
  { label: '금', key: 'metal' },
];

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

const EDITOR_PICKS: {
  id: string;
  name: string;
  course: string;
  description: string;
  element: OhaengKey;
}[] = [
  {
    id: 'bukhansan',
    name: '북한산 둘레길',
    course: '목기 창작 코스',
    description: '창작 슬럼프를 깨는 최고의 오행 터',
    element: 'wood',
  },
  {
    id: 'cheonggyecheon',
    name: '청계천',
    course: '수기 감정 정화 루트',
    description: '마음이 무거울 때 꼭 가야 하는 곳',
    element: 'water',
  },
  {
    id: 'gyeongbokgung',
    name: '경복궁',
    course: '토기 안정 충전지',
    description: '결정을 앞둔 날, 중심 잡기 최적 터',
    element: 'earth',
  },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [region, setRegion] = useState('전체');
  const [hasScrolled, setHasScrolled] = useState(false);
  const selected = ohaengByKey(params.get('element'));
  const places = selected ? PLACES.filter((place) => place.element === selected.key) : PLACES;

  useEffect(() => {
    const updateHeaderShadow = () => setHasScrolled(window.scrollY > 0);

    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
    return () => window.removeEventListener('scroll', updateHeaderShadow);
  }, []);

  const toggleElement = (key?: OhaengKey) => {
    setParams(key && selected?.key !== key ? { element: key } : {});
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[375px] bg-gray-1">
      <header
        className={cn(
          'sticky top-0 z-40 flex h-[111px] items-end bg-white px-5 pb-3 transition-shadow',
          hasScrolled && 'shadow-card',
        )}
      >
        <h1 className="typo-head-1 text-primary">모든 터 탐색</h1>
      </header>

      <main>
        <SearchBar
          aria-label="지도에서 탐색"
          placeholder="지도에서 탐색"
          className="mx-5 mt-3 h-11 shadow-card"
        />

        <div className="no-scrollbar flex gap-1 overflow-x-auto px-5 pt-4 pb-1">
          {REGIONS.map((item) => (
            <Chip
              key={item}
              selected={region === item}
              onClick={() => setRegion(item)}
              className="h-8 px-4 text-xs"
            >
              {item}
            </Chip>
          ))}
        </div>

        <section className="mt-5 pl-5">
          <h2 className="typo-body-2 text-gray-6">테마별 터 컬렉션</h2>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto py-1.5 pr-5">
            {THEMES.map((theme) => (
              <div
                key={theme.label}
                className="flex h-25 w-[110px] shrink-0 flex-col gap-3.5 rounded-btn border border-gray-2 bg-white py-3 pr-10 pl-4 shadow-card"
              >
                <img src={theme.icon} alt="" className="size-[30px] shrink-0" />
                <div className="flex flex-col gap-1.5 whitespace-nowrap">
                  <p className="text-sm leading-none font-bold text-gray-5">{theme.label}</p>
                  <p className="mt-1 text-[10px] leading-none text-gray-4">장소 3개</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 px-5">
          <h2 className="typo-body-2 text-gray-6">오행별 터 찾기</h2>
          <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto py-0.5">
            {ELEMENT_CHIPS.map((item) => {
              const isSelected = item.key === selected?.key || (!item.key && !selected);
              return (
                <Chip
                  key={item.label}
                  selected={isSelected}
                  onClick={() => toggleElement(item.key)}
                  className="h-8 px-4 text-xs"
                >
                  {item.label}
                  {/* Figma: 선택된 오행 칩에만 orb가 붙는다 ('전체'는 제외) */}
                  {isSelected && item.key ? <OhaengOrb element={item.key} size={16} /> : null}
                </Chip>
              );
            })}
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

        <section className="mt-5 px-5">
          <h2 className="typo-body-2 text-gray-6">에디터 오행 픽</h2>
          <div className="mt-3 flex flex-col gap-2">
            {EDITOR_PICKS.map((pick) => {
              const meta = ohaengByKey(pick.element)!;
              return (
                <button
                  key={pick.id}
                  type="button"
                  onClick={() => navigate(`/place/${pick.id}`)}
                  className={cn(
                    'flex h-20 items-center justify-between rounded-btn px-4 text-left',
                    meta.bg,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <OhaengOrb element={meta.key} size={36} />
                    <div className="flex flex-col gap-3">
                      <p className="flex items-center gap-1.5 leading-none">
                        <span className="text-base leading-none font-bold text-gray-6">
                          {pick.name}
                        </span>
                        <span aria-hidden="true" className="size-[3px] rounded-full bg-white" />
                        <span className="text-[10px] leading-none font-bold text-white">
                          {pick.course}
                        </span>
                      </p>
                      <p className="text-xs leading-none font-bold text-white">
                        {pick.description}
                      </p>
                    </div>
                  </div>
                  <img src={iconChevronRight} alt="" className="h-4 w-[9px] -scale-x-100" />
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
