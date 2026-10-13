import type {
	CitationContextSet,
	CitationContextStatus,
	CitationPassage,
	CitingWork,
	Publication
} from '$lib/types';
import { typesetQuotes } from '$lib/utils/typesetQuotes';

/**
 * The joins behind `/publications/citations`.
 *
 * A context set answers the `citedBy` entries of one publication rather than
 * copying them, so the citing work's byline, title and link stay where the
 * watcher and `wikidata:apply` keep them. An entry no set answers has not been
 * read yet (`pending`); a context whose entry is gone (a citation removed as
 * false) is an error, so a removal cannot leave its quotation on the page.
 *
 * The page browses citing works, not publications: one work can cite several
 * of them, several times each, so `buildCitingWorkRows` merges the quoted
 * entries of every set into one row per work, its passages grouped by the
 * publication they cite.
 */

export type CitationEntryStatus = CitationContextStatus | 'pending';

export type CitationContextEntry = {
	key: string;
	authors: string[];
	year: number;
	title: string;
	source?: string;
	url?: string;
	/** ISO 639-1 code of the citing text; absent for an entry not yet read. */
	language?: string;
	status: CitationEntryStatus;
	passages: CitationPassage[];
};

export type CitationContextSection = {
	id: string;
	title: string;
	year: number;
	model: string;
	extracted: string;
	quoted: CitationContextEntry[];
	bibliographyOnly: CitationContextEntry[];
	unread: CitationContextEntry[];
	pending: CitationContextEntry[];
	entryCount: number;
	passageCount: number;
};

/** The kind of citing work, for the page's type facet. */
export type CitingWorkKind = 'article' | 'chapter' | 'book' | 'thesis' | 'report' | 'encyclopedia';

export const CITING_WORK_KIND_LABELS: Record<CitingWorkKind, string> = {
	article: 'Article',
	chapter: 'Chapter',
	book: 'Book',
	thesis: 'Thesis',
	report: 'Report',
	encyclopedia: 'Encyclopedia'
};

export const LANGUAGE_NAMES: Record<string, string> = {
	de: 'German',
	en: 'English',
	fr: 'French',
	id: 'Indonesian'
};

/** One citing work with every passage the pilot quoted from it. */
export type CitingWorkRow = {
	key: string;
	authors: string[];
	year: number;
	title: string;
	source?: string;
	url?: string;
	kind: CitingWorkKind;
	/** ISO 639-1 code, for the quotations' `lang`. */
	lang: string;
	/** The language's English name, the facet value. */
	language: string;
	groups: { publicationId: string; publicationTitle: string; passages: CitationPassage[] }[];
	passageCount: number;
};

/** The key a context answers an entry by: its QID, or its URL when it has none. */
export function citingKey(entry: CitingWork): string | null {
	return entry.wikidataId ?? entry.url ?? null;
}

/**
 * What kind of work a `citedBy` entry is, read off the shape its `source`
 * line is written in (the watcher writes them in one Chicago-like form):
 * `In …, edited by` is a chapter, a thesis names its degree, a volume and
 * issue make an article, `Place: Publisher, Year` alone is a book.
 */
export function citingWorkKind(entry: Pick<CitingWork, 'source' | 'url'>): CitingWorkKind {
	const source = entry.source ?? '';
	if (
		/^https?:\/\/(?:[\w-]+\.)*wikipedia\.org\//.test(entry.url ?? '') ||
		/^Wikipedia\b/.test(source)
	)
		return 'encyclopedia';
	if (/\b(?:dissertation|thesis|thèse|mémoire)\b/i.test(source)) return 'thesis';
	if (/^In /.test(source)) return 'chapter';
	if (/\b(?:Briefing|Institute|Report|Working Paper)\b/i.test(source)) return 'report';
	if (/^[^,:]+: [^,]+, \d{4}$/.test(source)) return 'book';
	return 'article';
}

const byYearThenAuthor = (
	a: { year: number; authors: string[] },
	b: { year: number; authors: string[] }
) => b.year - a.year || (a.authors[0] ?? '').localeCompare(b.authors[0] ?? '');

export function buildCitationContextSection(
	set: CitationContextSet,
	publication: Pick<Publication, 'id' | 'title' | 'year' | 'citedBy'>
): CitationContextSection {
	const contexts = new Map(set.contexts.map((context) => [context.citing, context]));
	const answered = new Set<string>();
	const entries: CitationContextEntry[] = [];

	for (const work of publication.citedBy ?? []) {
		const key = citingKey(work);
		const context = key ? contexts.get(key) : undefined;
		if (key && context) answered.add(key);
		entries.push({
			key: key ?? `${work.authors[0] ?? ''} ${work.year} ${work.title}`,
			authors: work.authors.map((name) => typesetQuotes(name)),
			year: work.year,
			title: typesetQuotes(work.title),
			source: work.source ? typesetQuotes(work.source) : undefined,
			url: work.url,
			language: context?.language,
			status: context?.status ?? 'pending',
			passages: context?.status === 'quoted' ? (context.passages ?? []) : []
		});
	}

	const orphans = [...contexts.keys()].filter((key) => !answered.has(key));
	if (orphans.length > 0) {
		throw new Error(
			`Citation contexts for ${set.id} answer works its citedBy no longer lists: ${orphans.join(', ')}`
		);
	}

	const pick = (status: CitationEntryStatus) =>
		entries.filter((entry) => entry.status === status).sort(byYearThenAuthor);
	const quoted = pick('quoted');
	return {
		id: publication.id,
		title: typesetQuotes(publication.title),
		year: publication.year,
		model: set.model,
		extracted: set.extracted,
		quoted,
		bibliographyOnly: pick('bibliography-only'),
		unread: pick('unread'),
		pending: pick('pending'),
		entryCount: entries.length,
		passageCount: quoted.reduce((sum, entry) => sum + entry.passages.length, 0)
	};
}

/** Every set with its publication, the most quoted first. */
export function buildCitationContextSections(
	sets: readonly CitationContextSet[],
	publications: readonly Pick<Publication, 'id' | 'title' | 'year' | 'citedBy'>[]
): CitationContextSection[] {
	const byId = new Map(publications.map((publication) => [publication.id, publication]));
	return sets
		.map((set) => {
			const publication = byId.get(set.id);
			if (!publication) throw new Error(`Citation contexts for unknown publication ${set.id}`);
			return buildCitationContextSection(set, publication);
		})
		.sort(
			(a, b) =>
				b.quoted.length - a.quoted.length || b.year - a.year || a.title.localeCompare(b.title)
		);
}

/** The quoted entries of every section, one row per citing work, newest first. */
export function buildCitingWorkRows(sections: readonly CitationContextSection[]): CitingWorkRow[] {
	const rows = new Map<string, CitingWorkRow>();
	for (const section of sections) {
		for (const entry of section.quoted) {
			const lang = entry.language ?? '';
			const row = rows.get(entry.key) ?? {
				key: entry.key,
				authors: entry.authors,
				year: entry.year,
				title: entry.title,
				source: entry.source,
				url: entry.url,
				kind: citingWorkKind(entry),
				lang,
				language: LANGUAGE_NAMES[lang] ?? lang,
				groups: [],
				passageCount: 0
			};
			row.groups.push({
				publicationId: section.id,
				publicationTitle: section.title,
				passages: entry.passages
			});
			row.passageCount += entry.passages.length;
			rows.set(entry.key, row);
		}
	}
	return [...rows.values()].sort(byYearThenAuthor);
}
