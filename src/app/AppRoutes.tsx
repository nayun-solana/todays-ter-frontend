// src/app/AppRoutes.tsx
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';

import HomePage from '../pages/home/HomePage';
import SearchPage from '../pages/search/SearchPage';
import RecordPage from '../pages/record/RecordPage';
import MyPage from '../pages/my/MyPage';
import OnboardingPage1 from '../pages/onboarding/OnboardingPage1';
import OnboardingPage2 from '../pages/onboarding/OnboardingPage2';
import OnboardingPage3 from '../pages/onboarding/OnboardingPage3';

type TabKey = 'home' | 'search' | 'record' | 'my';

function pathToTab(pathname: string): TabKey {
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/record')) return 'record';
  if (pathname.startsWith('/my')) return 'my';

  return 'home';
}

function tabToPath(tab: TabKey) {
  switch (tab) {
    case 'home':
      return '/home';
    case 'search':
      return '/search';
    case 'record':
      return '/record';
    case 'my':
      return '/my';
    default:
      return '/home';
  }
}

function MainTabsLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = pathToTab(pathname);

  return (
    <div className="min-h-screen pb-20 ">
      <main className="mx-auto w-full  ">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 z-50 border-t bg-white max-w-97.5">
        <div className="mx-auto flex h-16 w-97.5 items-center justify-around gap-2 px-5">
          <button
            type="button"
            onClick={() => navigate(tabToPath('home'))}
            className={activeTab === 'home' ? 'font-bold text-black' : 'text-gray-400'}
          >
            홈
          </button>

          <button
            type="button"
            onClick={() => navigate(tabToPath('search'))}
            className={activeTab === 'search' ? 'font-bold text-black' : 'text-gray-400'}
          >
            검색
          </button>

          <button
            type="button"
            onClick={() => navigate(tabToPath('record'))}
            className={activeTab === 'record' ? 'font-bold text-black' : 'text-gray-400'}
          >
            기록
          </button>

          <button
            type="button"
            onClick={() => navigate(tabToPath('my'))}
            className={activeTab === 'my' ? 'font-bold text-black' : 'text-gray-400'}
          >
            마이
          </button>
        </div>
      </nav>
    </div>
  );
}

function NoFooterLayout() {
  return (
    <main className="mx-auto min-h-screen w-full  ">
      <Outlet />
    </main>
  );
}

function OnboardingLayout() {
  return <Outlet />;
}

/*
function RequireAuth() {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
*/

export default function AppRoutes() {
  // TODO: 로그인 연동 후 다시 사용
  // const accessToken = localStorage.getItem('accessToken');

  return (
    <Routes>
      {/* TODO: 로그인 연동 후 /login 또는 /onboarding 분기 처리 */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* TODO: 로그인 페이지 개발 후 주석 해제 */}
      {/*
      <Route element={<NoFooterLayout />}>
        <Route path="/login" element={<LoginPage />} />
      
      </Route>
      */}

      {/* TODO: 로그인 연동 후 RequireAuth로 감싸기 */}
      {/* <Route element={<RequireAuth />}> */}

      {/* 하단바 있는 메인 탭 */}
      <Route element={<MainTabsLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/my" element={<MyPage />} />
      </Route>

      {/* 하단바 없는 온보딩 */}
      <Route element={<NoFooterLayout />}>
        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route index element={<Navigate to="/onboarding/step-1" replace />} />
          <Route path="step-1" element={<OnboardingPage1 />} />
          <Route path="step-2" element={<OnboardingPage2 />} />
          <Route path="step-3" element={<OnboardingPage3 />} />
        </Route>
      </Route>

      {/* 없는 주소는 임시로 홈으로 이동 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
