import { describe, it, expect } from 'vitest';
import {
	nameVariants,
	parseYear,
	normaliseGoogleBooks,
	normaliseHal,
	normaliseWikipedia,
	isOwnWork,
	selectFreshWorks,
	selectFreshMentions,
	markdownHref
} from './citation-discovery.mjs';

/**
 * Fixtures mirror the payload shapes these three APIs actually return — Solr
 * arrays where a scalar would do, search snippets wrapped in markup, subtitles
 * filed apart from titles — rather than the tidy objects the code would prefer.
 * Those quirks are the reason the normalisers exist.
 */

describe('nameVariants', () => {
	it('offers the unaccented spelling too, since a phrase search matches bytes', () => {
		expect(nameVariants('Frédérick Madore')).toEqual(['Frédérick Madore', 'Frederick Madore']);
	});

	it('does not duplicate a name that has no diacritics', () => {
		expect(nameVariants('John Hunwick')).toEqual(['John Hunwick']);
	});
});

describe('parseYear', () => {
	it('reads the year out of every date precision Google Books files', () => {
		expect(parseYear('2019')).toBe(2019);
		expect(parseYear('2019-05')).toBe(2019);
		expect(parseYear('2019-05-01')).toBe(2019);
		expect(parseYear(2019)).toBe(2019);
	});

	it('rejects what is not a plausible publication year', () => {
		expect(parseYear('n.d.')).toBeUndefined();
		expect(parseYear('')).toBeUndefined();
		expect(parseYear(undefined)).toBeUndefined();
		expect(parseYear('0042')).toBeUndefined();
	});
});

describe('normaliseGoogleBooks', () => {
	const payload = {
		totalItems: 2,
		items: [
			{
				id: 'vol-1',
				volumeInfo: {
					title: 'Islam and Muslim Politics in Africa',
					subtitle: 'A Reader',
					authors: ['Benjamin F. Soares', 'René Otayek'],
					publishedDate: '2007-11',
					publisher: 'Palgrave Macmillan',
					industryIdentifiers: [{ type: 'ISBN_13', identifier: '9780230607101' }],
					canonicalVolumeLink: 'https://books.google.com/books/about/?id=vol-1'
				},
				searchInfo: { textSnippet: 'see <b>Frédérick Madore</b>, <i>La construction</i> …' }
			},
			// No id and no title: nothing stable to key on, nothing to show.
			{ volumeInfo: { title: 'Untracked' } },
			{ id: 'vol-3', volumeInfo: {} }
		]
	};

	it('joins subtitle to title and strips markup from the snippet', () => {
		const [hit] = normaliseGoogleBooks(payload);
		expect(hit.title).toBe('Islam and Muslim Politics in Africa: A Reader');
		expect(hit.snippet).toBe('see Frédérick Madore, La construction …');
		expect(hit.year).toBe(2007);
		expect(hit.container).toBe('Palgrave Macmillan');
		expect(hit.isbns).toEqual(['9780230607101']);
	});

	it('namespaces the acknowledgement key by source', () => {
		expect(normaliseGoogleBooks(payload)[0].key).toBe('books:vol-1');
	});

	it('drops records with no id or no title rather than keying on undefined', () => {
		expect(normaliseGoogleBooks(payload)).toHaveLength(1);
	});

	it('survives an empty or malformed payload', () => {
		expect(normaliseGoogleBooks({})).toEqual([]);
		expect(normaliseGoogleBooks(null)).toEqual([]);
	});
});

describe('normaliseHal', () => {
	const payload = {
		response: {
			numFound: 2,
			docs: [
				{
					docid: '4210987',
					halId_s: 'tel-04210987',
					// Solr multi-values even a single title, and a bilingual deposit
					// holds both languages in the same field.
					title_s: ['Les élites musulmanes au Burkina Faso', 'Muslim elites in Burkina Faso'],
					authFullName_s: ['Aïssatou Diallo'],
					producedDateY_i: 2023,
					doiId_s: 'https://doi.org/10.5555/ABC',
					uri_s: 'https://theses.hal.science/tel-04210987',
					docType_s: 'THESE'
				},
				{ docid: '999', title_s: [] }
			]
		}
	};

	it('takes the first of a multi-valued title and normalises the DOI', () => {
		const [hit] = normaliseHal(payload);
		expect(hit.title).toBe('Les élites musulmanes au Burkina Faso');
		expect(hit.doi).toBe('10.5555/abc');
		expect(hit.key).toBe('hal:tel-04210987');
		expect(hit.year).toBe(2023);
	});

	it('drops a deposit with no usable title', () => {
		expect(normaliseHal(payload)).toHaveLength(1);
	});

	it('omits a doi field entirely when HAL holds no DOI', () => {
		const [hit] = normaliseHal({
			response: { docs: [{ halId_s: 'hal-1', title_s: ['Sans DOI'] }] }
		});
		expect(hit.doi).toBeUndefined();
	});
});

