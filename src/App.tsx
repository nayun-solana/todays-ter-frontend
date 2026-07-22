import AppRoutes from './app/AppRoutes';

function App() {
  return (
    // 데스크탑에서도 모바일 프레임(390px)이 가운데 보이도록 하는 앱 셸
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen w-full max-w-[390px] bg-white shadow-xl relative">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
