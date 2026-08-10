import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';

import filterCareer from '../../assets/search/filter-career.svg';
import filterHealth from '../../assets/search/filter-health.svg';
import filterLove from '../../assets/search/filter-love.svg';
import filterMoney from '../../assets/search/filter-money.svg';
import filterRelationship from '../../assets/search/filter-relationship.svg';
import iconFilter from '../../assets/search/icon-filter.svg';
import iconMap from '../../assets/search/icon-map.svg';
import themeOther from '../../assets/search/theme-other.svg';
import OhaengOrb from '../../components/OhaengOrb';
import PlaceListItem from '../../components/PlaceListItem';
import { useExploreFilters, useInfinitePlaces } from '../../hooks/search/useSearch';
import { cn } from '../../lib/cn';
import { ohaengByKey, type OhaengKey } from '../../lib/ohaeng';
import { getPlaceThumbnailUrl } from '../../lib/placeThumbnail';
import { toOhaengKey, type ElementCode } from '../../types/home/homeEnergy';
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
  { code: 'LOVE', name: '연애 터' },
  { code: 'CAREER', name: '커리어 터' },
  { code: 'WEALTH', name: '재물 터' },
  { code: 'RELATIONSHIP', name: '인간관계 터' },
  { code: 'HEALTH', name: '건강 터' },
  { code: 'ETC', name: '기타' },
];

const THEME_ICONS: Record<string, string> = {
  LOVE: filterLove,
  CAREER: filterCareer,
  WEALTH: filterMoney,
  RELATIONSHIP: filterRelationship,
  HEALTH: filterHealth,
  ETC: themeOther,
};

