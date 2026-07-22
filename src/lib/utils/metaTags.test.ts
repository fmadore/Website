import { describe, it, expect } from 'vitest';
import {
	buildHeadTags,
	buildCoins,
	createCoinsParams,
	createConditionalTag,
	createAuthorTags,
	getFullUrl,
	deduplicateAndFilterTags,
	type HeadTagEntry
} from './metaTags';

describe('buildHeadTags', () => {
	it('emits entries in declaration order', () => {
		const result = buildHeadTags([
			{ name: 'citation_title', content: 'A Title' },
			{ name: 'citation_genre', content: 'article' },
			{ name: 'DC.title', content: 'A Title' }
		]);
		expect(result).toEqual([
			{ name: 'citation_title', content: 'A Title' },
			{ name: 'citation_genre', content: 'article' },
			{ name: 'DC.title', content: 'A Title' }
		]);
	});

	it('flattens nested entry arrays in place, preserving order', () => {
		const result = buildHeadTags([
			{ name: 'citation_title', content: 'T' },
			[
				{ name: 'citation_author', content: 'Madore, Frédérick' },
				{ name: 'citation_author', content: 'Doe, Jane' }
			],
			{ name: 'citation_year', content: '2024' }
		]);
		expect(result.map((t) => `${t.name}=${t.content}`)).toEqual([
			'citation_title=T',
			'citation_author=Madore, Frédérick',
			'citation_author=Doe, Jane',
			'citation_year=2024'
		]);
	});

	it('drops entries with undefined or empty content', () => {
		const result = buildHeadTags([
			{ name: 'citation_title', content: 'T' },
			{ name: 'citation_doi', content: undefined },
			{ name: 'citation_isbn', content: '' },
			{ name: 'citation_year', content: '2024' }
		]);
		expect(result).toEqual([
			{ name: 'citation_title', content: 'T' },
			{ name: 'citation_year', content: '2024' }
		]);
	});

	it('drops entries gated off with when: false, keeps when: true and default', () => {
		const result = buildHeadTags([
			{ name: 'citation_journal_title', content: 'Journal', when: false },
			{ name: 'citation_volume', content: '12', when: true },
			{ name: 'citation_issue', content: '3' }
		]);
		expect(result).toEqual([
			{ name: 'citation_volume', content: '12' },
			{ name: 'citation_issue', content: '3' }
		]);
	});

	it('deduplicates identical name+content pairs, keeping the first occurrence', () => {
		const result = buildHeadTags([
			{ name: 'DC.creator', content: 'Madore, Frédérick' },
			{ name: 'citation_publisher', content: 'X' },
			{ name: 'DC.creator', content: 'Madore, Frédérick' },
			// Same name, different content — kept
			{ name: 'DC.creator', content: 'Doe, Jane' }
		]);
		expect(result).toEqual([
			{ name: 'DC.creator', content: 'Madore, Frédérick' },
			{ name: 'citation_publisher', content: 'X' },
			{ name: 'DC.creator', content: 'Doe, Jane' }
		]);
	});

	it('filters whitespace-only content', () => {
		const result = buildHeadTags([
			{ name: 'citation_title', content: '   ' },
			{ name: 'citation_year', content: '2024' }
		]);
		expect(result).toEqual([{ name: 'citation_year', content: '2024' }]);
	});

	it('accepts createAuthorTags output as a nested entry list', () => {
		const entries: Array<HeadTagEntry | HeadTagEntry[]> = [
			{ name: 'citation_title', content: 'T' },
			createAuthorTags(['Frédérick Madore', 'Jane Doe'], 'citation_author')
		];
		expect(buildHeadTags(entries)).toEqual([
			{ name: 'citation_title', content: 'T' },
			{ name: 'citation_author', content: 'Madore, Frédérick' },
			{ name: 'citation_author', content: 'Doe, Jane' }
		]);
	});
});

