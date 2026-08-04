import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'dist/pwa-192x192.png',
  'dist/pwa-512x512.png',
];

for (const file of requiredFiles) {
  await access(file);
}

const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
assert.equal(manifest.name, '오늘의 터');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.lang, 'ko');
assert.equal(manifest.theme_color, '#5a81fa');
assert.deepEqual(
  manifest.icons.map(({ src }) => src),
  ['/pwa-192x192.png', '/pwa-512x512.png'],
);

const indexHtml = await readFile('dist/index.html', 'utf8');
assert.match(indexHtml, /<meta name="theme-color" content="#5a81fa"/);

const serviceWorker = await readFile('dist/sw.js', 'utf8');
assert.match(serviceWorker, /precacheAndRoute/);
assert.doesNotMatch(serviceWorker, /\/places|\/mypage/);
assert.doesNotMatch(serviceWorker, /mockServiceWorker/);
