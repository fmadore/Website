import { describe, expect, it } from 'vitest';
import { navItems } from '#lib/data/navigation.ts';
import { isNavItemCurrent, normalizeNavPath } from '#lib/components/menu/navMatch.ts';

const section = (name: string) => {
	const item = navItems.find((entry) => entry.name === name);
	if (!item) throw new Error(`no nav entry ${name}`);
	return item;
};

describe('normalizeNavPath', () => {
	it('drops a trailing slash but keeps the root', () => {
		expect(normalizeNavPath('/publications/')).toBe('/publications');
		expect(normalizeNavPath('/')).toBe('/');
	});
});

describe('isNavItemCurrent', () => {
	it('matches the path and what is nested beneath it, not a sibling prefix', () => {
		const item = { path: '/publications' };
		expect(isNavItemCurrent(item, '/publications')).toBe(true);
		expect(isNavItemCurrent(item, '/publications/')).toBe(true);
		expect(isNavItemCurrent(item, '/publications/some-id')).toBe(true);
		expect(isNavItemCurrent(item, '/publicationsx')).toBe(false);
	});

	it('matches the root only at the root', () => {
		expect(isNavItemCurrent({ path: '/' }, '/')).toBe(true);
		expect(isNavItemCurrent({ path: '/' }, '/cv')).toBe(false);
	});

	it('honours extra match prefixes', () => {
		const item = { path: '/conference-activity', match: ['/communications'] };
		expect(isNavItemCurrent(item, '/communications/some-talk')).toBe(true);
		expect(isNavItemCurrent(item, '/communicationsx')).toBe(false);
	});

	it('never lights an external link', () => {
		expect(isNavItemCurrent({ path: 'https://example.org/' }, '/')).toBe(false);
	});
});

describe('navItems', () => {
	it('lights Talks & Events on a talk record', () => {
		expect(isNavItemCurrent(section('Talks & Events'), '/communications/some-talk')).toBe(true);
	});

	it('lights each section on its own records', () => {
		expect(isNavItemCurrent(section('Publications'), '/publications/some-id')).toBe(true);
		expect(isNavItemCurrent(section('Activities'), '/activities/some-id')).toBe(true);
		expect(isNavItemCurrent(section('DH & Software'), '/digital-humanities/some-id')).toBe(true);
		expect(isNavItemCurrent(section('Research'), '/research/dh-ai-african-studies')).toBe(true);
	});

	it('lights exactly one section on any record path', () => {
		for (const path of [
			'/communications/x',
			'/publications/x',
			'/activities/x',
			'/digital-humanities/x',
			'/research/x',
			'/teaching/guest-lectures'
		]) {
			expect(navItems.filter((item) => isNavItemCurrent(item, path))).toHaveLength(1);
		}
	});
});
