import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';

import filterCareer from '../../assets/search/filter-career.svg';
import filterHealth from '../../assets/search/filter-health.svg';
import filterLove from '../../assets/search/filter-love.svg';
import filterMoney from '../../assets/search/filter-money.svg';
import filterRelationship from '../../assets/search/filter-relationship.svg';
import iconArrowUp from '../../assets/search/icon-arrow-up.svg';
import iconFilter from '../../assets/search/icon-filter.svg';
import iconMap from '../../assets/search/icon-map.svg';
import iconReset from '../../assets/search/icon-reset.svg';
import themeOther from '../../assets/search/theme-other.svg';
import OhaengOrb from '../../components/OhaengOrb';
import PlaceListItem from '../../components/PlaceListItem';
import SectionError from '../../components/SectionError';
import { useExploreFilters, useInfinitePlaces } from '../../hooks/search/useSearch';
import { useGeolocation } from '../../hooks/useGeolocation';
import { cn } from '../../lib/cn';
import { OHAENG_LIST, ohaengByKey, toOhaengKey, type OhaengKey } from '../../lib/ohaeng';
import { getPlaceThumbnailUrl } from '../../lib/placeThumbnail';
import { type ElementCode } from '../../types/home/homeEnergy';
import { type RegionCode, type ThemeType } from '../../types/search/search';
import { loadFailureMessage, loadingMessage, loadingMoreMessage } from '../../lib/messages';

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

/** 서버가 필터 목록을 못 줄 때 쓰는 폴백. 오행 정의는 lib/ohaeng이 단일 소스다. */
const ELEMENTS: { label: string; key: OhaengKey }[] = OHAENG_LIST.map(({ key, label }) => ({
  key,
  label,
}));

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
  // 좌표를 함께 보내야 서버가 distanceKm을 채운다(안 보내면 항상 null, 실측).
  // 권한을 거부하거나 측위에 실패하면 undefined로 남고 거리만 빠진다 — 목록은 그대로 뜬다.
  const coords = useGeolocation();
  const placesQuery = useInfinitePlaces({
    keyword: deferredKeyword.trim() || undefined,
    regionCode: region ?? undefined,
    themeType: selectedTheme ?? undefined,
    elementType,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
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

  // 결과가 0건일 때 빠져나갈 길. 검색어를 남겨두면 초기화해도 여전히 0건이라
  // 버튼이 아무 일도 안 하는 것처럼 보인다 — 검색어·지역·테마·오행을 함께 되돌린다.
  const hasSearchCondition = appliedFilters.length > 0 || keyword.trim().length > 0;
  const resetConditions = () => {
    setKeyword('');
    setRegion(null);
    setSelectedTheme(null);
    setParams({});
  };

  return (
    <div className="w-full flex-1 bg-gray-1">
      <header
        className={cn(
          'sticky top-0 z-40 bg-white px-5 pb-4 pt-safe-5 transition-shadow',
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
            aria-label="장소 검색하기"
            placeholder="장소 검색하기"
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
            {/* 이미 받아둔 목록이 있으면 무엇보다 먼저 보여준다.
                isError를 목록보다 먼저 보면, 다음 페이지 요청이 한 번 실패했을 때
                (useInfiniteQuery는 이때 status를 'error'로 뒤집는다) 보고 있던 목록이
                통째로 사라지고 에러 문구 한 줄만 남는다. */}
            {placesQuery.isPending ? (
              <PlaceListSkeleton count={4} />
            ) : places.length > 0 ? (
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
            ) : placesQuery.isError ? (
              <SectionError
                message={loadFailureMessage('장소')}
                onRetry={() => void placesQuery.refetch()}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="typo-sub-2 text-gray-4">조건에 맞는 장소가 없습니다.</p>
                {hasSearchCondition ? (
                  <button
                    type="button"
                    onClick={resetConditions}
                    className="typo-sub-2 rounded-full bg-white px-4 py-2 font-bold text-primary shadow-card"
                  >
                    조건 초기화
                  </button>
                ) : null}
              </div>
            )}
          </div>
          <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
          {placesQuery.isFetchingNextPage ? (
            <PlaceListSkeleton count={1} className="mt-2" label={loadingMoreMessage('장소')} />
          ) : null}
          {/* 다음 페이지만 실패한 경우 — 목록은 그대로 두고 이어받기만 다시 시도한다.
              isError로 판정하면 초기 실패와 구분이 안 된다. isFetchNextPageError가
              "이미 받아둔 페이지는 멀쩡한데 이어받기만 실패했다"를 정확히 가리킨다. */}
          {placesQuery.isFetchNextPageError ? (
            <SectionError
              className="mt-2"
              message="더 불러오지 못했어요."
              onRetry={() => {
                // 관측자가 이미 재요청을 걸었을 수 있다 — 연타로 같은 페이지를 겹쳐 부르지 않는다.
                if (placesQuery.isFetchingNextPage) return;
                void placesQuery.fetchNextPage();
              }}
            />
          ) : null}
        </section>
      </main>

      {showTopButton ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로 이동"
          className="fixed right-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex size-10 items-center justify-center rounded-full bg-gray-2"
        >
          <img src={iconArrowUp} alt="" className="h-4 w-[18px] rotate-90" />
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
              <div className="flex items-center justify-between">
                <h2 id="search-filter-title" className="typo-head-2 text-gray-6">
                  탐색 필터
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setDraftRegion(null);
                    setDraftTheme(null);
                    setDraftElement(null);
                  }}
                  aria-label="필터 초기화"
                  className="typo-body-3 flex h-5 items-center gap-1.5 text-primary"
                >
                  초기화
                  <img src={iconReset} alt="" className="size-[13px]" />
                </button>
              </div>

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
                          'flex h-[34px] items-center justify-center gap-1 rounded-btn border px-4 text-xs leading-4 shadow-card',
                          isSelected
                            ? 'border-primary bg-white font-bold text-primary'
                            : 'border-gray-2 bg-white text-gray-4',
                        )}
                      >
                        {item.label}
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
                          'h-[34px] rounded-btn border px-4 text-xs leading-4 shadow-card',
                          isSelected
                            ? 'border-primary bg-white font-bold text-primary'
                            : 'border-gray-2 bg-white text-gray-4',
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
                          'flex h-[34px] items-center gap-1 rounded-btn border px-4 text-xs leading-4 shadow-card',
                          isSelected
                            ? 'border-primary bg-white font-bold text-primary'
                            : 'border-gray-2 bg-white text-gray-4',
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

/**
 * 로딩 자리표시자. PlaceListItem과 같은 높이(h-21)를 잡아 데이터가 들어올 때 화면이 튀지 않게 한다.
 * 폭은 실물과 같이 부모를 따라간다 — 고정하는 건 높이뿐이다.
 */
function PlaceListSkeleton({
  count,
  className,
  label = loadingMessage('장소'),
}: {
  count: number;
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-21 w-full animate-pulse rounded-xl bg-gray-2" />
      ))}
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
