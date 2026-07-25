import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';

import { handlers } from '../src/mocks/handlers';

const server = setupServer(...handlers);
server.listen({ onUnhandledRequest: 'error' });

try {
  const urls = [
    '/places/explore-filters',
    '/places/editor-picks?limit=3',
    '/places?regionCode=ALL&elementType=WATER&page=0&size=20',
    '/places/2',
    '/mypage',
    '/mypage/social-connections',
  ];

  for (const url of urls) {
    const response = await fetch(`https://today-ter.kr${url}`);
    assert.equal(response.status, 200, url);
    assert.equal((await response.json()).isSuccess, true, url);
  }

  const missingPlace = await fetch('https://today-ter.kr/places/999');
  assert.equal(missingPlace.status, 404);
  assert.equal((await missingPlace.json()).code, 'PLACE_NOT_FOUND');
} finally {
  server.close();
}
