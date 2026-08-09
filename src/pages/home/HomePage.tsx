import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';

import { isOnboardingRequired } from '../../api/onboardingRequired';
import placeSample from '../../assets/home/place-sample.jpg';
import GuestLoginPrompt from '../../components/GuestLoginPrompt';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { formatKoreanDate } from '../../lib/date';
import {
  useEnergyRoutines,
  useHomeHeader,
  useRecommendedPlaces,
  useTodayEnergy,
} from '../../hooks/home/useHome';
import { toOhaengKey } from '../../types/home/homeEnergy';
import EditorPicks from './components/EditorPicks';
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
  // 게스트에게 열어줄 카드 수·안내 문구는 서버 응답(visibleCount·loginPrompt)을 따른다.
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

  // 온보딩(사주 리포트) 미완료. 헤더를 뺀 3개가 전부 이걸 전제로 하므로,
  // 하나라도 이 신호를 주면 세 섹션을 각각 실패로 보여주는 대신 유도 카드 하나로 대체한다.
  // 이 상태에서 "다시 시도"를 띄우면 영영 404라 사용자가 빠져나갈 길이 없다.
  const needsOnboarding = [energyQuery, routinesQuery, recommendedQuery].some((q) =>
    isOnboardingRequired(q.error),
  );

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
    <RecommendedPlaceCard key={id} {...card} onClick={() => navigate(`/matched-ter/${id}`)} />
  );

  // 게스트에게 몇 장을 열어줄지는 서버가 정한다(`visibleCount`). 회원은 전부 본다.
  // 서버가 값을 안 주는 동안에도 화면이 무너지지 않게 1장으로 폴백한다.
  // ⚠️ 이 수와 라우트 가드(RequireAuth)의 허용 범위는 같은 값이어야 한다 —
  //    어긋나면 홈에 보이는 카드를 눌렀는데 로그인으로 튕긴다.
  const visibleCount = isMember ? cards.length : (recommendedQuery.data?.visibleCount ?? 1);
  const visibleCards = cards.slice(0, visibleCount);
  const loginPrompt = recommendedQuery.data?.loginPrompt;

  // 잠긴 추천이 더 있는지는 `totalCount > visibleCount`로만 알 수 있다.
  // BE는 이미 잘라낸 배열을 주고 `visibleCount = recommendations.size()`로 채우므로
  // (RecommendedPlaceService: 게스트 limit 1) 배열에는 가릴 카드가 애초에 들어 있지 않다.
  // 예전 `cards[1]` 조건이 이 이유로 한 번도 참이 된 적이 없어 게이트가 죽어 있었다.
  const totalCount = recommendedQuery.data?.totalCount ?? 0;
  const lockedCount = Math.max(0, totalCount - visibleCount);
  const hasLockedMore = !isMember && lockedCount > 0;

  return (
    <div className="relative flex-1 bg-gray-1">
      {/* 오행별 배경 그라데이션 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[530px] rounded-b-[30px]"
        style={{ background: theme.bgGradient }}
      />

      <div className="relative flex flex-col gap-8 px-5 pb-8 pt-[70px]">
        {/* 인사말 + 알림 벨 */}
        <header className="flex items-start justify-between gap-3 text-white">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
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
          </div>
          {/* 알림 진입점. 지금까지 알림 화면으로 갈 경로가 아예 없었다.
              알림은 회원 전용이라 게스트에겐 아예 노출하지 않는다 — 눌러봐야 로그인으로
              튕길 버튼을 보여줄 이유가 없다(에디터 오행 픽과 같은 기준).
              인사말 API와 무관한 고정 요소라 로딩·실패 상태에서도 그대로 둔다.
              ⚠️ 시안에는 안 읽은 알림 빨간 점이 있지만 미확인 개수를 주는 API가 없다 —
                 NotificationPage 데이터도 아직 하드코딩 목이라 벨 배지는 후속으로 남긴다. */}
          {isMember && (
            <button
              type="button"
              aria-label="알림"
              onClick={() => navigate('/my/notifications')}
              className="shrink-0 pt-0.5"
            >
              <Bell className="size-6" strokeWidth={2} />
            </button>
          )}
        </header>

        {needsOnboarding ? (
          <OnboardingPrompt onStart={() => navigate('/onboarding/step-1')} />
        ) : (
          <>
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
                {visibleCards.map(renderCard)}
                {/* 잠금 게이트는 가릴 추천이 실제로 더 있을 때만 — 로딩·에러 상태에서 빈 오버레이가 뜨지 않게 한다 */}
                {recommendedState === 'ready' && hasLockedMore && isAuthPending && (
                  // 회원 판정 전 — 게이트를 띄우면 복원되는 회원에게 깜빡였다 사라진다. 자리만 잡는다.
                  <BlockSkeleton className="h-[224px] rounded-[20px]" label="추천 터 불러오는 중" />
                )}
                {recommendedState === 'ready' && hasLockedMore && !isAuthPending && (
                  // 서버가 잠긴 카드는 아예 내려주지 않으므로 가릴 대상이 없다 —
                  // 카드 자리를 그대로 차지하는 게이트 카드 하나로 대신한다.
                  // 문구는 서버 loginPrompt를 쓰고, 없으면 기존 문구로 폴백한다.
                  <div className="flex h-[224px] items-center justify-center rounded-[20px] bg-white shadow-card">
                    {/* 기록·마이 잠금 화면과 같은 블록을 쓴다. 문구만 홈 기본값으로 덮는다. */}
                    <GuestLoginPrompt
                      title={loginPrompt?.title ?? '로그인 후 더 많은 터를 탐색해보세요'}
                      buttonText={loginPrompt?.buttonText}
                    />
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* 에디터 오행 픽 — 시안(2349:2783)에서 홈 맨 아래. 회원에게만 보인다.
            사주·리포트와 무관한 에디터 큐레이션이라(`/places/editor-picks`는 익명도 200)
            온보딩 유도 화면일 때도 그대로 보여준다. */}
        {isMember && <EditorPicks />}
      </div>
    </div>
  );
}

/**
 * 온보딩 미완료 안내.
 *
 * 기운·루틴·추천은 전부 사주 리포트를 전제로 한다. 리포트가 없으면 서버가 404를 주는데
 * 이건 장애가 아니라 "아직 안 만들었다"는 뜻이므로, 실패 UI가 아니라 다음 할 일을 보여준다.
 * 세 섹션을 통째로 대체한다 — 같은 안내를 세 번 반복하지 않기 위해서다.
 */
function OnboardingPrompt({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex flex-col items-center gap-5 rounded-[20px] bg-white px-5 py-8 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-extrabold text-gray-6">아직 나의 기운을 몰라요</p>
        <p className="text-sm font-normal leading-5 text-gray-4">
          생년월일만 알려주면 오늘의 기운과
          <br />잘 맞는 터를 찾아드릴게요.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="h-12 w-full rounded-[20px] bg-primary text-sm font-bold text-white"
      >
        1분 만에 내 기운 확인하기
      </button>
    </section>
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
