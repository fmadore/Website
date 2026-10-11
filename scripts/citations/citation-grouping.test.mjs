import { describe, it, expect } from 'vitest';
import { doiStem, groupKey, jaccard, selectFreshCitations } from './citation-grouping.mjs';

/**
 * Fixtures mirror real OpenAlex records — the shapes that made this logic
 * necessary — rather than invented minimal ones. Reference lists are stand-ins
 * of the right *shape*: what matters is whether two chapters share one.
 */
const refs = (n, seed = 'r') => Array.from({ length: n }, (_, i) => `${seed}${i}`);

const chapter = (doi, title, authors, container, list) => ({
	authors,
	title,
	doi,
	type: 'book-chapter',
	container,
	refs: list,
	known: false
});

const volume = (doi, title, authors) => ({
	authors,
	title,
	doi,
	type: 'book',
	container: '',
	refs: refs(60, 'vol'),
	known: false
});

const article = (doi, title, authors, journal) => ({
	authors,
	title,
	doi,
	type: 'article',
	container: journal,
	refs: refs(20, doi),
	known: false
});

describe('doiStem', () => {
	it('rejoins a chapter with its volume', () => {
		expect(doiStem('10.1515/9783110733204-003')).toBe('10.1515/9783110733204');
		expect(doiStem('10.1017/9781108690577.004')).toBe('10.1017/9781108690577');
	});

	it('refuses to strip a press prefix down to a non-volume', () => {
		// 10.4000/books.ifra is IFRA the publisher, not a book.
		expect(doiStem('10.4000/books.ifra.2073')).toBeNull();
	});

	it('returns null when nothing was stripped', () => {
		expect(doiStem('10.7202/1045130ar')).toBeNull();
	});
});

describe('groupKey', () => {
	it('keys a volume and its chapters alike when DOIs do not nest', () => {
		const vol = volume('10.4000/books.ifra.1713', 'Transnational Islam', ['Élodie Apard']);
		const ch = chapter(
			'10.4000/books.ifra.2070',
			'The spread of jihadist insurrections',
			['Marc-Antoine Pérouse de Montclos'],
			'Transnational Islam',
			refs(78)
		);
		expect(groupKey(ch)).toBe(groupKey(vol));
	});

	it('keys book parts filed as "other" with their volume', () => {
		const vol = volume('10.1017/9781108690577', 'Salafism and Political Order in Africa', ['E']);
		const preface = {
			authors: ['E'],
			title: 'Preface',
			doi: '10.1017/9781108690577.001',
			type: 'other',
			container: 'Salafism and Political Order in Africa',
			refs: refs(449),
			known: false
		};
		expect(groupKey(preface)).toBe(groupKey(vol));
	});

	it('never groups two articles that merely share a journal', () => {
		const a = article('10.7202/1045130ar', 'Prêcheuses arabisantes', ['G'], 'Anthropologie');
		const b = article('10.7202/1093592ar', 'Le litatoli', ['N'], 'Anthropologie');
		expect(groupKey(a)).not.toBe(groupKey(b));
	});
});

describe('jaccard', () => {
	it('is 1 for identical lists and 0 when either is empty', () => {
		expect(jaccard(['a', 'b'], ['b', 'a'])).toBe(1);
		expect(jaccard([], ['a'])).toBe(0);
	});
});

