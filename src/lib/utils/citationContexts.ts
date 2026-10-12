import type {
	CitationContextSet,
	CitationContextStatus,
	CitationPassage,
	CitingWork,
	Publication
} from '$lib/types';
import { typesetQuotes } from '$lib/utils/typesetQuotes';

/**
 * The join behind `/publications/citations`: each `citedBy` entry of a
 * publication with what its citation-context set records about it.
 *
 * The set answers the entries rather than copying them, so the citing work's
 * byline, title and link stay where the watcher and `wikidata:apply` keep
 * them. An entry the set does not answer was recorded after the run and has
 * not been read yet; a context whose entry is gone (a citation removed as
 * false) is an error, so a removal cannot leave its quotation on the page.
 */

export type CitationContextEntry = {
	key: string;
	authors: string[];
	year: number;
	title: string;
	source?: string;
	url?: string;
	/** ISO 639-1 code of the citing text; absent for an entry not yet read. */
	language?: string;
	status: CitationContextStatus;
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
	entryCount: number;
	passageCount: number;
};

/** The key a context answers an entry by: its QID, or its URL when it has none. */
export function citingKey(entry: CitingWork): string | null {
	return entry.wikidataId ?? entry.url ?? null;
}

const byYearThenAuthor = (a: CitationContextEntry, b: CitationContextEntry) =>
	b.year - a.year || (a.authors[0] ?? '').localeCompare(b.authors[0] ?? '');

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
			status: context?.status ?? 'unread',
			passages: context?.status === 'quoted' ? (context.passages ?? []) : []
		});
	}

	const orphans = [...contexts.keys()].filter((key) => !answered.has(key));
	if (orphans.length > 0) {
		throw new Error(
			`Citation contexts for ${set.id} answer works its citedBy no longer lists: ${orphans.join(', ')}`
		);
	}

	const pick = (status: CitationContextStatus) =>
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
		entryCount: entries.length,
		passageCount: quoted.reduce((sum, entry) => sum + entry.passages.length, 0)
	};
}

/** Every set with its publication, newest publication first. */
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
		.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
