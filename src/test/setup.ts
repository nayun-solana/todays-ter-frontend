import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 테스트마다 렌더된 DOM을 걷어낸다. 남겨두면 다음 테스트의 쿼리가 이전 화면을 먼저 찾는다.
afterEach(cleanup);
