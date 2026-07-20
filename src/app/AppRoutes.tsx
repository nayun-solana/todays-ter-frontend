import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';

import BottomNavBar, { type NavTabKey } from '../components/BottomNavBar';
import HomePage from '../pages/home/HomePage';
import SearchPage from '../pages/search/SearchPage';
import RecordPage from '../pages/record/RecordPage';
import MyPage from '../pages/my/MyPage';
import OnboardingPage1 from '../pages/onboarding/OnboardingPage1';
import OnboardingPage2 from '../pages/onboarding/OnboardingPage2';
import OnboardingPage3 from '../pages/onboarding/OnboardingPage3';
import PlaceDetailPage from '../pages/place/PlaceDetailPage';
import ReviewCompletePage from '../pages/review/ReviewCompletePage';
import ReviewPage from '../pages/review/ReviewPage';
import MatchedTerPage from '../pages/matched-ter/MatchedTerPage';
import LoginPage from '../pages/login/LoginPage';
import TestPage from '../pages/test';

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
    <div className="min-h-screen pb-16">
      <Outlet />
      <BottomNavBar active={activeTab} onChange={(tab) => navigate(TAB_PATHS[tab])} />
    </div>
  );
}

/** 하단 탭 없는 레이아웃 (온보딩, 상세 등) */
function NoFooterLayout() {
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* TODO(Step 4): 로그인 연동 후 /login 또는 /onboarding 분기 */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* 하단바 있는 메인 탭 */}
      <Route element={<MainTabsLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/my" element={<MyPage />} />
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
        <Route path="/place/:id" element={<PlaceDetailPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/review/complete" element={<ReviewCompletePage />} />
        <Route path="/matched-ter/:id" element={<MatchedTerPage />} />
        {/* ponytail: 화면 확인용 임시 라우트. PR 전 삭제 */}
        <Route path="/test" element={<TestPage />} />
      </Route>

      {/* 없는 주소는 임시로 홈으로 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
