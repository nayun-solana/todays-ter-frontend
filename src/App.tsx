import AppRoutes from './app/AppRoutes';

function App() {
  return (
    // 폭 캡 없이 항상 페이지 배경색이 전체 폭을 채운다 (모바일 프레임 제거)
    <div className="relative min-h-dvh w-full">
      <AppRoutes />
    </div>
  );
}

export default App;
