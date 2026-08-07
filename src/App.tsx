import AppRoutes from './app/AppRoutes';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';

/**
 * 앱 셸 — 데스크탑에서도 모바일 프레임이 가운데 보이게 한다.
 *
 * 폭은 Figma 프레임 기준 375px로 통일한다(이전엔 셸 400px / 페이지 390·375px가 섞여
 * 화면마다 좌우 여백이 달랐다). 페이지에서 다시 max-w를 잡지 말고 이 셸 폭을 따를 것.
 *
 * 높이는 dvh — 모바일 주소창이 접히고 펼쳐질 때 100vh는 실제 보이는 높이보다 커서
 * 하단 탭바가 화면 밖으로 밀린다.
 */
export const APP_SHELL_WIDTH = 375;

function App() {
  return (
    <div className="min-h-dvh bg-gray-100">
      <div className="relative mx-auto min-h-dvh w-full max-w-[375px] bg-white shadow-xl">
        <AppRoutes />
        <PwaUpdatePrompt />
      </div>
    </div>
  );
}

export default App;
