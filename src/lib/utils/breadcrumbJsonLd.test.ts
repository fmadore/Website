import { describe, expect, it } from 'vitest';
import { website } from '$lib/data/siteConfig';
import { buildBreadcrumbJsonLd, createSubsectionBreadcrumbs } from './breadcrumbJsonLd';

describe('createSubsectionBreadcrumbs', () => {
	it('builds the section → sub-page trail under the base path', () => {
		expect(
			createSubsectionBreadcrumbs(
				'/site',
				'Publications',
				'/publications',
				'Visualisations',
				'/publications/visualisations'
			)
		).toEqual([
			{ label: 'Publications', href: '/site/publications' },
			{ label: 'Visualisations', href: '/site/publications/visualisations' }
		]);
	});
});

describe('buildBreadcrumbJsonLd', () => {
	it('numbers the trail from one on the production origin', () => {
		const json = buildBreadcrumbJsonLd(
			createSubsectionBreadcrumbs('', 'Talks', '/conference-activity', 'Slides', '/slides')
		);
		expect(JSON.parse(json!)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Talks',
					item: `${website.url}/conference-activity`
				},
				{ '@type': 'ListItem', position: 2, name: 'Slides', item: `${website.url}/slides` }
			]
		});
	});

	it('is null for an empty trail', () => {
		expect(buildBreadcrumbJsonLd([])).toBeNull();
	});
});
