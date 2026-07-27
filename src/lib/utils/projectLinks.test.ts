import { describe, expect, it } from 'vitest';
import { groupProjectLinks, projectLinkText } from './projectLinks';

describe('groupProjectLinks', () => {
	it('returns nothing when a project has no addresses', () => {
		expect(groupProjectLinks({})).toEqual([]);
	});

	it('treats an untyped link as a site', () => {
		const groups = groupProjectLinks({ links: [{ url: 'https://heshmat.zmo.de/' }] });
		expect(groups).toHaveLength(1);
		expect(groups[0]!.type).toBe('site');
		expect(groups[0]!.key).toBe('Site');
	});

	it('orders groups site, code, data regardless of declaration order', () => {
		const groups = groupProjectLinks({
			links: [
				{ url: 'https://example.org/data', type: 'data' },
				{ url: 'https://github.com/a/b', type: 'code' },
				{ url: 'https://example.org' }
			]
		});
		expect(groups.map((g) => g.type)).toEqual(['site', 'code', 'data']);
	});

	it('keeps several links of one kind in declaration order', () => {
		const groups = groupProjectLinks({
			links: [
				{ url: 'https://github.com/a/first', type: 'code' },
				{ url: 'https://github.com/a/second', type: 'code' }
			]
		});
		expect(groups[0]!.links.map((l) => l.url)).toEqual([
			'https://github.com/a/first',
			'https://github.com/a/second'
		]);
	});

	it('folds linkUrl in as the first site', () => {
		const groups = groupProjectLinks({
			linkUrl: 'https://example.org/live',
			links: [{ url: 'https://example.org/mirror' }]
		});
		expect(groups[0]!.links.map((l) => l.url)).toEqual([
			'https://example.org/live',
			'https://example.org/mirror'
		]);
	});

	it('drops kinds the project has no links for', () => {
		const groups = groupProjectLinks({ links: [{ url: 'https://github.com/a/b', type: 'code' }] });
		expect(groups.map((g) => g.type)).toEqual(['code']);
	});
});

describe('projectLinkText', () => {
	it('falls back to the bare address', () => {
		expect(projectLinkText({ url: 'https://islam.zmo.de/s/westafrica' })).toBe(
			'islam.zmo.de/s/westafrica'
		);
	});

	it('prefers an explicit label', () => {
		expect(
			projectLinkText({ url: 'https://github.com/fmadore/IwacSearch', label: 'IwacSearch' })
		).toBe('IwacSearch');
	});
});
