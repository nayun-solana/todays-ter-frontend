import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';

import { handlers } from '../src/mocks/handlers';

const server = setupServer(...handlers);
server.listen({ onUnhandledRequest: 'error' });

try {
  const urls = [
    '/places/explore-filters',
    '/places/editor-picks?limit=3',
    '/places/2',
    '/mypage',
    '/mypage/social-connections',
  ];

  for (const url of urls) {
    const response = await fetch(`https://today-ter.kr${url}`);
    assert.equal(response.status, 200, url);
    assert.equal((await response.json()).isSuccess, true, url);
  }

  for (const elementType of ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']) {
    const response = await fetch(
      `https://today-ter.kr/places?regionCode=ALL&elementType=${elementType}&page=0&size=20`,
    );
    const body = (await response.json()) as {
      result: {
        content: { element: { code: string }; thumbnailUrl: string | null }[];
      };
    };

    assert.equal(response.status, 200, elementType);
    assert.equal(body.result.content.length, 1, `${elementType} place count`);
    assert.equal(body.result.content[0]?.element.code, elementType);
    assert.ok(body.result.content[0]?.thumbnailUrl, `${elementType} thumbnail`);
  }

  const missingPlace = await fetch('https://today-ter.kr/places/999');
  assert.equal(missingPlace.status, 404);
  assert.equal((await missingPlace.json()).code, 'PLACE_NOT_FOUND');
} finally {
  server.close();
}
