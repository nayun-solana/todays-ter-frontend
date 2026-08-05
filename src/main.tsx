import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';

/**
 * 쿼리 기본값.
 * 기본 설정(retry 3회 + 지수 백오프)이면 실패한 요청이 7초 넘게 로딩 상태로 남아,
 * 화면은 "불러오는 중"만 보여주고 사용자는 실패한 줄을 모른다.
 * 재시도는 1회로 줄여 실패를 빨리 드러내고, 포커스마다 다시 부르지 않게 한다.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 화면 전환마다 같은 데이터를 다시 부르지 않는다
      refetchOnWindowFocus: false,
      /**
       * 기본값('online')은 navigator.onLine이 false면 요청을 멈추고 fetchStatus를 'paused'로 둔다.
       * 이때 status는 'pending'에 머물러 **에러 UI가 영영 안 뜨고 스켈레톤만 남는다**(실측 확인).
       * 오프라인 판정이 틀리는 환경(프록시·인앱 브라우저 등)이 있어, 일단 보내고 실패를 드러낸다.
       */
      networkMode: 'always',
    },
  },
});

/** dev 전용 MSW 목 시작 (BE 미배포 엔드포인트 선개발). prod 빌드엔 포함 안 됨. */
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  // 목에 없는 요청(에셋·실 API)은 그대로 통과.
  await worker.start({ onUnhandledRequest: 'bypass' });
}

/**
 * 예전 배포본이 설치한 MSW 서비스워커를 해제한다.
 *
 * 2차 과제 제출 때 배포본이 목으로 구동돼서, 그때 방문한 사용자 브라우저에는
 * mockServiceWorker.js가 등록된 채로 남아 있다. 위 DEV 가드는 "앞으로 등록하지 않는다"일 뿐이라
 * 이미 설치된 워커는 계속 살아서 실 API 요청을 가로챌 수 있다(가짜 데이터가 진짜처럼 보인다).
 *
 * scriptURL로 걸러내는 게 핵심 — 조건 없이 unregister하면 PWA의 sw.js까지 날아간다.
 */
async function removeLegacyMockWorker() {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => registration.active?.scriptURL.includes('mockServiceWorker'))
        .map((registration) => registration.unregister()),
    );
  } catch {
    // 해제 실패가 앱 부팅을 막을 이유는 없다
  }
}

void removeLegacyMockWorker();

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
