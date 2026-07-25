import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';

import { handlers } from '../src/mocks/handlers';

const server = setupServer(...handlers);
server.listen({ onUnhandledRequest: 'error' });

try {
  const places = await fetch(
    'https://today-ter.kr/places?regionCode=ALL&elementType=WATER&page=0&size=20',
  );
  const myPage = await fetch('https://today-ter.kr/mypage');

  assert.equal(places.status, 200);
  assert.equal(myPage.status, 200);
  assert.equal((await places.json()).isSuccess, true);
  assert.equal((await myPage.json()).isSuccess, true);
} finally {
  server.close();
}