describe('normaliseWikipedia', () => {
	const payload = {
		query: {
			search: [
				{
					title: 'Islam au Burkina Faso',
					snippet: '<span class="searchmatch">Madore</span>, Frédérick (2016)'
				}
			]
		}
	};

	it('builds a stable per-wiki key and a linkable URL', () => {
		const [hit] = normaliseWikipedia(payload, 'fr');
		expect(hit.key).toBe('wikipedia:fr:Islam au Burkina Faso');
		expect(hit.url).toBe('https://fr.wikipedia.org/wiki/Islam_au_Burkina_Faso');
		expect(hit.snippet).toBe('Madore, Frédérick (2016)');
		expect(hit.lang).toBe('fr');
	});

	it('keeps the same article on two wikis apart', () => {
		const fr = normaliseWikipedia(payload, 'fr')[0];
		const en = normaliseWikipedia(payload, 'en')[0];
		expect(fr.key).not.toBe(en.key);
	});
});

describe('isOwnWork', () => {
	const context = {
		variants: ['Frédérick Madore', 'Frederick Madore'],
		localTitles: new Set(['religious activism on campuses in togo and benin']),
		localIsbns: new Set(['9783111427904'])
	};

	it('recognises the author however the source orders his name', () => {
		expect(isOwnWork({ title: 'Something else', authors: ['Frédérick Madore'] }, context)).toBe(
			true
		);
		expect(isOwnWork({ title: 'Something else', authors: ['Madore, Frédérick'] }, context)).toBe(
			true
		);
		expect(isOwnWork({ title: 'Something else', authors: ['Frederick Madore'] }, context)).toBe(
			true
		);
	});

	it('does not claim an unrelated Madore', () => {
		expect(isOwnWork({ title: 'Something else', authors: ['Joseph Madore'] }, context)).toBe(false);
	});

	it('recognises his own book listed under an editor', () => {
		expect(
			isOwnWork({ title: 'Religious Activism on Campuses in Togo and Benin', authors: [] }, context)
		).toBe(true);
	});

	it('matches an ISBN however it is punctuated', () => {
		expect(
			isOwnWork({ title: 'Retitled edition', authors: [], isbns: ['978-3-11-142790-4'] }, context)
		).toBe(true);
	});

	it('leaves a genuine citing work alone', () => {
		expect(isOwnWork({ title: 'Muslim Politics in Benin', authors: ['A. Diallo'] }, context)).toBe(
			false
		);
	});
});

describe('selectFreshWorks', () => {
	const base = {
		knownDois: new Set(['10.1017/known']),
		knownTitles: new Set(['already recorded elsewhere']),
		acknowledged: new Set(['books:dismissed']),
		own: () => false
	};
	const hit = (over) => ({ source: 'books', key: 'k', title: 't', authors: [], ...over });

	it('drops leads already recorded against any publication', () => {
		const out = selectFreshWorks(
			[
				hit({ key: 'books:a', title: 'Already recorded elsewhere' }),
				hit({ key: 'hal:b', title: 'By DOI', doi: '10.1017/known' }),
				hit({ key: 'books:c', title: 'Genuinely new' })
			],
			base
		);
		expect(out.map((h) => h.title)).toEqual(['Genuinely new']);
	});

	it('drops acknowledged leads and the author’s own work', () => {
		const out = selectFreshWorks(
			[
				hit({ key: 'books:dismissed', title: 'A bibliography name-check' }),
				hit({ key: 'books:mine', title: 'His own monograph' }),
				hit({ key: 'books:new', title: 'Genuinely new' })
			],
			{ ...base, own: (h) => h.title === 'His own monograph' }
		);
		expect(out.map((h) => h.title)).toEqual(['Genuinely new']);
	});

	it('reports a thesis deposited in HAL and issued as a book only once', () => {
		const out = selectFreshWorks(
			[
				hit({ source: 'books', key: 'books:x', title: 'Rivalités et collaborations', year: 2020 }),
				hit({ source: 'hal', key: 'hal:y', title: 'Rivalités et collaborations', year: 2018 })
			],
			base
		);
		expect(out).toHaveLength(1);
		expect(out[0].source).toBe('books');
	});

	it('de-duplicates a key returned by two name-variant queries', () => {
		const out = selectFreshWorks(
			[
				hit({ key: 'books:same', title: 'One book' }),
				hit({ key: 'books:same', title: 'One book' })
			],
			base
		);
		expect(out).toHaveLength(1);
	});

	it('puts the newest lead first, undated last', () => {
		const out = selectFreshWorks(
			[
				hit({ key: 'a', title: 'Old', year: 2011 }),
				hit({ key: 'b', title: 'Undated' }),
				hit({ key: 'c', title: 'New', year: 2025 })
			],
			base
		);
		expect(out.map((h) => h.title)).toEqual(['New', 'Old', 'Undated']);
	});
});

