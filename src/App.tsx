import { useEffect } from 'react';

import { restoreSession } from './api/session';
import AppRoutes from './app/AppRoutes';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';

/**
 * 앱 셸.
 *
 * 바깥 div는 뷰포트 전체를 덮어 데스크톱에서 좌우 여백의 바탕이 되고, 안쪽 열이 실제 화면이다.
 * 모바일에서는 `max-w-app`이 뷰포트보다 넓어 아무 효과가 없다 — 즉 모바일 렌더는 그대로다.
 *
 * 예전에는 폭 상한이 아예 없어서 데스크톱에서 텍스트·카드가 화면 끝까지 늘어났고,
 * `BottomNavBar`만 중앙 고정(`left-1/2 w-[332px]`)이라 하단바는 가운데, CTA는 전폭으로
 * 서로 어긋나 보였다.
 */

function App() {
  // 부팅 시 세션 복원 1회(localStorage 토큰이 없어도 refresh 쿠키로 회원인지 확인한다).
  // 화면은 기다리지 않고 바로 그린다 — 판정을 기다리는 건 회원 전용 라우트 가드뿐이다.
  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <div className="relative min-h-dvh w-full bg-gray-2">
      <div className="relative mx-auto min-h-dvh w-full max-w-app bg-gray-1">
        <AppRoutes />
      </div>
      <PwaUpdatePrompt />
    </div>
  );
}

export default App;
