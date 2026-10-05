import { describe, expect, it } from 'vitest';
import type { LocationDatum } from '$lib/data/geo';
import {
	collaboratorPopupContent,
	locationCoordinates,
	locationItemHref
} from './locationMapContent';

const location: LocationDatum = {
	id: 'example-university',
	label: 'Example University',
	country: 'Canada',
	coordinates: { lat: 46.78, lng: -71.28 },
	count: 1,
	items: [],
	collaborators: [
		{
			id: 'a-collaborator',
			name: 'A. Collaborator',
			confidence: 'uncertain',
			note: 'The source gives no affiliation date.',
			items: [{ id: 'a-work', title: 'A shared work', href: '/publications/a-work' }],
			sources: [{ label: 'Publisher record', url: 'https://example.org/article' }]
		}
	]
};

describe('locationCoordinates', () => {
	it('uses institution coordinates without moving them to a country centre', () => {
		expect(locationCoordinates(location, true)).toEqual({ lat: 46.78, lng: -71.28 });
	});

	it('requires explicit coordinates for institutions while preserving country maps', () => {
		const noCoordinates = { ...location, coordinates: undefined };
		expect(locationCoordinates(noCoordinates, true)).toBeUndefined();
		expect(locationCoordinates(noCoordinates)).toBeUndefined();
		expect(locationCoordinates({ country: 'Canada', count: 1, items: [] })?.lat).toBe(45.4215);
	});

	it.each([
		{ lat: Number.NaN, lng: 0 },
		{ lat: 0, lng: Number.POSITIVE_INFINITY },
		{ lat: 91, lng: 0 },
		{ lat: 0, lng: -181 }
	])('omits invalid coordinates without substituting a country centre: %j', (coordinates) => {
		expect(locationCoordinates({ ...location, coordinates }, true)).toBeUndefined();
	});
});

describe('collaboratorPopupContent', () => {
	it('lists names, linked works, sources and an explicit uncertainty label', () => {
		const content = collaboratorPopupContent(location, '/site', '/publications');
		expect(content).toContain('Example University');
		expect(content).toContain('1 collaborator');
		expect(content).toContain('A. Collaborator');
		expect(content).toContain('Uncertain affiliation');
		expect(content).toContain('The source gives no affiliation date.');
		expect(content).toContain('href="/site/publications/a-work"');
		expect(content).toContain('Open Publisher record');
		expect(content).toContain(' (opens in new tab)');
	});

	it('qualifies institution coordinate uncertainty independently of the affiliation', () => {
		const content = collaboratorPopupContent(
			{ ...location, coordinateNote: 'Approximate campus location' },
			'',
			'/publications'
		);
		expect(content).toContain('Location note: Approximate campus location');
	});

	it('escapes registry text and rejects executable source and item URLs', () => {
		const content = collaboratorPopupContent(
			{
				...location,
				label: '<script>alert(1)</script>',
				collaborators: [
					{
						id: 'person',
						name: 'A & B',
						confidence: 'verified',
						items: [{ id: 'safe', title: '<img src=x>', href: 'javascript:alert(1)' }],
						sources: [{ label: 'Unsafe', url: 'javascript:alert(1)' }]
					}
				]
			},
			'',
			'/communications'
		);
		expect(content).not.toContain('<script>');
		expect(content).not.toContain('<img');
		expect(content).not.toContain('javascript:');
		expect(content).toContain('&lt;script&gt;');
		expect(content).toContain('A &amp; B');
		expect(content).toContain('href="/communications/safe"');
	});
});

describe('locationItemHref', () => {
	it.each(['//example.org', '/\\example.org', 'https://example.org'])(
		'rejects a nonlocal route: %s',
		(href) => {
			expect(locationItemHref({ id: 'safe', title: 'Work', href }, '/site', '/publications')).toBe(
				'/site/publications/safe'
			);
		}
	);
});