const ELEMENTS: { label: string; key: OhaengKey }[] = [
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

type AppliedFilter =
  | { label: string; type: 'element'; element: OhaengKey }
  | { label: string; type: 'region' }
  | { label: string; type: 'theme'; theme: string };

export default function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState<RegionCode | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftRegion, setDraftRegion] = useState<RegionCode | null>(null);
  const [draftTheme, setDraftTheme] = useState<ThemeType | null>(null);
  const [draftElement, setDraftElement] = useState<OhaengKey | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const selected = ohaengByKey(params.get('element'));
  const elementType = selected ? (selected.key.toUpperCase() as ElementCode) : undefined;
  const deferredKeyword = useDeferredValue(keyword);
  const filtersQuery = useExploreFilters();
  const placesQuery = useInfinitePlaces({
    keyword: deferredKeyword.trim() || undefined,
    regionCode: region ?? undefined,
    themeType: selectedTheme ?? undefined,
    elementType,
  });
  const regions = [
    REGIONS[0],
    ...(filtersQuery.data?.regions ?? REGIONS.slice(1)).filter((item) => item.code !== 'ALL'),
  ];
  const themes = filtersQuery.data?.themes ?? THEMES;
  const elements =
    filtersQuery.data?.elements
      .map((element) =>
        element.code === 'ALL' ? null : { label: element.name, key: toOhaengKey(element.code) },
      )
      .filter((element): element is { label: string; key: OhaengKey } => element !== null) ??
    ELEMENTS;
  const places: Place[] =
    placesQuery.data?.pages.flatMap((page) =>
      page.content.map((place) => ({
        id: String(place.placeId),
        name: place.placeName,
        thumbnailUrl: getPlaceThumbnailUrl(place.placeId),
        description: place.summary,
        tags: [place.theme.name.replace(/ 터$/, '')],
        rating: place.averageRating,
        distance: place.distanceKm === null ? undefined : `${place.distanceKm}km`,
        element: toOhaengKey(place.element.code),
      })),
    ) ?? [];
  const appliedFilters: AppliedFilter[] = [];
  if (selected)
    appliedFilters.push({ label: selected.label, type: 'element', element: selected.key });
  if (region) {
    appliedFilters.push({
      label: regions.find((item) => item.code === region)?.name ?? region,
      type: 'region',
    });
  }
  if (selectedTheme) {
    appliedFilters.push({
      label:
        themes.find((item) => item.code === selectedTheme)?.name.replace(/ 터$/, '') ??
        selectedTheme,
      type: 'theme',
      theme: selectedTheme,
    });
  }

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolled(window.scrollY > 0);
      setShowTopButton(window.scrollY > 240);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = placesQuery;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void fetchNextPage();
      },
      { rootMargin: '160px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [placesQuery]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFilterOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isFilterOpen]);

  const openFilter = () => {
    setDraftRegion(region);
    setDraftTheme(selectedTheme);
    setDraftElement(selected?.key ?? null);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setRegion(draftRegion);
    setSelectedTheme(draftTheme);
    setParams(draftElement ? { element: draftElement } : {});
    setIsFilterOpen(false);
  };

  return (
    <div className="w-full flex-1 bg-gray-1">
      <header
        className={cn(
          'sticky top-0 z-40 flex h-[111px] items-end bg-white px-5 pb-3 transition-shadow',
          hasScrolled && 'shadow-card',
        )}
      >
        <h1 className="typo-head-1 text-primary">모든 터 탐색</h1>
      </header>

      <main>
        <label className="mx-5 mt-3 flex h-11 items-center gap-1.5 rounded-btn border border-gray-2 bg-white px-4 py-2 shadow-card">
          <img src={iconMap} alt="" className="size-5 shrink-0" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            aria-label="장소 이름으로 검색"
            placeholder="장소 이름으로 검색"
            className="w-full bg-transparent font-sans text-sm font-normal text-gray-6 outline-none placeholder:text-gray-3"
          />
        </label>

        <section className="mx-5 mt-4 flex h-[34px] items-center gap-1" aria-label="탐색 필터">
          <button
            type="button"
            onClick={openFilter}
            aria-label="탐색 필터 열기"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-btn bg-white shadow-card"
          >
            <img src={iconFilter} alt="" className="size-[18px]" />
          </button>
          {appliedFilters.length === 0 ? (
            <button
              type="button"
              onClick={openFilter}
              className="h-[34px] w-[107px] rounded-btn bg-white px-4 text-xs leading-4 text-gray-4 shadow-card"
            >
              탐색 필터 선택
            </button>
          ) : (
            appliedFilters.map((filter) => {
              const element = filter.type === 'element' ? ohaengByKey(filter.element) : null;
              return (
                <span
                  key={`${filter.type}-${filter.label}`}
                  className={cn(
                    'flex h-[34px] items-center gap-1 rounded-btn px-4 text-xs leading-4 shadow-card',
                    element
                      ? cn(element.bg, 'font-bold text-white')
                      : 'border border-primary bg-white font-bold text-primary',
                  )}
                >
                  {filter.type === 'theme' ? (
                    <img
                      src={THEME_ICONS[filter.theme] ?? themeOther}
                      alt=""
                      className="size-[18px]"
                    />
                  ) : null}
                  {filter.label}
                  {element ? <OhaengOrb element={element.key} size={16} /> : null}
                </span>
              );
            })
          )}
        </section>

        <section className="mt-3 px-5">
          <div className="flex flex-col gap-2">
            {placesQuery.isPending ? (
              <p className="typo-sub-2 py-4 text-gray-4">장소를 불러오는 중입니다.</p>
            ) : placesQuery.isError ? (
              <p className="typo-sub-2 py-4 text-gray-4">
                장소를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
              </p>
            ) : places.length === 0 ? (
              <p className="typo-sub-2 py-4 text-gray-4">조건에 맞는 장소가 없습니다.</p>
            ) : (
              places.map((place) => (
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
              ))
            )}
          </div>
          <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
          {placesQuery.isFetchingNextPage ? (
            <p className="typo-sub-2 py-4 text-center text-gray-4">장소를 더 불러오는 중입니다.</p>
          ) : null}
        </section>
      </main>

      {showTopButton ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로 이동"
          className="fixed right-5 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 flex size-11 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-card-lg"
        >
          ↑
        </button>
      ) : null}

      <AnimatePresence>
        {isFilterOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-[60] flex items-end bg-black/60"
            role="presentation"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.section
              initial={{ y: prefersReducedMotion ? 0 : '100%' }}
              animate={{ y: 0 }}
              exit={{ y: prefersReducedMotion ? 0 : '100%' }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', damping: 30, stiffness: 360 }
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-filter-title"
              onClick={(event) => event.stopPropagation()}
              className="max-h-[calc(100dvh-env(safe-area-inset-top))] w-full overflow-y-auto rounded-t-[20px] bg-white px-5 pt-[30px] pb-[calc(30px+env(safe-area-inset-bottom))]"
            >
              <h2 id="search-filter-title" className="typo-head-2 text-gray-6">
                탐색 필터
              </h2>

              <div className="mt-5 space-y-5">
                <FilterGroup label="오행">
                  {elements.map((item) => {
                    const isSelected = draftElement === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setDraftElement(isSelected ? null : item.key)}
                        className={cn(
                          'flex h-[34px] items-center justify-center gap-1 rounded-btn px-4 text-xs leading-4 shadow-card',
                          isSelected
                            ? cn(
                                ohaengByKey(item.key)!.bg,
                                'border-transparent font-bold text-white',
                              )
                            : 'border border-gray-2 bg-white text-gray-4',
                        )}
                      >
                        {item.label}
                        {isSelected ? <OhaengOrb element={item.key} size={16} /> : null}
                      </button>
                    );
                  })}
                </FilterGroup>

                <FilterGroup label="지역">
                  {regions.map((item) => {
                    const isAll = item.code === 'ALL';
                    const isSelected = isAll ? draftRegion === null : draftRegion === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setDraftRegion(isAll || isSelected ? null : (item.code as RegionCode))
                        }
                        className={cn(
                          'h-[34px] rounded-btn px-4 text-xs leading-4 shadow-card',
                          isSelected
                            ? 'border border-primary bg-white font-bold text-primary'
                            : 'border border-gray-2 bg-white text-gray-4',
                        )}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </FilterGroup>

                <FilterGroup label="고민" className="gap-y-2">
                  {themes.map((theme) => {
                    const isSelected = draftTheme === theme.code;
                    return (
                      <button
                        key={theme.code}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setDraftTheme(isSelected ? null : (theme.code as ThemeType))}
                        className={cn(
                          'flex h-[34px] items-center gap-1 rounded-btn px-4 text-xs leading-4 shadow-card',
                          isSelected
                            ? 'border border-primary bg-white font-bold text-primary'
                            : 'border border-gray-2 bg-white text-gray-4',
                        )}
                      >
                        <img
                          src={THEME_ICONS[theme.code] ?? themeOther}
                          alt=""
                          className="size-[18px]"
                        />
                        {theme.name.replace(/ 터$/, '')}
                      </button>
                    );
                  })}
                </FilterGroup>
              </div>

              <button
                type="button"
                onClick={applyFilters}
                className="typo-body-3 mt-[30px] h-12 w-full rounded-btn bg-primary px-5 text-white"
              >
                필터 적용하기
              </button>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="typo-body-3 text-gray-6">{label}</h3>
      <div className={cn('mt-2.5 flex flex-wrap gap-1', className)}>{children}</div>
    </div>
  );
}
