// src/App.tsx
import AppRoutes from './app/AppRoutes';
import './App.css';

function App() {
  return (
    <div className="min-h-screen ">
      <div className="mx-auto min-h-screen w-full max-w-[390px] bg-white shadow-xl">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
