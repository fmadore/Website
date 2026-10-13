/**
 * Publication records → CSL-JSON for the `wikicite` skill, which reconciles,
 * enriches and creates the Wikidata items. CSL is the hand-off because the
 * skill reads it from any source (Zotero, Crossref, OpenAlex); this module is
 * the site's half of that contract and holds no Wikidata logic.
 *
 * Forthcoming records are never exported: they are not reconciled until the
 * record carries a real publication date. The reviews a record lists
 * (`reviewedBy`) are exported after it as CSL `review-book` items, keyed by
 * `reviewId`, so the skill can reconcile and create them like any work.
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
			// The site's own word on free full text, both ways: a record without the
			// flag is not open access (see Publication.openAccess), and the skill must
			// not mark it from a repository copy the site does not count.
			openAccess: p.openAccess === true
		}
	};
	return item;
}

const slug = (text) =>
	String(text)
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
/** The DOI in a doi.org link, or undefined. */
export const doiOf = (url) => /^https?:\/\/(?:dx\.)?doi\.org\/(10\..+)$/i.exec(url ?? '')?.[1];

/**
 * A review's ID: the reviewed record's, the reviewer's family name and the
 * year (`religious-activism-campuses--review-falen-2026`). Stable while the
 * review is listed, and what `wikidata:apply` finds the review by.
 */
export function reviewId(p, review) {
	return `${p.id}--review-${slug(review.author.trim().split(/\s+/).at(-1))}-${review.year}`;
}

/** A review listed on a record, as the CSL review of a book. */
export function reviewToCsl(p, review) {
	const doi = review.doi ?? doiOf(review.url);
	return {
		id: reviewId(p, review),
		type: 'review-book',
		title: review.title,
		author: [{ literal: review.author }],
		'reviewed-title': p.title,
		'reviewed-author': p.authors.map(name),
		issued: { 'date-parts': [[review.year]] },
		...(review.language ? { language: LANGUAGES[review.language] ?? review.language } : {}),
		'container-title': review.journal,
		...(review.volume ? { volume: review.volume } : {}),
		...(review.issue ? { issue: review.issue } : {}),
		...(review.pages ? { page: review.pages } : {}),
		...(doi ? { DOI: doi } : {}),
		...(review.url ? { URL: review.url } : {}),
		custom: {
			...(review.wikidataId ? { wikidata: review.wikidataId } : {}),
			...(p.wikidataId ? { reviewOf: p.wikidataId } : {})
		}
	};
}

/** How a citing work is told apart across records: its DOI, else its title. */
const citingKey = (citing) => {
	const doi = doiOf(citing.url);
	return doi ? `doi:${doi.toLowerCase()}` : `title:${slug(citing.title)}`;
};

/**
 * A citing work's ID: its first author's family name, the year and the first
 * five words of its title (`citing--idrissa-2017-the-politics-of-islam-in`).
 * What `wikidata:apply` finds the work's entries by.
 */
export function citingId(citing) {
	const family = slug(
		String(citing.authors?.[0] ?? 'anonymous')
			.trim()
			.split(/\s+/)
			.at(-1)
	);
	const words = slug(citing.title).split('-').slice(0, 5).join('-');
	return `citing--${family}-${citing.year}-${words}`;
}

/**
 * The works citing published records, one per work however many records it
 * cites (grouped by DOI, else by title), each with the entries that list it.
 */
export function citingWorks(records) {
	const groups = new Map();
	for (const record of records.filter((p) => !isForthcoming(p)))
		for (const citing of record.citedBy ?? []) {
			const key = citingKey(citing);
			const group = groups.get(key) ?? { id: citingId(citing), entries: [] };
			group.entries.push({ record, citing });
			groups.set(key, group);
		}
	return [...groups.values()];
}

/**
 * The CSL type of a citing work, read from the site's source line. A guess for
 * the skill to start from: a DOI's registry record replaces it, and a work
 * without one is checked against the work itself. Null for an encyclopedia
 * article on a wiki, which is not reconciled.
 */
export function citingType(citing) {
	const source = citing.source ?? '';
	if (
		/^https?:\/\/(?:[\w-]+\.)*wikipedia\.org\//.test(citing.url ?? '') ||
		/^Wikipedia\b/.test(source)
	)
		return null;
	if (/\b(?:PhD|Ph\.D\.|doctoral|doctorat)\b/i.test(source))
		return { type: 'thesis', genre: 'PhD dissertation' };
	if (/\bmaster/i.test(source)) return { type: 'thesis', genre: "Master's thesis" };
	if (/^In\s/.test(source)) return { type: 'chapter' };
	if (/\b(?:report|briefing|discussion paper|working paper|policy brief)\b/i.test(source))
		return { type: 'report' };
	// "Paris: Karthala, 2019": a place, a publisher, perhaps a year; never pages.
	if (/^(?:[^.]+\.\s)?[^:]+:\s*[^\d\s][^:]*?(?:,\s*\d{4})?$/.test(source)) return { type: 'book' };
	return { type: 'article-journal' };
}

/** A citing work as CSL: what the site knows of it, and the QIDs of the records it cites. */
export function citingToCsl(group) {
	const { citing } = group.entries[0];
	const kind = citingType(citing);
	if (!kind) return null;
	const recorded = [...new Set(group.entries.map((e) => e.citing.wikidataId).filter(Boolean))];
	if (recorded.length > 1)
		throw new Error(`Entries of ${group.id} carry different QIDs: ${recorded.join(', ')}`);
	const doi = doiOf(citing.url);
	return {
		id: group.id,
		...kind,
		title: citing.title,
		author: citing.authors.map((literal) => ({ literal })),
		issued: { 'date-parts': [[citing.year]] },
		...(doi ? { DOI: doi } : {}),
		...(citing.url ? { URL: citing.url } : {}),
		// The site's citation line, for whoever completes the record.
		...(citing.source ? { note: citing.source } : {}),
		custom: {
			...(recorded.length ? { wikidata: recorded[0] } : {}),
			cites: [...new Set(group.entries.map((e) => e.record.wikidataId).filter(Boolean))]
		}
	};
}

/** The works citing published records as CSL, and the IDs of those not reconciled (wiki articles). */
export function exportCitingCsl(records) {
	const items = [];
	const excluded = [];
	for (const group of citingWorks(records)) {
		const item = citingToCsl(group);
		if (item) items.push(item);
		else excluded.push(group.id);
	}
	const ids = new Set();
	for (const { id } of items) {
		if (ids.has(id)) throw new Error(`Two citing works share the ID ${id}`);
		ids.add(id);
	}
	return { items, excluded };
}

/** Eligible records as CSL, each followed by its reviews, and the forthcoming ones that were left out. */
export function exportCsl(records) {
	const eligible = records.filter((p) => !isForthcoming(p));
	const shared = containerDois(eligible);
	const items = eligible.flatMap((p) => [
		toCsl(p, shared),
		...(p.reviewedBy ?? []).map((review) => reviewToCsl(p, review))
	]);
	const ids = new Set();
	for (const { id } of items) {
		if (ids.has(id)) throw new Error(`Two exported items share the ID ${id}`);
		ids.add(id);
	}
	return { items, excluded: records.filter(isForthcoming).map((p) => p.id) };
}
