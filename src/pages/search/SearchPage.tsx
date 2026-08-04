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
import { useEditorPicks, useExploreFilters, usePlaces } from '../../hooks/search/useSearch';
import { cn } from '../../lib/cn';
import { ohaengByKey, type OhaengKey } from '../../lib/ohaeng';
import {
  toOhaengKey,
  type ElementCode,
} from '../../types/home/homeEnergy';
import { type RegionCode, type ThemeType } from '../../types/search/search';

const REGIONS = [
  { code: 'ALL', name: '전체' },
  { code: 'SEOUL', name: '서울' },
  { code: 'JEJU', name: '제주' },
  { code: 'BUSAN', name: '부산' },
  { code: 'GANGWON', name: '강원' },
  { code: 'CAPITAL_AREA', name: '수도권' },
];

const THEMES = [
  { code: 'LOVE', name: '연애 터', placeCount: 3 },
  { code: 'CAREER', name: '커리어 터', placeCount: 3 },
  { code: 'WEALTH', name: '재물 터', placeCount: 3 },
  { code: 'RELATIONSHIP', name: '인간관계 터', placeCount: 3 },
  { code: 'HEALTH', name: '건강 터', placeCount: 3 },
  { code: 'ETC', name: '기타', placeCount: 3 },
];

const THEME_ICONS: Record<string, string> = {
  LOVE: themeLove,
  CAREER: themeCareer,
  WEALTH: themeMoney,
  RELATIONSHIP: themeRelationship,
  HEALTH: themeHealth,
  ETC: themeOther,
};

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
  thumbnailUrl?: string | null;
  description: string;
  tags: string[];
  rating: number;
  distance?: string;
  element: OhaengKey;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [region, setRegion] = useState<RegionCode | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const selected = ohaengByKey(params.get('element'));
  const elementType = selected ? (selected.key.toUpperCase() as ElementCode) : undefined;
  const filtersQuery = useExploreFilters();
  const placesQuery = usePlaces({
    regionCode: region ?? undefined,
    themeType: selectedTheme ?? undefined,
    elementType,
    page: 0,
    size: 20,
  });
  const editorPicksQuery = useEditorPicks();
  const regions = filtersQuery.data?.regions ?? REGIONS;
  const themes = filtersQuery.data?.themes ?? THEMES;
  const elementChips =
    filtersQuery.data?.elements.map((element) => ({
      label: element.name,
      key: element.code === 'ALL' ? undefined : toOhaengKey(element.code),
    })) ?? ELEMENT_CHIPS;
  const places: Place[] =
    placesQuery.data?.content.map((place) => ({
      id: String(place.placeId),
      name: place.placeName,
      thumbnailUrl: place.thumbnailUrl,
      description: place.summary,
      tags: [place.theme.name.replace(/ 터$/, '')],
      rating: place.averageRating,
      distance: place.distanceKm === null ? undefined : `${place.distanceKm}km`,
      element: toOhaengKey(place.element.code),
    })) ?? [];
  const editorPicks =
    editorPicksQuery.data?.content.map((pick) => ({
      id: String(pick.placeId),
      name: pick.placeName,
      course: pick.summary,
      description: pick.description,
      element: toOhaengKey(pick.element.code),
    })) ?? [];

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
    <div className="min-h-dvh w-full bg-gray-1">
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
          {regions.map((item) => (
            <Chip
              key={item.code}
              selected={item.code === 'ALL' ? region === null : region === item.code}
              onClick={() => setRegion(item.code === 'ALL' ? null : (item.code as RegionCode))}
              className="h-8 px-4 text-xs"
            >
              {item.name}
            </Chip>
          ))}
        </div>

        <section className="mt-5 pl-5">
          <h2 className="typo-body-2 text-gray-6">테마별 터 컬렉션</h2>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto py-1.5 pr-5">
            {themes.map((theme) => {
              const isSelected = selectedTheme === theme.code;

              return (
                <button
                  key={theme.code}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTheme(isSelected ? null : (theme.code as ThemeType))}
                  className={cn(
                    'flex h-25 w-[110px] shrink-0 flex-col gap-3.5 rounded-btn border py-3 pr-10 pl-4 text-left transition active:scale-[0.98]',
                    isSelected
                      ? 'border-primary bg-primary-bg shadow-none'
                      : 'border-gray-2 bg-white shadow-card',
                  )}
                >
                  <img
                    src={THEME_ICONS[theme.code] ?? themeOther}
                    alt=""
                    className="size-[30px] shrink-0"
                  />
                  <div className="flex flex-col gap-1.5 whitespace-nowrap">
                    <p
                      className={cn(
                        'text-sm leading-none font-bold',
                        isSelected ? 'text-primary' : 'text-gray-5',
                      )}
                    >
                      {theme.name}
                    </p>
                    <p className="mt-1 text-[10px] leading-none text-gray-4">
                      장소 {theme.placeCount}개
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 px-5">
          <h2 className="typo-body-2 text-gray-6">오행별 터 찾기</h2>
          <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto py-0.5">
            {elementChips.map((item) => {
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
            {placesQuery.isPending ? (
              <p className="typo-sub-2 py-4 text-gray-4">장소를 불러오는 중입니다.</p>
            ) : placesQuery.isError ? (
              <p className="typo-sub-2 py-4 text-gray-4">장소를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            ) : places.length === 0 ? (
              <p className="typo-sub-2 py-4 text-gray-4">조건에 맞는 장소가 없습니다.</p>
            ) : places.map((place) => (
              <PlaceListItem
                key={place.id}
                name={place.name}
                thumbnailUrl={place.thumbnailUrl}
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
            {editorPicksQuery.isPending ? (
              <p className="typo-sub-2 py-4 text-gray-4">에디터 픽을 불러오는 중입니다.</p>
            ) : editorPicksQuery.isError ? (
              <p className="typo-sub-2 py-4 text-gray-4">에디터 픽을 불러오지 못했습니다.</p>
            ) : editorPicks.length === 0 ? (
              <p className="typo-sub-2 py-4 text-gray-4">등록된 에디터 픽이 없습니다.</p>
            ) : editorPicks.map((pick) => {
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