describe('buildCoins', () => {
	it('seeds the scaffold params with the default rfr_id in canonical order', () => {
		expect(buildCoins([])).toBe(
			'url_ver=Z39.88-2004&ctx_ver=Z39.88-2004&rfr_id=info%3Asid%2Ffrederickmadore.com'
		);
	});

	it('uses a custom rfr_id when given (publications historically differ)', () => {
		expect(buildCoins([], 'info:sid/personal-website')).toBe(
			'url_ver=Z39.88-2004&ctx_ver=Z39.88-2004&rfr_id=info%3Asid%2Fpersonal-website'
		);
	});

	it('serializes fields in insertion order and skips falsy values', () => {
		const coins = buildCoins([
			['rft_val_fmt', 'info:ofi/fmt:kev:mtx:dc'],
			['rft.type', 'presentation'],
			['rft.title', 'A Talk'],
			['rft.source', undefined],
			['rft.coverage', ''],
			['rft.date', '2024-05-01']
		]);
		expect(coins).toBe(
			'url_ver=Z39.88-2004&ctx_ver=Z39.88-2004&rfr_id=info%3Asid%2Ffrederickmadore.com' +
				'&rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Adc&rft.type=presentation&rft.title=A+Talk&rft.date=2024-05-01'
		);
	});

	it('overwrites repeated keys in place (set semantics: first position, last value)', () => {
		// The publications component pushes rft.au once per author; the
		// historical URLSearchParams.set behaviour keeps the first insertion
		// position with the last author's value. Preserved deliberately.
		const coins = buildCoins([
			['rft.au', 'Madore, Frédérick'],
			['rft.date', '2020'],
			['rft.au', 'Doe, Jane']
		]);
		expect(coins).toBe(
			'url_ver=Z39.88-2004&ctx_ver=Z39.88-2004&rfr_id=info%3Asid%2Ffrederickmadore.com' +
				'&rft.au=Doe%2C+Jane&rft.date=2020'
		);
	});

	it('produces the exact publication-shaped journal COinS string', () => {
		const coins = buildCoins(
			[
				['rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal'],
				['rft.genre', 'article'],
				['rft.jtitle', 'Islamic Africa'],
				['rft.title', 'Salafi Media'],
				['rft.aufirst', 'Frédérick'],
				['rft.aulast', 'Madore'],
				['rft.au', 'Madore, Frédérick'],
				['rft.au', 'Doe, Jane'],
				['rft.date', '2020-01-15'],
				['rft_id', 'info:doi/10.1000/x']
			],
			'info:sid/personal-website'
		);
		expect(coins).toBe(
			'url_ver=Z39.88-2004&ctx_ver=Z39.88-2004&rfr_id=info%3Asid%2Fpersonal-website' +
				'&rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&rft.genre=article&rft.jtitle=Islamic+Africa' +
				'&rft.title=Salafi+Media&rft.aufirst=Fr%C3%A9d%C3%A9rick&rft.aulast=Madore' +
				'&rft.au=Doe%2C+Jane&rft.date=2020-01-15&rft_id=info%3Adoi%2F10.1000%2Fx'
		);
	});
});

describe('existing helpers still behave (regression)', () => {
	it('createConditionalTag returns [] for missing content or false condition', () => {
		expect(createConditionalTag('x', undefined)).toEqual([]);
		expect(createConditionalTag('x', 'y', false)).toEqual([]);
		expect(createConditionalTag('x', 'y')).toEqual([{ name: 'x', content: 'y' }]);
	});

	it('createCoinsParams seeds scaffold in canonical order', () => {
		expect(createCoinsParams().toString()).toBe(
			'url_ver=Z39.88-2004&ctx_ver=Z39.88-2004&rfr_id=info%3Asid%2Ffrederickmadore.com'
		);
	});

	it('getFullUrl resolves relative paths and passes through absolute URLs', () => {
		expect(getFullUrl('https://example.org', '', 'files/a.pdf')).toBe(
			'https://example.org/files/a.pdf'
		);
		expect(getFullUrl('https://example.org', '', '/files/a.pdf')).toBe(
			'https://example.org/files/a.pdf'
		);
		expect(getFullUrl('https://example.org', '', 'https://doi.org/x')).toBe('https://doi.org/x');
		expect(getFullUrl('https://example.org', '', undefined)).toBeUndefined();
	});

	it('deduplicateAndFilterTags removes duplicates and empty content', () => {
		expect(
			deduplicateAndFilterTags([
				{ name: 'a', content: '1' },
				{ name: 'a', content: '1' },
				{ name: 'b', content: '' },
				{ name: 'c', content: ' ' },
				{ name: 'a', content: '2' }
			])
		).toEqual([
			{ name: 'a', content: '1' },
			{ name: 'a', content: '2' }
		]);
	});
});
