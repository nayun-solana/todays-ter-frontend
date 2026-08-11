import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import BottomNavBar, { type NavTabKey } from '../components/BottomNavBar';
import { RequireMember, RequireMemberTab, RequireRecommendationAccess } from './RequireAuth';
import SessionGate from './SessionGate';

// 라우트별 코드 스플리팅: 방문하는 화면 청크만 로드된다.
const HomePage = lazy(() => import('../pages/home/HomePage'));
const SearchPage = lazy(() => import('../pages/search/SearchPage'));
const RecordPage = lazy(() => import('../pages/record/RecordPage'));
const MyPage = lazy(() => import('../pages/my/MyPage'));
const AccountLinkPage = lazy(() => import('../pages/my/AccountLinkPage'));
const NotificationPage = lazy(() => import('../pages/my/NotificationPage'));
const NotificationSettingsPage = lazy(() => import('../pages/my/NotificationSettingsPage'));
const PermissionsPage = lazy(() => import('../pages/my/PermissionsPage'));
const PoliciesPage = lazy(() => import('../pages/my/PoliciesPage'));
const PrivatePage = lazy(() => import('../pages/policy/PrivatePage'));
const WithdrawalPage = lazy(() => import('../pages/my/WithdrawalPage'));
const SajuEditPage = lazy(() => import('../pages/my/SajuEditPage'));
// SajuReportCompletePage는 SajuEditPage 모듈의 named export → default로 매핑
const SajuReportCompletePage = lazy(() =>
  import('../pages/my/SajuEditPage').then((m) => ({ default: m.SajuReportCompletePage })),
);
const ConcernEditCompletePage = lazy(() => import('../pages/my/ConcernEditCompletePage'));
const OnboardingPage1 = lazy(() => import('../pages/onboarding/OnboardingPage1'));
const OnboardingPage2 = lazy(() => import('../pages/onboarding/OnboardingPage2'));
const OnboardingPage3 = lazy(() => import('../pages/onboarding/OnboardingPage3'));
const ReportPage = lazy(() => import('../pages/onboarding/ReportPage'));
const ReportDetailPage = lazy(() => import('../pages/onboarding/ReportDetailPage'));
const PlaceDetailPage = lazy(() => import('../pages/place/PlaceDetailPage'));
const PlaceReviewPage = lazy(() => import('../pages/review/PlaceReviewPage'));
const ReviewCompletePage = lazy(() => import('../pages/review/ReviewCompletePage'));
const ReviewDetailPage = lazy(() => import('../pages/review/ReviewDetailPage'));
const ReviewPage = lazy(() => import('../pages/review/ReviewPage'));
const MatchedTerPage = lazy(() => import('../pages/matched-ter/MatchedTerPage'));
const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const KakaoCallbackPage = lazy(() => import('../pages/auth/KakaoCallbackPage'));
const PlaceReviewCompletePage = lazy(() => import('../pages/review/PlaceReviewCompletePage'));

const TAB_PATHS: Record<NavTabKey, string> = {
  home: '/home',
  search: '/search',
  record: '/record',
  my: '/my',
};

function pathToTab(pathname: string): NavTabKey {
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/record')) return 'record';
  if (pathname.startsWith('/my')) return 'my';
  return 'home';
}

/** 하단 탭이 있는 메인 레이아웃. */
function MainTabsLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = pathToTab(pathname);

  // 배경·최소 높이·하단바 여백은 여기서만 잡는다. 페이지가 각자 min-h-dvh를 또 주면
  // 레이아웃 패딩만큼 높이가 넘쳐 늘 빈 스크롤이 생기고, 패딩 영역은 배경이 없어
  // 하단바 주변이 별도 상자처럼 보였다. 페이지는 flex-1로 남는 높이를 채운다.
  return (
    <div className="flex min-h-dvh flex-col bg-gray-1 pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <Outlet />
      <BottomNavBar active={activeTab} onChange={(tab) => navigate(TAB_PATHS[tab])} />
    </div>
  );
}

/** 하단 탭 없는 레이아웃 (온보딩, 상세 등) */
function NoFooterLayout() {
  return <Outlet />;
}

