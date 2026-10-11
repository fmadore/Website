import { cleanTitle } from '../lib/citation-text.mjs';

export const normalizeTitle = (value) =>
	cleanTitle(value)
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
const substantial = (value) => value.length >= 24 && value.split(' ').length >= 4;
const mainTitle = (value) =>
	normalizeTitle(cleanTitle(value).split(/[:：]|\s[—–-]\s|[.!?]\s+(?=\p{Lu})/u)[0]);

/** Bounded query expansion: retrieval must broaden before local scoring can help. */
export function titleQueries(title) {
	const full = cleanTitle(title).replace(/\s+/gu, ' ').trim();
	const normalized = normalizeTitle(full);
	const main = mainTitle(full);
	const queries = [full, normalized];
	if (main !== normalized && substantial(main)) queries.push(main);
	const words = normalized.split(' ');
	if (words.length > 10) queries.push(words.slice(0, 8).join(' '));
	return [...new Set(queries)].filter(Boolean);
}

function similarity(a, b) {
	const left = [...a],
		right = [...b];
	let previous = Array.from({ length: right.length + 1 }, (_, i) => i);
	for (let i = 1; i <= left.length; i++) {
		const current = [i];
		for (let j = 1; j <= right.length; j++)
			current[j] = Math.min(
				current[j - 1] + 1,
				previous[j] + 1,
				previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
			);
		previous = current;
	}
	return 1 - previous[right.length] / Math.max(left.length, right.length, 1);
}

/** Scores rank review candidates, never prove identity or authorize QID writes. */
export function titleSimilarity(left, right) {
	const a = normalizeTitle(left),
		b = normalizeTitle(right);
	if (!a || !b) return { score: 0, method: 'empty' };
	if (a === b) return { score: 1, method: 'normalized-exact' };
	const compactA = a.replace(/ /g, ''),
		compactB = b.replace(/ /g, '');
	if (compactA === compactB) return { score: 0.99, method: 'spacing' };
	const tokensA = new Set(a.split(' ')),
		tokensB = new Set(b.split(' '));
	const overlap = [...tokensA].filter((word) => tokensB.has(word)).length;
	let score = Math.max(
		similarity(compactA, compactB),
		(2 * overlap) / (tokensA.size + tokensB.size)
	);
	let method = 'fuzzy';
	const mainA = mainTitle(left),
		mainB = mainTitle(right);
	if ((substantial(a) && b.startsWith(a + ' ')) || (substantial(b) && a.startsWith(b + ' '))) {
		if (score < 0.92) {
			score = 0.92;
			method = 'subtitle-omitted';
		}
	} else if (mainA === mainB && substantial(mainA) && score < 0.88) {
		score = 0.88;
		method = 'shared-main-title';
	}
	// Dates/edition numbers can distinguish otherwise nearly identical works.
	const numbers = (value) => [...new Set(value.match(/\d+/g) ?? [])].sort().join(',');
	if (numbers(a) !== numbers(b) && numbers(a) && numbers(b)) {
		score = Math.min(score, 0.79);
		method = 'numeric-conflict';
	}
	if (!substantial(a) || !substantial(b)) score = Math.min(score, 0.79);
	return { score: Math.round(score * 1000) / 1000, method };
}

export function bestTitleMatch(title, candidate) {
	return [
		...Object.values(candidate.labels),
		...candidate.titles,
		...(candidate.aliases ?? [])
	].reduce(
		(best, value) => {
			const match = titleSimilarity(title, value);
			return match.score > best.score ? { ...match, title: value } : best;
		},
		{ score: 0, method: 'none', title: null }
	);
}

export async function searchTitleCandidates(title, request, api, cache = new Map()) {
	const matches = new Map();
	for (const language of ['en', 'fr', 'de']) {
		for (const query of titleQueries(title)) {
			const key = `${language}:${query}`;
			let data = cache.get(key);
			if (!data) {
				data = await request(api, {
					action: 'wbsearchentities',
					search: query,
					language,
					uselang: language,
					type: 'item',
					limit: '10',
					format: 'json'
				});
				if (!Array.isArray(data.search)) throw new Error('Malformed search response');
				cache.set(key, data);
			}
			for (const match of data.search)
				matches.set(match.id, [...(matches.get(match.id) ?? []), { language, query }]);
		}
	}
	return matches;
}
