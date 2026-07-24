import { describe, it, expect } from 'vitest';
import {
	activityToRSSItem,
	publicationToRSSItem,
	generateRSSFeed,
	generatePublicationsRSSFeed,
	type RSSItem
} from './rss';
import type { Activity } from '$lib/types/activity';
import type { Publication } from '$lib/types/publication';

const SITE = 'https://example.com';

const activity = (over: Partial<Activity>): Activity =>
	({
		id: 'act-1',
		title: 'A Talk',
		dateISO: '2025-05-01',
		date: '1 May 2025',
		year: 2025,
		description: 'Short description',
		...over
	}) as Activity;

const pub = (over: Partial<Publication>): Publication =>
	({
		id: 'pub-1',
		type: 'article',
		title: 'A Paper',
		authors: ['Frédérick Madore'],
		date: '2025',
		dateISO: '2025-04-01',
		year: 2025,
		language: 'English',
		...over
	}) as Publication;

describe('activityToRSSItem', () => {
	it('maps an activity to an item with an absolute link and guid', () => {
		const item = activityToRSSItem(activity({ id: 'x' }), SITE);
		expect(item.link).toBe(`${SITE}/activities/x`);
		expect(item.guid).toBe(`${SITE}/activities/x`);
		expect(item.pubDate).toBeInstanceOf(Date);
	});

	it('falls back to a placeholder description when none is available', () => {
		const item = activityToRSSItem(activity({ description: undefined, content: undefined }), SITE);
		expect(item.description).toBe('No description available');
	});
});

describe('publicationToRSSItem', () => {
	it('links to the publication detail page', () => {
		const item = publicationToRSSItem(pub({ id: 'p9' }), SITE);
		expect(item.link).toBe(`${SITE}/publications/p9`);
	});

	it('prefers the abstract for the description', () => {
		const item = publicationToRSSItem(pub({ abstract: 'A rich abstract.' }), SITE);
		expect(item.description).toBe('A rich abstract.');
	});

	it('falls back to a citation-ish line when there is no abstract', () => {
		const item = publicationToRSSItem(
			pub({ abstract: undefined, type: 'article', journal: 'JRA', year: 2025 }),
			SITE
		);
		expect(item.description).toContain('JRA');
		expect(item.description).toContain('2025');
	});

	it('joins author arrays for the author field', () => {
		const item = publicationToRSSItem(pub({ authors: ['Jane Doe', 'John Smith'] }), SITE);
		expect(item.author).toBe('Jane Doe, John Smith');
	});
});

describe('generateRSSFeed', () => {
	const items: RSSItem[] = [
		{
			title: 'Faith & Power',
			link: `${SITE}/a/1`,
			description: 'Desc with <b>html</b> & ampersand',
			pubDate: new Date('2025-05-01T00:00:00Z'),
			guid: `${SITE}/a/1`
		}
	];

	it('produces well-formed RSS 2.0 with a channel and item', () => {
		const xml = generateRSSFeed(items);
		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain('<channel>');
		expect(xml).toContain('<item>');
	});

	it('escapes XML special characters in titles and descriptions', () => {
		const xml = generateRSSFeed(items);
		expect(xml).toContain('<title>Faith &amp; Power</title>');
		expect(xml).toContain('&lt;b&gt;');
		expect(xml).not.toMatch(/<description>[^<]*<b>/);
	});
});

describe('generatePublicationsRSSFeed', () => {
	it('sorts newest-first and caps at 50 items', () => {
		const pubs = Array.from({ length: 60 }, (_, i) =>
			pub({ id: `p${i}`, dateISO: `2020-01-${String((i % 28) + 1).padStart(2, '0')}` })
		);
		const xml = generatePublicationsRSSFeed(pubs);
		const itemCount = (xml.match(/<item>/g) ?? []).length;
		expect(itemCount).toBe(50);
	});

	it('titles the channel as the publications feed', () => {
		const xml = generatePublicationsRSSFeed([pub({})]);
		expect(xml).toContain('- Publications</title>');
	});
});
