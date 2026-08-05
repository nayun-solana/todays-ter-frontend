import { defineConfig } from 'vitest/config';

/**
 * vite.config.ts를 상속하지 않는 별도 설정.
 * 앱 빌드 플러그인(react·tailwind·PWA)은 테스트에 필요 없고, PWA 플러그인은 테스트마다
 * 서비스워커를 생성하려 든다. 지금 테스트 대상(인터셉터·세션 복원)은 DOM이 없어도 되므로
 * environment도 node로 둔다. 컴포넌트 테스트를 넣게 되면 그때 jsdom을 추가할 것.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
