import { describe, expect, it } from 'vitest';
import { website } from '$lib/data/siteConfig';
import { buildBreadcrumbJsonLd, createSubsectionBreadcrumbs } from './breadcrumbJsonLd';

describe('createSubsectionBreadcrumbs', () => {
	it('links the section → sub-page trail under the base, keeping the route paths', () => {
		expect(
			createSubsectionBreadcrumbs(
				'/site',
				'Publications',
				'/publications',
				'Visualisations',
				'/publications/visualisations'
			)
		).toEqual([
			{ label: 'Publications', href: '/site/publications', path: '/publications' },
			{
				label: 'Visualisations',
				href: '/site/publications/visualisations',
				path: '/publications/visualisations'
			}
		]);
	});
});

describe('buildBreadcrumbJsonLd', () => {
	const itemsOf = (json: string | null) =>
		(JSON.parse(json!) as { itemListElement: { item: string }[] }).itemListElement.map(
			({ item }) => item
		);

	it('starts at Home and numbers the trail from one on the production origin', () => {
		const json = buildBreadcrumbJsonLd(
			createSubsectionBreadcrumbs('', 'Talks', '/conference-activity', 'Slides', '/slides')
		);
		expect(JSON.parse(json!)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: `${website.url}/` },
				{
					'@type': 'ListItem',
					position: 2,
					name: 'Talks',
					item: `${website.url}/conference-activity`
				},
				{ '@type': 'ListItem', position: 3, name: 'Slides', item: `${website.url}/slides` }
			]
		});
	});

	// Kit's `base` is page-relative under `paths.relative` — `.` at the root,
	// `..` one level down, `../..` two — and the visible trail's links carry it.
	// The structured data must come out the same whatever the page's depth.
	it.each(['.', '..', '../..'])('ignores a relative base (%s) in the visible links', (base) => {
		const items = createSubsectionBreadcrumbs(
			base,
			'Publications',
			'/publications',
			'Visualisations',
			'/publications/visualisations'
		);
		expect(items[0]!.href).toBe(`${base}/publications`);
		expect(itemsOf(buildBreadcrumbJsonLd(items))).toEqual([
			`${website.url}/`,
			`${website.url}/publications`,
			`${website.url}/publications/visualisations`
		]);
	});

	it('emits only absolute URLs on the site origin', () => {
		const json = buildBreadcrumbJsonLd([
			{ label: 'Activities', path: '/activities' },
			{ label: '2025', path: '/activities/year/2025' }
		]);
		for (const item of itemsOf(json)) {
			expect(item.startsWith(`${website.url}/`)).toBe(true);
			expect(item).not.toContain('..');
		}
	});

	it('is null for an empty trail', () => {
		expect(buildBreadcrumbJsonLd([])).toBeNull();
	});
});
