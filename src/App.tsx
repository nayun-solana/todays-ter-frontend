import { useEffect } from 'react';

import { restoreSession } from './api/session';
import AppRoutes from './app/AppRoutes';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';

/**
 * 앱 셸 — 모든 페이지 배경이 뷰포트 전체 폭을 채우게 한다.
 *
 * 카드·CTA처럼 실제 콘텐츠 폭이 제한된 요소만 각 화면에서 캡을 유지한다.
 */

function App() {
  // 부팅 시 세션 복원 1회(localStorage 토큰이 없어도 refresh 쿠키로 회원인지 확인한다).
  // 화면은 기다리지 않고 바로 그린다 — 판정을 기다리는 건 회원 전용 라우트 가드뿐이다.
  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <div className="relative min-h-dvh w-full bg-gray-1">
      <AppRoutes />
      <PwaUpdatePrompt />
    </div>
  );
}

export default App;