describe('selectFreshCitations', () => {
	it('drops an edited volume once its chapters are visible', () => {
		// The volume record aggregates its chapters' references, so reporting
		// both says one citation twice.
		const fresh = selectFreshCitations([
			volume('10.1515/9783110733204', 'Islam and Muslim Life in West Africa', [
				'Sounaye, Abdoulaye',
				'Chappatte, André'
			]),
			chapter(
				'10.1515/9783110733204-003',
				'The Modernity of Islam in Burkina Faso',
				['Koudbi Kaboré'],
				'Islam and Muslim Life in West Africa',
				refs(11, 'kab')
			)
		]);
		expect(fresh.map((c) => c.doi)).toEqual(['10.1515/9783110733204-003']);
	});

	it('reports nothing when the chapter is already recorded', () => {
		const recorded = chapter(
			'10.1515/9783110733204-003',
			'The Modernity of Islam in Burkina Faso',
			['Koudbi Kaboré'],
			'Islam and Muslim Life in West Africa',
			refs(11, 'kab')
		);
		recorded.known = true;
		const fresh = selectFreshCitations([
			volume('10.1515/9783110733204', 'Islam and Muslim Life in West Africa', ['S', 'C']),
			recorded
		]);
		expect(fresh).toEqual([]);
	});

	it('drops chapters that share the volume bibliography, keeping the real one', () => {
		// The Transnational Islam case: four chapters filed with the same 78
		// references, one genuine chapter with its own 13.
		const smear = refs(78, 'vol');
		const real = chapter(
			'10.4000/books.ifra.2040',
			'Cross-border preaching',
			['Abdoulaye Sounaye'],
			'Transnational Islam',
			refs(13, 'own')
		);
		const fresh = selectFreshCitations([
			volume('10.4000/books.ifra.1713', 'Transnational Islam', ['Élodie Apard']),
			chapter('10.4000/books.ifra.1993', 'Lists of maps and photos', [], 'Transnational Islam', [
				...smear
			]),
			chapter(
				'10.4000/books.ifra.2070',
				'The spread of jihadist insurrections',
				['Marc-Antoine Pérouse de Montclos'],
				'Transnational Islam',
				[...smear]
			),
			chapter(
				'10.4000/books.ifra.2085',
				'The structure and organization of Boko Haram',
				['Adam Higazi'],
				'Transnational Islam',
				[...smear]
			),
			real
		]);
		expect(fresh.map((c) => c.doi)).toEqual(['10.4000/books.ifra.2040']);
	});

	it('tolerates a near-identical list, not just a byte-identical one', () => {
		// Observed at 0.926: OpenAlex resolves a few references differently
		// between records of the same smeared list. Both chapters are the same
		// filing, so they must reduce to one citation rather than two.
		const smear = refs(78, 'vol');
		const nearly = [...smear.slice(3), 'x1', 'x2', 'x3'];
		const fresh = selectFreshCitations([
			chapter('10.4000/books.ifra.2070', 'A', ['One'], 'Transnational Islam', smear),
			chapter('10.4000/books.ifra.2033', 'B', ['Two'], 'Transnational Islam', nearly)
		]);
		expect(fresh).toHaveLength(1);
	});

	it('falls back to the volume when every chapter is smeared', () => {
		// Which chapter cites is unknowable from this metadata, but that the
		// volume does is not — losing the citation would be worse.
		const smear = refs(78, 'vol');
		const fresh = selectFreshCitations([
			volume('10.4000/books.ifra.1713', 'Transnational Islam', ['Élodie Apard']),
			chapter('10.4000/books.ifra.2070', 'A', ['One'], 'Transnational Islam', [...smear]),
			chapter('10.4000/books.ifra.2085', 'B', ['Two'], 'Transnational Islam', [...smear])
		]);
		expect(fresh.map((c) => c.doi)).toEqual(['10.4000/books.ifra.1713']);
	});

	it('still collapses a monograph to a single citation', () => {
		const chapters = [4, 5, 6].map((n) =>
			chapter(
				`10.1017/9781108690577.00${n}`,
				`Chapter ${n}`,
				['Sebastian Elischer'],
				'Salafism and Political Order in Africa',
				refs(449, 'mono')
			)
		);
		const fresh = selectFreshCitations([
			volume('10.1017/9781108690577', 'Salafism and Political Order in Africa', [
				'Sebastian Elischer'
			]),
			...chapters
		]);
		expect(fresh.map((c) => c.doi)).toEqual(['10.1017/9781108690577']);
	});

	it('keeps a book cited with no chapters indexed', () => {
		const fresh = selectFreshCitations([volume('10.1017/9781108690577', 'Salafism', ['E'])]);
		expect(fresh).toHaveLength(1);
	});

	it('keeps two unrelated articles apart', () => {
		const fresh = selectFreshCitations([
			article('10.7202/1045130ar', 'Prêcheuses arabisantes', ['G'], 'Anthropologie'),
			article('10.7202/1093592ar', 'Le litatoli', ['N'], 'Anthropologie')
		]);
		expect(fresh).toHaveLength(2);
	});

	it('does not read two short reference lists as one smeared list', () => {
		const shared = refs(3, 'few');
		const fresh = selectFreshCitations([
			chapter('10.1515/9783110733204-003', 'A', ['One'], 'Islam and Muslim Life', shared),
			chapter('10.1515/9783110733204-004', 'B', ['Two'], 'Islam and Muslim Life', [...shared])
		]);
		expect(fresh).toHaveLength(2);
	});
});
