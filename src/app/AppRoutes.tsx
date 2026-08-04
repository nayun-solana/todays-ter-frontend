import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import BottomNavBar, { type NavTabKey } from '../components/BottomNavBar';
import { RequireMember, RequireRecommendationAccess } from './RequireAuth';

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
const WithdrawalPage = lazy(() => import('../pages/my/WithdrawalPage'));
const SajuEditPage = lazy(() => import('../pages/my/SajuEditPage'));
// SajuReportCompletePage는 SajuEditPage 모듈의 named export → default로 매핑
const SajuReportCompletePage = lazy(() =>
  import('../pages/my/SajuEditPage').then((m) => ({ default: m.SajuReportCompletePage })),
);
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

  return (
    <div className="min-h-screen pb-24">
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
  return <div className="min-h-screen bg-gray-1" aria-busy="true" aria-label="불러오는 중" />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* 데모 진입점: 서비스 흐름(로그인→온보딩→홈)을 보여주기 위해 로그인으로 시작.
            실서비스 배포 시 인증(토큰/게스트 세션) 유무에 따라 /home 또는 /login으로 분기 예정. */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 하단바 있는 메인 탭. 홈만 게스트 공개, 나머지 탭은 회원 전용.
            ⚠️ /search는 성원 담당 화면 — 게스트 탐색 허용 여부 팀 확인 필요. */}
        <Route element={<MainTabsLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route element={<RequireMember />}>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/my" element={<MyPage />} />
          </Route>
        </Route>

        {/* 하단바 없는 화면 */}
        <Route element={<NoFooterLayout />}>
          <Route path="/login" element={<LoginPage />} />
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

          {/* 회원 전용 */}
          <Route element={<RequireMember />}>
            <Route path="/place/:id" element={<PlaceDetailPage />} />
            <Route path="/matched-ter/:id/review" element={<ReviewPage />} />
            <Route path="/matched-ter/:id/review/complete" element={<ReviewCompletePage />} />
            <Route path="/place/:id/review" element={<PlaceReviewPage />} />
            <Route path="/place/:id/review/edit" element={<PlaceReviewPage mode="edit" />} />
            <Route path="/place/:id/review/complete" element={<PlaceReviewCompletePage />} />
            <Route path="/review/:visitId" element={<ReviewDetailPage />} />

            <Route path="/my/saju" element={<SajuEditPage />} />
            <Route path="/my/saju/complete" element={<SajuReportCompletePage />} />
            <Route path="/my/notifications" element={<NotificationPage />} />
            <Route path="/my/notification-settings" element={<NotificationSettingsPage />} />
            <Route path="/my/account-links" element={<AccountLinkPage />} />
            <Route path="/my/permissions" element={<PermissionsPage />} />
            <Route path="/my/policies" element={<PoliciesPage />} />
            <Route path="/my/withdrawal" element={<WithdrawalPage />} />
          </Route>
        </Route>

        {/* 없는 주소는 임시로 홈으로 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}
