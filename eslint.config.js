import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      // tsconfig의 target(es2023)과 맞춘다 — 낮게 잡으면 최신 문법을 파서가 거부한다.
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    /*
     * 브라우저가 아니라 Node에서 도는 파일들.
     * 위 블록이 `globals.browser`만 주고 있어서 `process` 같은 Node 전역이 미정의였다.
     * typescript-eslint가 `no-undef`를 끄기 때문에 에러로 드러나지 않았을 뿐이다.
     */
    files: ['scripts/**/*.{ts,mjs}', '*.config.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
);
