import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

import placeSample from '../../assets/home/place-sample.jpg';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { formatKoreanDate } from '../../lib/date';
import {
  useEnergyRoutines,
  useHomeHeader,
  useRecommendedPlaces,
  useTodayEnergy,
} from '../../hooks/home/useHome';
import { toOhaengKey } from '../../types/home/homeEnergy';
import EnergyCard from './components/EnergyCard';
import RecommendedPlaceCard from './components/RecommendedPlaceCard';
import RoutineChips from './components/RoutineChips';
import { OHAENG_HOME } from './ohaeng';

// 홈 데이터는 서버에서 온다. 실패했을 때 하드코딩된 값으로 화면을 채우면
// 데이터가 안 왔다는 사실이 감춰지므로(배포본에서 실제로 그랬다), 로딩·에러를 각 영역에서 드러낸다.
// 오행 테마(배경 그라데이션)만 로드 전 water로 두는데, 이건 데이터가 아니라 색상 뼈대다.

/**
 * 화면에 보여줄 상태 판정. 데이터가 실제로 손에 있는지를 기준으로 한다.
 *
 * `isError`만 보면 안 된다 — react-query는 브라우저가 오프라인이라고 판단하면 재시도를 멈추고
 * `fetchStatus: 'paused'` + `status: 'pending'`으로 붙잡아 둔다. 그러면 에러 UI가 영영 안 뜨고
 * 스켈레톤만 남는다(실측으로 확인). 멈춘 것도 실패로 보여줘야 사용자가 다시 시도할 수 있다.
 */
function viewStateOf(query: {
  data: unknown;
  isError: boolean;
  fetchStatus: 'fetching' | 'paused' | 'idle';
}): 'loading' | 'failed' | 'ready' {
  if (query.data !== undefined) return 'ready';
  if (query.isError || query.fetchStatus === 'paused') return 'failed';
  return 'loading';
}

