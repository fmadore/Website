import { describe, it, expect } from 'vitest';
import { markdownPathFor, markdownTwinPath } from './markdownTwin';

describe('markdownPathFor', () => {
	it('names the twin by replacing the implicit extension, and the root by index.md', () => {
		expect(markdownPathFor('/')).toBe('/index.md');
		expect(markdownPathFor('/publications')).toBe('/publications.md');
		expect(markdownPathFor('/publications/x/')).toBe('/publications/x.md');
	});
});

describe('markdownTwinPath', () => {
	it('gives every content route its twin', () => {
		expect(markdownTwinPath('/', '/')).toBe('/index.md');
		expect(markdownTwinPath('/publications/[id]', '/publications/a-book')).toBe(
			'/publications/a-book.md'
		);
		expect(markdownTwinPath('/communications/[id]', '/communications/t')).toBe(
			'/communications/t.md'
		);
		expect(markdownTwinPath('/cv', '/cv')).toBe('/cv.md');
		expect(markdownTwinPath('/teaching', '/teaching')).toBe('/teaching.md');
		expect(markdownTwinPath('/teaching/guest-lectures', '/teaching/guest-lectures')).toBe(
			'/teaching/guest-lectures.md'
		);
		expect(
			markdownTwinPath('/research/dh-ai-african-studies', '/research/dh-ai-african-studies')
		).toBe('/research/dh-ai-african-studies.md');
	});

	it('gives none to a page without one, even beside a record route', () => {
		expect(
			markdownTwinPath('/publications/visualisations', '/publications/visualisations')
		).toBeNull();
		expect(markdownTwinPath('/activities/year/[year]', '/activities/year/2025')).toBeNull();
		expect(
			markdownTwinPath('/conference-activity/slides', '/conference-activity/slides')
		).toBeNull();
		expect(markdownTwinPath('/cv/timeline', '/cv/timeline')).toBeNull();
		expect(markdownTwinPath('/style-guide', '/style-guide')).toBeNull();
		expect(markdownTwinPath(null, '/missing')).toBeNull();
	});
});
