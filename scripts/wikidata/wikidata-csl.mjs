/**
 * Publication records → CSL-JSON for the `wikicite` skill, which reconciles,
 * enriches and creates the Wikidata items. CSL is the hand-off because the
 * skill reads it from any source (Zotero, Crossref, OpenAlex); this module is
 * the site's half of that contract and holds no Wikidata logic.
 *
 * Forthcoming records are never exported: they are not reconciled until the
 * record carries a real publication date.
 */
import { isForthcoming } from '../../src/lib/utils/date-formatter.ts';

const LANGUAGES = { English: 'en', French: 'fr', German: 'de' };

/** Site type → CSL type, plus the skill template where CSL alone is ambiguous. */
const TYPES = {
	article: { type: 'article-journal' },
	chapter: { type: 'chapter' },
	book: { type: 'book' },
	'special-issue': { type: 'periodical', template: 'special-issue' },
	report: { type: 'report' },
	encyclopedia: { type: 'entry-encyclopedia' },
	blogpost: { type: 'post-weblog' },
	'phd-dissertation': { type: 'thesis', genre: 'PhD dissertation' },
	'masters-thesis': { type: 'thesis', genre: "Master's thesis" },
	'conference-proceedings': { type: 'paper-conference' },
	'bulletin-article': { type: 'article', template: 'article' },
	'working-paper': { type: 'report', genre: 'Working paper', template: 'working-paper' }
};

const name = (contributor) => ({
	literal: typeof contributor === 'string' ? contributor : contributor.name
});
const splitNames = (value) =>
	String(value ?? '')
		.split(/\s*,\s*|\s+(?:and|et)\s+/)
		.filter(Boolean)
		.map((literal) => ({ literal }));

/** "ZMO-Studien 48" → title + number; a series without a trailing number stays whole. */
export function series(value) {
	if (!value) return {};
	const match = /^(.*?)[,\s]+(\d+)$/.exec(value.trim());
	return match
		? { 'collection-title': match[1], 'collection-number': match[2] }
		: { 'collection-title': value.trim() };
}

/**
 * A DOI on several records names their container (an edited volume, a
 * bulletin issue): only a record of the container's own type keeps it as
 * `DOI`; the others carry it as `custom.containerDoi`.
 */
export function containerDois(records) {
	const counts = new Map();
	for (const p of records)
		if (p.doi) counts.set(p.doi.toLowerCase(), (counts.get(p.doi.toLowerCase()) ?? 0) + 1);
	return new Set([...counts].filter(([, n]) => n > 1).map(([doi]) => doi));
}

/**
 * Periodicals whose DOIs name a whole issue, never an article in it (the ZMO
 * Bulletin registers one DataCite DOI per issue, "ZMO Bulletin No. 44"). An
 * article in one carries its DOI as `custom.containerDoi` even when it is the
 * only record citing that issue.
 */
export const ISSUE_DOI_PERIODICALS = new Set(['ZMO Bulletin']);

export function toCsl(p, shared = new Set()) {
	if (isForthcoming(p)) throw new Error(`Forthcoming publication is not exported: ${p.id}`);
	const kind = TYPES[p.type];
	if (!kind) throw new Error(`No CSL mapping for publication type ${p.type}`);
	const edited = p.isEditedVolume || p.isEditedWork || p.type === 'special-issue';
	const sharedDoi =
		p.doi && (shared.has(p.doi.toLowerCase()) || ISSUE_DOI_PERIODICALS.has(p.journal));
	const ownsSharedDoi = sharedDoi && ['book', 'special-issue'].includes(p.type);
	const language = p.language
		.split(',')
		.map((l) => LANGUAGES[l.trim()] ?? l.trim())
		.join(', ');
	const [year, month, day] = p.dateISO.split('-').map(Number);
	const item = {
		id: p.id,
		type: kind.type,
		...(kind.genre ? { genre: kind.genre } : {}),
		title: p.title,
		...(edited ? { editor: p.authors.map(name) } : { author: p.authors.map(name) }),
		...(p.type === 'chapter' && p.editors ? { editor: splitNames(p.editors) } : {}),
		issued: { 'date-parts': [[year, month, day].filter(Boolean)] },
		language,
		...(p.journal || p.book || p.encyclopediaTitle || p.proceedingsTitle
			? { 'container-title': p.journal ?? p.book ?? p.encyclopediaTitle ?? p.proceedingsTitle }
			: {}),
		...(p.volume ? { volume: p.volume } : {}),
		...(p.issue ? { issue: p.issue } : {}),
		...(p.pages ? { page: p.pages } : {}),
		...(p.pageCount && !p.pages ? { 'number-of-pages': p.pageCount } : {}),
		...(p.publisher ? { publisher: p.publisher } : {}),
		...(p.placeOfPublication ? { 'publisher-place': p.placeOfPublication } : {}),
		...(p.university ? { publisher: p.university } : {}),
		...(p.isbn ? { ISBN: p.isbn } : {}),
		...(p.issn ? { ISSN: p.issn } : {}),
		...(p.doi && (!sharedDoi || ownsSharedDoi) ? { DOI: p.doi } : {}),
		...(p.url ? { URL: p.url } : {}),
		...(p.reportNumber ? { number: p.reportNumber } : {}),
		...series(p.series),
		custom: {
			...(kind.template ? { template: kind.template } : {}),
			...(p.wikidataId ? { wikidata: p.wikidataId } : {}),
			...(p.openAlexId ? { openalex: p.openAlexId } : {}),
			...(sharedDoi && !ownsSharedDoi ? { containerDoi: p.doi } : {}),
			...(p.pdfUrl ? { fullTextUrl: p.pdfUrl } : {}),
			...(p.prefacedBy ? { foreword: p.prefacedBy } : {}),
			...(p.advisors?.length ? { advisors: p.advisors } : {}),
			...(p.tags?.length ? { keywords: p.tags } : {}),
			...(p.country?.length ? { places: p.country } : {}),
			...(p.openAccess ? { openAccess: true } : {})
		}
	};
	return item;
}

/** Eligible records as CSL, and the forthcoming ones that were left out. */
export function exportCsl(records) {
	const eligible = records.filter((p) => !isForthcoming(p));
	const shared = containerDois(eligible);
	return {
		items: eligible.map((p) => toCsl(p, shared)),
		excluded: records.filter(isForthcoming).map((p) => p.id)
	};
}
