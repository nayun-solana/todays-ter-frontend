import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// 게스트 온보딩은 HTTP 쿠키(guest_id, SameSite=Lax) 기반이라 cross-site면 XHR로 쿠키가 안 실린다.
// dev에서 /api·/auth를 운영 서버로 프록시해 브라우저 관점 same-origin으로 만들어 쿠키를 흐르게 한다.
// (axios baseURL을 비워 상대경로로 두면 이 프록시를 탄다. 운영 빌드는 VITE_API_BASE_URL로 직접 호출.)
const API_TARGET = 'https://today-ter.kr';

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
        theme_color: '#863BFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: { '*': '' }, // Set-Cookie 도메인 제거 → localhost host-only 쿠키로 저장
      },
      '/auth': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: { '*': '' },
      },
    },
  },
});