/** lazy 라우트 청크 로딩 중 표시 (레이아웃 흔들림 최소화) */
function RouteFallback() {
  return <div className="min-h-dvh bg-gray-1" aria-busy="true" aria-label="불러오는 중" />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* 세션(회원 토큰·게스트 쿠키) 없이 URL을 직접 쳐서 들어온 방문자를 로그인으로 보낸다.
            로그인·카카오 콜백·공유 링크는 이 바깥에 둔다 — 아래 참고. */}
        <Route element={<SessionGate />}>
          {/* 루트는 홈으로. 세션이 없으면 위 SessionGate가 로그인으로 돌린다
              (예전에는 `/login` 고정이라 세션이 있어도 로그인 화면부터 시작했다). */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* 하단바 있는 메인 탭. 홈·탐색은 게스트 공개, 기록은 회원 전용.
            탐색이 쓰는 /places·/places/editor-picks·/places/explore-filters는 익명 호출도 200이라
            게스트 세션 없이도 그대로 뜬다(실측 2026-08-07).
            마이는 게스트도 열되(로그인 유도 화면), 하위 설정 화면은 계속 회원 전용이다. */}
          <Route element={<MainTabsLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            {/* 탭은 게스트가 직접 누르는 곳이라 로그인으로 튕기지 않고 잠금 화면을 보여준다.
              하위 화면(리뷰 작성·마이 설정 등)은 아래 RequireMember 그대로 /login으로 보낸다. */}
            <Route element={<RequireMemberTab title="내 터" variant="record" />}>
              <Route path="/record" element={<RecordPage />} />
            </Route>
            <Route element={<RequireMemberTab title="마이페이지" variant="my" />}>
              <Route path="/my" element={<MyPage />} />
            </Route>
          </Route>

          {/* 하단바 없는 화면 */}
          <Route element={<NoFooterLayout />}>
            <Route path="/onboarding">
              <Route index element={<Navigate to="/onboarding/step-1" replace />} />
              <Route path="step-1" element={<OnboardingPage1 />} />
              <Route path="step-2" element={<OnboardingPage2 />} />
              <Route path="step-3" element={<OnboardingPage3 />} />
            </Route>
            {/* 게스트 조건부: 홈에서 노출이 허용된 추천 카드로 들어온 경우에만 진입 가능 */}
            <Route element={<RequireRecommendationAccess />}>
              <Route path="/matched-ter/:id" element={<MatchedTerPage />} />
            </Route>

            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/report/:id/detail" element={<ReportDetailPage />} />

            {/* 장소 상세는 게스트 공개(탐색에서 이어지는 화면).
              `GET /places/{placeId}`도 익명 200이라 그대로 뜬다(실측 2026-08-07). */}
            <Route path="/place/:id" element={<PlaceDetailPage />} />

            {/* 회원 전용 — 기록·리뷰 작성·저장·마이 */}
            <Route element={<RequireMember />}>
              <Route path="/matched-ter/:id/review" element={<ReviewPage />} />
              <Route path="/matched-ter/:id/review/complete" element={<ReviewCompletePage />} />
              <Route path="/place/:id/review" element={<PlaceReviewPage />} />
              <Route path="/place/:id/review/edit" element={<PlaceReviewPage mode="edit" />} />
              <Route path="/place/:id/review/complete" element={<PlaceReviewCompletePage />} />
              <Route path="/review/:recordId" element={<ReviewDetailPage />} />
              <Route path="/review/:recordId/edit" element={<ReviewPage mode="edit" />} />

              <Route path="/my/saju" element={<SajuEditPage />} />
              <Route path="/my/saju/complete" element={<SajuReportCompletePage />} />
              {/* 고민유형 재선택 — 온보딩3 화면을 그대로 쓰고 CTA·이동만 다르다 */}
              <Route path="/my/concerns" element={<OnboardingPage3 mode="edit" />} />
              <Route path="/my/concerns/complete" element={<ConcernEditCompletePage />} />
              <Route path="/my/notifications" element={<NotificationPage />} />
              <Route path="/my/notification-settings" element={<NotificationSettingsPage />} />
              <Route path="/my/account-links" element={<AccountLinkPage />} />
              <Route path="/my/permissions" element={<PermissionsPage />} />
              <Route path="/my/policies" element={<PoliciesPage />} />
              <Route path="/my/withdrawal" element={<WithdrawalPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── 여기부터는 SessionGate 바깥 ── */}
        <Route element={<NoFooterLayout />}>
          {/* 세션을 만들러 오는 화면이라 게이트를 태우면 들어올 수가 없다. */}
          <Route path="/login" element={<LoginPage />} />
          {/* 이용약관·개인정보처리방침 전문. 앱 안에서도 열리지만, 심사·외부 공유용으로
              로그인 없이 주소만으로도 열려야 하므로 가드 없이 공개한다.
              (vercel.json의 catch-all rewrite가 이 경로를 index.html로 보낸다) */}
          <Route path="/private" element={<PrivatePage />} />
          {/* 카카오 인가 콜백. 경로는 카카오 콘솔 등록값과 일치해야 한다(src/lib/kakao.ts). */}
          <Route path="/oauth/kakao/callback" element={<KakaoCallbackPage />} />

          {/* 공유 링크 진입 — 인증·가드 없이 열려야 한다. 받는 사람은 우리 사용자가 아닐 수
              있어서 세션 게이트까지 걸면 공유 기능 자체가 죽는다. */}
          <Route path="/matched-ter/shared/:token" element={<MatchedTerPage variant="shared" />} />
          {/* BE가 예전에 내려주던 shareUrl 경로. 지금은 위 경로로 고쳐서 보내지만(실측),
              그 사이에 뿌려진 링크도 열리도록 당분간 같이 받아준다.
              ⚠️ dev에서는 확인 불가 — vite.config의 `/recommendations` 프록시가 이 주소를 가로채
              API JSON을 돌려준다. 실제 동작은 배포본(Vercel rewrite)에서만 확인된다. */}
          <Route
            path="/recommendations/places/shared/:token"
            element={<MatchedTerPage variant="shared" />}
          />
        </Route>

        {/* 없는 주소는 임시로 홈으로 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}
