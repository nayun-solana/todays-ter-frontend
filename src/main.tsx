import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient();

async function unregisterLegacyMockServiceWorker() {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return false;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const legacyRegistrations = registrations.filter((registration) =>
    [registration.active, registration.waiting, registration.installing].some((worker) =>
      worker?.scriptURL.includes('mockServiceWorker'),
    ),
  );

  const results = await Promise.all(legacyRegistrations.map((registration) => registration.unregister()));
  return results.some(Boolean);
}

/** dev 전용 MSW 목 시작 (BE 미배포 엔드포인트 선개발). prod 빌드엔 포함 안 됨. */
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  // 목에 없는 요청(에셋·실 API)은 그대로 통과.
  await worker.start({ onUnhandledRequest: 'bypass' });
}

async function bootstrap() {
  if (await unregisterLegacyMockServiceWorker()) {
    window.location.reload();
    return;
  }

  await enableMocking();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