describe('markdownHref', () => {
	it('escapes the parentheses that disambiguated Wikipedia titles carry', () => {
		expect(markdownHref('https://fr.wikipedia.org/wiki/Tabaski_(fête)')).toBe(
			'https://fr.wikipedia.org/wiki/Tabaski_%28fête%29'
		);
	});

	it('passes an ordinary URL through untouched', () => {
		expect(markdownHref('https://theses.hal.science/tel-04210987')).toBe(
			'https://theses.hal.science/tel-04210987'
		);
	});

	it('refuses anything that is not plain https', () => {
		expect(markdownHref('javascript:alert(1)')).toBeUndefined();
		expect(markdownHref('http://example.org/insecure')).toBeUndefined();
		expect(markdownHref('data:text/html,<script>')).toBeUndefined();
		expect(markdownHref('https://example.org/a b')).toBeUndefined();
		expect(markdownHref(undefined)).toBeUndefined();
	});

	// Testing the raw string would let these through: the pattern excludes \s,
	// which is not the same as excluding the control characters. Normalising
	// first means a control character is either stripped, or turns into the
	// space that makes the URL fail the pattern — never emitted either way.
	it('never emits a control character, wherever it sits in the URL', () => {
		const NUL = String.fromCharCode(0);
		const ESC = String.fromCharCode(27);

		// Trailing: normalised away, leaving a URL that is still correct.
		expect(markdownHref(`https://example.org/page${NUL}`)).toBe('https://example.org/page');

		// Embedded: becomes a space, which the pattern rejects outright.
		expect(markdownHref(`https://example.org/${ESC}[31m/page`)).toBeUndefined();

		for (const raw of [`https://a.org/${NUL}b`, `https://a.org/b${ESC}`, `https://a.org/${ESC}`]) {
			const out = markdownHref(raw);
			if (out !== undefined) expect(out).not.toMatch(/\p{Cc}/u);
		}
	});

	it('refuses an over-long URL rather than emitting a truncated one', () => {
		// Truncating would still satisfy the pattern, and a link to the wrong
		// page is worse than no link at all.
		expect(markdownHref(`https://example.org/${'x'.repeat(4000)}`)).toBeUndefined();
		expect(markdownHref(`https://example.org/${'x'.repeat(100)}`)).toBeDefined();
	});
});

describe('selectFreshMentions', () => {
	const mention = (lang, title) => ({
		source: 'wikipedia',
		key: `wikipedia:${lang}:${title}`,
		lang,
		title
	});

	it('drops acknowledged articles and de-duplicates repeated hits', () => {
		const out = selectFreshMentions(
			[
				mention('fr', 'Islam au Burkina Faso'),
				mention('fr', 'Islam au Burkina Faso'),
				mention('fr', 'Seen already'),
				mention('en', 'Islam in Togo')
			],
			new Set(['wikipedia:fr:Seen already'])
		);
		expect(out.map((h) => h.key)).toEqual([
			'wikipedia:en:Islam in Togo',
			'wikipedia:fr:Islam au Burkina Faso'
		]);
	});

	it('keeps the same article title on two wikis, which are two mentions', () => {
		const out = selectFreshMentions(
			[mention('fr', 'Tabaski'), mention('en', 'Tabaski')],
			new Set()
		);
		expect(out).toHaveLength(2);
	});
});
