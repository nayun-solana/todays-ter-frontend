import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// 게스트 온보딩은 HTTP 쿠키(guest_id, SameSite=Lax) 기반이라 cross-site면 XHR로 쿠키가 안 실린다.
// dev에서 /api·/auth를 운영 서버로 프록시해 브라우저 관점 same-origin으로 만들어 쿠키를 흐르게 한다.
// axios는 baseURL 없이 상대경로로 부르므로 이 프록시를 탄다. 운영 빌드는 vercel.json의 rewrites가 같은 역할을 한다
// (경로 목록을 바꿀 땐 아래 API_PATHS와 vercel.json을 함께 수정할 것).
const API_TARGET = 'https://today-ter.kr';

/**
 * 운영 서버로 넘길 경로 목록.
 * BE가 `/api` 접두어 없이 도메인 루트에 경로를 열어둬서(`/home`, `/places`, ...) 하나씩 나열해야 한다.
 */
const API_PATHS = [
  '/api',
  '/auth',
  '/home',
  '/places',
  '/recommendations',
  '/fortune-reports',
  '/members',
  '/mypage',
  '/records',
  '/notifications',
];

const proxy = Object.fromEntries(
  API_PATHS.map((path) => [
    path,
    {
      target: API_TARGET,
      changeOrigin: true,
      secure: true,
      cookieDomainRewrite: { '*': '' }, // Set-Cookie 도메인 제거 → localhost host-only 쿠키로 저장
      /**
       * 화면 이동(문서 요청)은 프록시를 태우지 않고 Vite가 SPA로 처리하게 한다.
       * `/home`처럼 **앱 라우트와 API 접두어가 겹치는 경로**가 있어서,
       * 이 분기가 없으면 주소창으로 /home을 열었을 때 화면 대신 API JSON이 뜬다.
       * XHR/fetch는 Accept에 text/html이 없으므로 그대로 프록시를 탄다.
       */
      bypass(req: { headers: Record<string, string | string[] | undefined>; url?: string }) {
        const accept = req.headers.accept;
        if (typeof accept === 'string' && accept.includes('text/html')) return req.url;
      },
    },
  ]),
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '오늘의 터',
        short_name: '오늘의 터',
        description: '오행을 바탕으로 나에게 맞는 터를 찾아보세요.',
        lang: 'ko',
        theme_color: '#5a81fa',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: { navigateFallback: 'index.html' },
    }),
  ],
  // `@/`는 src 루트. 상대경로(`../../../`)는 파일을 옮길 때마다 깨지므로 새 코드는 alias를 쓴다.
  // tsconfig.app.json의 paths와 vitest.config.ts에 같은 값이 들어가야 한다.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { proxy },
});
