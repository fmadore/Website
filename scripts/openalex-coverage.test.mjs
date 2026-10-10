import { describe, it, expect } from 'vitest';
import {
	assessCoverage,
	localDois,
	matchPublication,
	normWorkId,
	orFilters,
	sharedDois
} from './openalex-coverage.mjs';

/** A data file as `collectRecords` returns it. */
const pub = (id, record) => ({
	file: `src/lib/data/publications/${id}.ts`,
	record: { id, ...record }
});

/** An OpenAlex work in the shape the API returns: URL ids, DOI URLs. */
const work = (id, { doi, title, cited = 0 } = {}) => ({
	id: `https://openalex.org/${id}`,
	doi: doi ? `https://doi.org/${doi}` : null,
	title,
	cited_by_count: cited
});

describe('normWorkId', () => {
	it('takes a bare id or an openalex.org URL, in any case', () => {
		expect(normWorkId('W2789989347')).toBe('W2789989347');
		expect(normWorkId('https://openalex.org/W2789989347')).toBe('W2789989347');
		expect(normWorkId(' w2789989347 ')).toBe('W2789989347');
	});

	it('refuses anything that is not a work id', () => {
		expect(normWorkId('A5000010243')).toBeNull();
		expect(normWorkId('10.4000/etudesafricaines.21880')).toBeNull();
		expect(normWorkId('')).toBeNull();
		expect(normWorkId(undefined)).toBeNull();
	});
});

describe('orFilters', () => {
	it('ORs values into filters of at most `size`', () => {
		expect(orFilters('ids.openalex', ['W1', 'W2', 'W3'], 2)).toEqual([
			'ids.openalex:W1|W2',
			'ids.openalex:W3'
		]);
	});

	it('makes no request for no values', () => {
		expect(orFilters('doi', [])).toEqual([]);
	});
});

describe('localDois and sharedDois', () => {
	it('reads a DOI from `doi` and from a doi.org `url`', () => {
		expect([...localDois({ doi: '10.1/A', url: 'https://doi.org/10.2/b' })]).toEqual([
			'10.1/a',
			'10.2/b'
		]);
		expect(localDois({ url: 'https://example.org/paper' }).size).toBe(0);
	});

	it("flags a DOI more than one publication carries, as a volume's on its chapters", () => {
		const shared = sharedDois([
			pub('book', { doi: '10.58144/20241107-000' }),
			pub('chapter', { doi: '10.58144/20241107-000' }),
			pub('article', { doi: '10.1017/x' })
		]);
		expect([...shared]).toEqual(['10.58144/20241107-000']);
	});
});

describe('matchPublication', () => {
	const book = pub('book', { title: 'Religiosity on University Campuses', doi: '10.9/vol' });
	const chapter = pub('chapter', { title: 'Islam on Campus', doi: '10.9/vol' });
	const thesis = pub('thesis', { title: 'Islam, politique et sphère publique', openAlexId: 'W7' });
	const publications = [chapter, book, thesis];

	it('matches a recorded id before anything else', () => {
		expect(matchPublication(work('W7', { title: 'A different title' }), publications)).toBe(thesis);
	});

	it('breaks a shared DOI by title, so the volume record lands on the book', () => {
		const volume = work('W1', { doi: '10.9/vol', title: 'Religiosity on University Campuses' });
		expect(matchPublication(volume, publications)).toBe(book);
	});

	it('falls back to title when there is no DOI', () => {
		const record = work('W8', { title: 'Islam, politique et sphère publique' });
		expect(matchPublication(record, publications)).toBe(thesis);
	});

	it('matches nothing it cannot key', () => {
		expect(
			matchPublication(work('W9', { title: 'Someone else entirely' }), publications)
		).toBeNull();
	});
});

describe('assessCoverage', () => {
	const article = pub('article', { title: 'Salafism', doi: '10.1/salafism' });
	const moved = pub('moved', { title: 'Detached', doi: '10.1/detached' });
	const thesis = pub('thesis', { title: 'Thesis' });
	const book = pub('book', { title: 'Volume', doi: '10.9/vol' });
	const chapter = pub('chapter', { title: 'Chapter', doi: '10.9/vol' });
	const pinned = pub('pinned', { title: 'Pinned', openAlexId: 'W40' });
	const retired = pub('retired', { title: 'Retired', openAlexId: 'W50' });
	const typo = pub('typo', { title: 'Typo', openAlexId: 'A5000010243' });
	const blog = pub('blog', { title: 'Blog post' });
	const publications = [article, moved, thesis, book, chapter, pinned, retired, typo, blog];

	const works = [
		work('W10', { doi: '10.1/salafism', title: 'Salafism', cited: 9 }),
		work('W20', { doi: '10.1/detached', title: 'Detached', cited: 3 }),
		work('W30', { title: 'Thesis', cited: 1 }),
		work('W31', { title: 'Thesis', cited: 4 }),
		work('W32', { doi: '10.9/vol', title: 'Volume' }),
		work('W40', { title: 'Pinned under another title' })
	];
	const underAuthor = new Set(['W10', 'W30', 'W31', 'W32', 'W40']);

	const result = assessCoverage({
		publications,
		works,
		attributed: (w) => underAuthor.has(normWorkId(w.id)),
		idsReturned: new Set(['W40'])
	});

	it('reports a publication OpenAlex holds under neither author route', () => {
		expect(result.unattributed.map((u) => u.publication)).toEqual([moved]);
	});

	it('asks for an id where the DOI cannot identify the work, most-cited record first', () => {
		expect(result.toRecord.map((r) => r.publication)).toEqual([thesis, book]);
		expect(result.toRecord[0].works.map((w) => normWorkId(w.id))).toEqual(['W31', 'W30']);
		expect(result.toRecord[1].sharedDoi).toBe(true);
	});

	it('leaves alone a publication with a DOI of its own, or an id already recorded', () => {
		const asked = result.toRecord.map((r) => r.publication);
		expect(asked).not.toContain(article);
		expect(asked).not.toContain(pinned);
	});

	it('calls a recorded id stale when the lookup did not return it, or it is not a work id', () => {
		expect(result.stale.map(({ publication, malformed }) => [publication, malformed])).toEqual([
			[retired, false],
			[typo, true]
		]);
	});

	it('lists what no route found, apart from what is already reported as stale', () => {
		expect(result.unindexed).toEqual([chapter, blog]);
	});

	it('keeps every match for the citation pass', () => {
		expect(result.matchOf.get(works[1])).toBe(moved);
		expect(result.matchOf.get(works[5])).toBe(pinned);
	});

	it('judges no well-formed id stale when the id lookup failed', () => {
		const blind = assessCoverage({
			publications,
			works,
			attributed: () => true,
			idsReturned: null
		});
		expect(blind.stale.map((s) => s.publication)).toEqual([typo]);
	});
});
