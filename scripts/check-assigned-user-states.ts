import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const readSource = (path: string) => readFile(new URL(path, root), 'utf8');

const [myPage, notificationSettings, permissions, placeDetail, searchPage, routes] = await Promise.all([
  readSource('src/pages/my/MyPage.tsx'),
  readSource('src/pages/my/NotificationSettingsPage.tsx'),
  readSource('src/pages/my/PermissionsPage.tsx'),
  readSource('src/pages/place/PlaceDetailPage.tsx'),
  readSource('src/pages/search/SearchPage.tsx'),
  readSource('src/app/AppRoutes.tsx'),
]);

assert.match(myPage, /path: '\/my\/policies'/);
assert.match(myPage, /disabled=\{!profile\}/);
assert.doesNotMatch(myPage, /reportId \?\? 1/);

assert.match(notificationSettings, /isNightMarketingEnabled/);
assert.doesNotMatch(notificationSettings, /savedPlaceEnabled|serviceEnabled|FREQUENCIES|TIME_OPTIONS/);
assert.match(permissions, /key: 'camera'/);

assert.match(placeDetail, /placeQuery\.isPending/);
assert.match(placeDetail, /placeQuery\.isError/);
assert.doesNotMatch(placeDetail, /place\?\.placeName \?\? PLACE\.name/);

assert.match(searchPage, /placesQuery\.isPending/);
assert.match(searchPage, /placesQuery\.isError/);
assert.doesNotMatch(searchPage, /fallbackPlaces|EDITOR_PICKS/);

assert.match(routes, /my\/policies/);
