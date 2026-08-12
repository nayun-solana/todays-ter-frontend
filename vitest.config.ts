import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * vite.config.ts를 상속하지 않는 별도 설정.
 * 앱 빌드 플러그인 중 tailwind·PWA는 테스트에 필요 없고, PWA 플러그인은 테스트마다
 * 서비스워커를 생성하려 든다. react 플러그인만 가져와 JSX를 변환한다.
 *
 * environment는 jsdom — 컴포넌트·훅 테스트가 라우트 가드와 화면 분기를 덮는다.
 * 순수 함수 테스트(api·lib·types)는 jsdom에서도 그대로 돈다.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // vite.config.ts·tsconfig.app.json의 paths와 같은 값이어야 한다.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // globals는 켜지 않는다 — 기존 테스트가 전부 `vitest`에서 명시적으로 import한다.
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