export default function HomePage() {
  const navigate = useNavigate();
  // 게스트는 첫 카드만 보이고 나머지는 블러 + 로그인 게이트로 가린다.
  // TODO: BE 배포 후 /home/recommended-place의 userType·isLimited·visibleCount·loginPrompt로 교체.
  // isAuthPending = 부팅 세션 복원 중. 이때 게스트로 단정해 게이트를 띄우면,
  // 복원되는 회원에게 "로그인하러 가기"가 깜빡였다 사라진다.
  const { isMember, isPending: isAuthPending } = useAuthStatus();

  const energyQuery = useTodayEnergy();
  const headerQuery = useHomeHeader();
  const routinesQuery = useEnergyRoutines();
  const recommendedQuery = useRecommendedPlaces();

  const header = headerQuery.data;
  const routines = routinesQuery.data;
  const headerState = viewStateOf(headerQuery);
  const energyState = viewStateOf(energyQuery);
  const routinesState = viewStateOf(routinesQuery);
  const recommendedState = viewStateOf(recommendedQuery);

  const energy = energyQuery.data;
  const ohaengKey = energy ? toOhaengKey(energy.element.code) : 'water';
  const theme = OHAENG_HOME[ohaengKey];

  // 루틴 섹션 제목은 BE가 안 준다 — 오행 표시명으로 만든다("토" → "토기 에너지 루틴", 시안 기준).
  const routineTitle = routines ? `${routines.element.name}기 에너지 루틴` : '';
  // order는 서버가 매기는 노출 순서다. 배열 순서에 기대지 않고 명시적으로 정렬한다.
  const routineTexts = [...(routines?.routines ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((r) => r.text);

  // 서버 추천 목록 → 카드 props.
  // badge·subtitle에 대응하는 BE 필드가 없다 — 시안 싱크에서 문구를 확정할 것.
  const cards =
    recommendedQuery.data?.recommendations.map((p) => ({
      id: String(p.placeId),
      image: p.thumbnailUrl ?? placeSample,
      badge: p.rankOrder === 1 ? '최고 궁합' : '추천 터',
      name: p.placeName,
      description: p.recommendationReason ?? '',
      distance: p.distanceKm != null ? `${p.distanceKm}km` : '',
      rating: p.averageRating ?? 0,
    })) ?? [];

  // 추천 카드 클릭 → 나와 어울리는 터(장소 상세)로 이동.
  const renderCard = ({ id, ...card }: (typeof cards)[number]) => (
    <RecommendedPlaceCard {...card} onClick={() => navigate(`/matched-ter/${id}`)} />
  );

  return (
    <div className="relative min-h-dvh bg-gray-1">
      {/* 오행별 배경 그라데이션 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[530px] rounded-b-[30px]"
        style={{ background: theme.bgGradient }}
      />

      <div className="relative flex flex-col gap-8 px-5 pb-8 pt-[70px]">
        {/* 인사말 */}
        <header className="flex flex-col gap-5 text-white">
          {headerState === 'loading' ? (
            <HeaderSkeleton />
          ) : headerState === 'failed' ? (
            <SectionError
              tone="light"
              message="인사말을 불러오지 못했어요."
              onRetry={() => void headerQuery.refetch()}
            />
          ) : (
            <>
              <p className="text-base font-bold">
                {header ? formatKoreanDate(header.date, header.dayOfWeek) : ''}
              </p>
              <div className="flex flex-col gap-2">
                {/* 인사 문구는 서버가 통째로 내려준다(게스트/회원, 닉네임 유무까지 서버 판단). */}
                <p className="text-2xl font-extrabold">{header?.greeting}</p>
                <p className="text-[17px] font-bold">{header?.subGreeting}</p>
              </div>
            </>
          )}
        </header>

        {energyState === 'loading' ? (
          <BlockSkeleton className="h-[280px] rounded-[20px]" label="오늘의 기운 불러오는 중" />
        ) : energyState === 'failed' ? (
          <SectionError
            message="오늘의 기운을 불러오지 못했어요."
            onRetry={() => void energyQuery.refetch()}
          />
        ) : (
          <EnergyCard
            element={theme.key}
            label={energy?.element.name ?? ''}
            desc={energy?.description ?? ''}
          />
        )}

        {routinesState === 'loading' ? (
          <BlockSkeleton className="h-[76px] rounded-[20px]" label="에너지 루틴 불러오는 중" />
        ) : routinesState === 'failed' ? (
          <SectionError
            message="에너지 루틴을 불러오지 못했어요."
            onRetry={() => void routinesQuery.refetch()}
          />
        ) : (
          <RoutineChips title={routineTitle} routines={routineTexts} />
        )}

        {/* 오늘 가장 잘 맞는 터 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-gray-6">오늘 가장 잘 맞는 터</h2>
          <div className="flex flex-col gap-3">
            {recommendedState === 'loading' && (
              <BlockSkeleton className="h-[224px] rounded-[20px]" label="추천 터 불러오는 중" />
            )}
            {recommendedState === 'failed' && (
              <SectionError
                message="추천 터를 불러오지 못했어요."
                onRetry={() => void recommendedQuery.refetch()}
              />
            )}
            {recommendedState === 'ready' && cards.length === 0 && (
              <p className="rounded-[20px] bg-white px-5 py-8 text-center text-sm text-gray-4">
                오늘 추천할 터를 찾지 못했어요.
              </p>
            )}
            {cards[0] && renderCard(cards[0])}
            {/* 잠금 게이트는 가릴 카드가 실제로 있을 때만 — 로딩·에러 상태에서 빈 오버레이가 뜨지 않게 한다 */}
            {cards[1] && isAuthPending ? (
              // 회원 판정 전 — 게이트도 카드도 아직 확정할 수 없다. 자리만 잡아 화면이 튀지 않게 한다.
              <BlockSkeleton className="h-[224px] rounded-[20px]" label="추천 터 불러오는 중" />
            ) : cards[1] && !isMember ? (
              // 로그인 전: 둘째 카드를 흰색 그라데이션으로 가리고 로그인 게이트를 얹는다.
              <div className="relative">
                {renderCard(cards[1])}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[20px]"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.75) 10%, #ffffff 53%)',
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-[22px]">
                  <div className="flex flex-col items-center gap-3">
                    <Lock className="size-6 text-primary" strokeWidth={2.2} />
                    <p className="text-base font-bold text-gray-6">
                      로그인 후 더 많은 터를 탐색해보세요
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="h-12 w-full rounded-[20px] bg-primary text-sm font-bold text-white"
                  >
                    로그인/회원가입 하러가기
                  </button>
                </div>
              </div>
            ) : (
              isMember && cards[1] && renderCard(cards[1])
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/** 로딩 자리표시자. 실제 영역과 같은 높이를 잡아 데이터가 들어올 때 화면이 튀지 않게 한다. */
function BlockSkeleton({ className, label }: { className: string; label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`w-full animate-pulse bg-white/60 ${className}`}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div
      role="status"
      aria-label="인사말 불러오는 중"
      className="flex animate-pulse flex-col gap-5"
    >
      <div className="h-[22px] w-40 rounded bg-white/50" />
      <div className="flex flex-col gap-2">
        <div className="h-8 w-56 rounded bg-white/50" />
        <div className="h-[19px] w-44 rounded bg-white/50" />
      </div>
    </div>
  );
}

/**
 * 영역 단위 실패 안내. 홈은 4개 API가 독립적이라 한 곳이 실패해도 나머지는 보여준다.
 * tone='light'는 배경 그라데이션 위(인사말 영역)에서 쓰는 흰 글씨 버전.
 */
function SectionError({
  message,
  onRetry,
  tone = 'dark',
}: {
  message: string;
  onRetry: () => void;
  tone?: 'dark' | 'light';
}) {
  const isLight = tone === 'light';

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-[20px] px-5 py-4 ${
        isLight ? 'bg-white/20 text-white' : 'bg-white text-gray-5'
      }`}
    >
      <p className="text-sm font-bold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
          isLight ? 'bg-white/30 text-white' : 'bg-gray-1 text-primary'
        }`}
      >
        다시 시도
      </button>
    </div>
  );
}
