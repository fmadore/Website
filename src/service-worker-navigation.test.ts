import { expect, it } from 'vitest';
import { documentCacheKey, navigationTarget, navigationAssets } from './service-worker-navigation';
const origin = 'https://example.org';
const pages = new Set(['/', '/publications', '/publications/example']);
it('shares static HTML across search states while retaining the destination path', () => {
	expect(documentCacheKey(origin + '/publications?type=book#list')).toBe(origin + '/publications');
	expect(navigationTarget(origin + '/publications/example?q=test', origin, pages)).toBe(
		origin + '/publications/example'
	);
});
it.each([
	null,
	'/publications',
	'not a URL',
	'https://elsewhere.org/publications',
	origin + '/api/private',
	'https://user:pass@example.org/publications'
])('rejects a client cache request outside the static document allowlist: %s', (url) => {
	expect(navigationTarget(url, origin, pages)).toBeNull();
});

it('seeds only already-used assets from the current build, without duplicates', () => {
	const entry = '/app/immutable/entry/start.hash.js';
	const style = '/app/immutable/assets/layout.hash.css';
	const assets = new Set([entry, style]);
	expect(
		navigationAssets(
			[
				origin + entry,
				origin + entry + '?ignored=true',
				origin + style,
				origin + '/app/immutable/entry/old.js',
				origin + '/images/photo.jpg',
				'https://foreign.example' + entry,
				null
			],
			origin,
			assets
		)
	).toEqual([origin + entry, origin + style]);
	expect(navigationAssets(null, origin, assets)).toEqual([]);
});
