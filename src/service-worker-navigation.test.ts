import { expect, it } from 'vitest';
import { documentCacheKey, navigationTarget } from './service-worker-navigation';
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
