import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 게스트 온보딩은 HTTP 쿠키(guest_id, SameSite=Lax) 기반이라 cross-site면 XHR로 쿠키가 안 실린다.
// dev에서 /api·/auth를 운영 서버로 프록시해 브라우저 관점 same-origin으로 만들어 쿠키를 흐르게 한다.
// (axios baseURL을 비워 상대경로로 두면 이 프록시를 탄다. 운영 빌드는 VITE_API_BASE_URL로 직접 호출.)
const API_TARGET = 'https://today-ter.kr';

/**
 * 운영 서버로 넘길 경로 목록.
 * BE가 `/api` 접두어 없이 도메인 루트에 경로를 열어둬서(`/home`, `/places`, ...) 하나씩 나열해야 한다.
 * MSW(dev)는 서비스워커라 프록시보다 먼저 가로채므로, 목이 있는 경로는 계속 목이 응답한다.
 */
const API_PATHS = [
  '/api',
  '/auth',
  '/home',
  '/places',
  '/recommendations',
  '/fortune-reports',
  '/members',
  '/records',
];

const proxy = Object.fromEntries(
  API_PATHS.map((path) => [
    path,
    {
      target: API_TARGET,
      changeOrigin: true,
      secure: true,
      cookieDomainRewrite: { '*': '' }, // Set-Cookie 도메인 제거 → localhost host-only 쿠키로 저장
    },
  ]),
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
});
