import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';
import { queryClient } from './app/queryClient.ts';

async function unregisterLegacyMockServiceWorker() {
  if (!('serviceWorker' in navigator)) return false;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const legacyRegistrations = registrations.filter((registration) =>
    [registration.active, registration.waiting, registration.installing].some((worker) =>
      worker?.scriptURL.includes('mockServiceWorker'),
    ),
  );

  const results = await Promise.all(
    legacyRegistrations.map((registration) => registration.unregister()),
  );
  return results.some(Boolean);
}

async function bootstrap() {
  if (await unregisterLegacyMockServiceWorker()) {
    window.location.reload();
    return;
  }

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
