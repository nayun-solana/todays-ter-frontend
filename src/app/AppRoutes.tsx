import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';

import HomePage from '../pages/home/HomePage';
import SearchPage from '../pages/search/SearchPage';
import RecordPage from '../pages/record/RecordPage';
import MyPage from '../pages/my/MyPage';
import OnboardingPage1 from '../pages/onboarding/OnboardingPage1';
import OnboardingPage2 from '../pages/onboarding/OnboardingPage2';
import OnboardingPage3 from '../pages/onboarding/OnboardingPage3';
import PlaceDetailPage from '../pages/place/PlaceDetailPage';

type TabKey = 'home' | 'search' | 'record' | 'my';

const TABS: { key: TabKey; label: string; path: string }[] = [
  { key: 'home', label: '홈', path: '/home' },
  { key: 'search', label: '탐색', path: '/search' },
  { key: 'record', label: '기록', path: '/record' },
  { key: 'my', label: '마이', path: '/my' },
];

function pathToTab(pathname: string): TabKey {
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/record')) return 'record';
  if (pathname.startsWith('/my')) return 'my';
  return 'home';
}

/**
 * 하단 탭이 있는 메인 레이아웃.
 * TODO(Step 3): 하단 nav를 공용 BottomNavBar 컴포넌트로 교체.
 */
function MainTabsLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = pathToTab(pathname);

  return (
    <div className="min-h-screen pb-16">
      <Outlet />
      <nav className="fixed bottom-0 left-1/2 z-50 flex h-16 w-full max-w-[390px] -translate-x-1/2 items-center justify-around border-t border-gray-3 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.path)}
            className={activeTab === tab.key ? 'font-bold text-primary' : 'text-gray-4'}
          >
            {tab.label}
          </button>
        ))}
      </nav>
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
        <Route path="/onboarding">
          <Route index element={<Navigate to="/onboarding/step-1" replace />} />
          <Route path="step-1" element={<OnboardingPage1 />} />
          <Route path="step-2" element={<OnboardingPage2 />} />
          <Route path="step-3" element={<OnboardingPage3 />} />
        </Route>
        <Route path="/place/:id" element={<PlaceDetailPage />} />
      </Route>

      {/* 없는 주소는 임시로 홈으로 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
