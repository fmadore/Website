import { describe, expect, it } from 'vitest';
import { buildVenueLedger, venueOf, type VenueSource } from './venueLedger';
import { allPublications } from '$lib/data/publications';

let seq = 0;
function pub(fields: Partial<VenueSource> & Pick<VenueSource, 'type'>): VenueSource {
	seq += 1;
	return { id: `p${seq}`, title: `Title ${seq}`, year: 2020, ...fields };
}

describe('venueOf', () => {
	it('counts articles, special issues and bulletin pieces under their journal', () => {
		for (const type of ['article', 'special-issue', 'bulletin-article']) {
			expect(venueOf(pub({ type, journal: 'Islamic Africa', publisher: 'Brill' }))).toEqual({
				group: 'journals',
				name: 'Islamic Africa'
			});
		}
	});

	it('counts reports under their publisher and working papers under their series', () => {
		expect(venueOf(pub({ type: 'report', publisher: 'ZMO' }))).toEqual({
			group: 'journals',
			name: 'ZMO'
		});
		expect(
			venueOf(pub({ type: 'working-paper', series: 'ZMO Working Papers', publisher: 'ZMO' }))
		).toEqual({ group: 'journals', name: 'ZMO Working Papers' });
		expect(venueOf(pub({ type: 'working-paper', publisher: 'ZMO' }))?.name).toBe('ZMO');
	});

	it('counts books, chapters and encyclopedia entries under the book publisher', () => {
		for (const type of ['book', 'chapter', 'encyclopedia']) {
			expect(venueOf(pub({ type, publisher: 'LIT Verlag', journal: 'Ignored' }))).toEqual({
				group: 'publishers',
				name: 'LIT Verlag'
			});
		}
	});

	it('has no venue for other types, or for a blank name', () => {
		expect(venueOf(pub({ type: 'dissertation', publisher: 'Université Laval' }))).toBeNull();
		expect(venueOf(pub({ type: 'article', journal: '  ' }))).toBeNull();
		expect(venueOf(pub({ type: 'book' }))).toBeNull();
	});

	it('trims the venue name, so a stray space never splits a venue in two', () => {
		expect(venueOf(pub({ type: 'article', journal: ' Africa ' }))?.name).toBe('Africa');
	});
});

describe('buildVenueLedger', () => {
	const ledger = buildVenueLedger([
		pub({ type: 'article', journal: 'Islamic Africa', year: 2021, title: 'B' }),
		pub({ type: 'article', journal: 'Islamic Africa', year: 2016, title: 'C' }),
		pub({ type: 'article', journal: 'Islamic Africa', year: 2021, title: 'A' }),
		pub({ type: 'article', journal: 'Émulations' }),
		pub({ type: 'article', journal: 'Émulations' }),
		pub({ type: 'article', journal: 'Africa' }),
		pub({ type: 'report', publisher: 'Bulletin FrancoPaix' }),
		pub({ type: 'chapter', publisher: 'Brill' }),
		pub({ type: 'blog-post' })
	]);

	it('keeps journals first and drops works without a venue', () => {
		expect(ledger.groups.map((g) => g.label)).toEqual(['Journals and series', 'Book publishers']);
		expect(ledger.workCount).toBe(8);
		expect(ledger.venueCount).toBe(5);
	});

	it('ranks multi-work venues by count and sets the single ones alphabetically', () => {
		const journals = ledger.groups[0]!;
		expect(journals.ranked.map((v) => [v.name, v.works.length])).toEqual([
			['Islamic Africa', 3],
			['Émulations', 2]
		]);
		expect(journals.singles.map((v) => v.name)).toEqual(['Africa', 'Bulletin FrancoPaix']);
		expect(journals.venueCount).toBe(4);
		expect(journals.workCount).toBe(7);
	});

	it('orders a venue’s works oldest first, then by title', () => {
		const works = ledger.groups[0]!.ranked[0]!.works;
		expect(works.map((w) => `${w.year} ${w.title}`)).toEqual(['2016 C', '2021 A', '2021 B']);
	});

	it('sizes the mark column to the busiest venue', () => {
		expect(ledger.maxWorks).toBe(3);
		expect(buildVenueLedger([]).maxWorks).toBe(1);
		expect(buildVenueLedger([]).groups).toEqual([]);
	});

	it('accounts for every publication with a venue in the live dataset', () => {
		const live = buildVenueLedger(allPublications);
		const withVenue = allPublications.filter((p) => venueOf(p) !== null).length;
		expect(live.workCount).toBe(withVenue);
		const listed = live.groups.flatMap((g) => [...g.ranked, ...g.singles]);
		expect(listed).toHaveLength(live.venueCount);
		expect(new Set(listed.flatMap((v) => v.works.map((w) => w.id))).size).toBe(withVenue);
	});
});
