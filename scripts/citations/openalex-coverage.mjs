/**
 * Which of the site's publications OpenAlex holds, and under whom.
 *
 * The citation watcher once reached OpenAlex through the ORCID alone, which
 * made the ORCID a single point of silent failure. OpenAlex reassigns
 * authorship as its disambiguation changes, and a work it detached from the
 * ORCID dropped out of the watcher entirely: its citations went unfollowed and
 * nothing said so, because nothing ever asked the question from the site's
 * side. So the watcher now also looks up every identifier the site carries
 * (each DOI, each recorded `openAlexId`) and this module reconciles the
 * answers against the data files:
 *
 *   - a publication OpenAlex holds but under neither author route is an
 *     attribution to correct in OpenAlex;
 *   - a publication matched on its title alone wants an `openAlexId`, since a
 *     title is the weakest key there is (edit it here and the match is gone);
 *   - a recorded `openAlexId` the lookup no longer returns has been retired,
 *     usually because OpenAlex merged its record into another;
 *   - a publication found by no route at all is simply not indexed.
 *
 * Pure: the network calls stay in `check-citations.mjs`.
 */
import { normDoi, normTitle } from './citation-grouping.mjs';

/**
 * Values OR-ed into one filter. OpenAlex caps how many one filter takes; 50
 * stays well inside the cap and keeps every request URL short.
 */
export const OR_BATCH = 50;

/** `W123…` from a bare id or an openalex.org URL, in any case — or null. */
export function normWorkId(raw) {
	const id = String(raw ?? '')
		.trim()
		.split('/')
		.pop()
		.toUpperCase();
	return /^W\d+$/.test(id) ? id : null;
}

/** Every DOI a record carries, however it is spelled. */
export function localDois(record) {
	const out = new Set();
	if (record.doi) out.add(normDoi(record.doi));
	if (record.url) {
		const d = normDoi(record.url);
		if (d.startsWith('10.')) out.add(d);
	}
	return out;
}

/**
 * DOIs that more than one publication carries: a volume's DOI repeated on
 * its chapters, an issue's on the pieces in it. Such a DOI names the
 * container, so it cannot tell its publications apart.
 */
export function sharedDois(publications) {
	const seen = new Set();
	const shared = new Set();
	for (const { record } of publications) {
		for (const doi of localDois(record)) {
			if (seen.has(doi)) shared.add(doi);
			seen.add(doi);
		}
	}
	return shared;
}

/** `attribute:a|b|…` filters, `size` values to a request. */
export function orFilters(attribute, values, size = OR_BATCH) {
	const filters = [];
	for (let i = 0; i < values.length; i += size) {
		filters.push(`${attribute}:${values.slice(i, i + size).join('|')}`);
	}
	return filters;
}

/**
 * The publication an OpenAlex work is a record of: a recorded `openAlexId`
 * first, then DOI, then title. Where several publications share the DOI, the
 * one whose title matches wins, and failing that the first, as before.
 */
export function matchPublication(work, publications) {
	const id = normWorkId(work.id);
	if (id) {
		const pinned = publications.find(({ record }) => normWorkId(record.openAlexId) === id);
		if (pinned) return pinned;
	}
	const title = normTitle(work.title);
	const doi = normDoi(work.doi);
	if (doi) {
		const byDoi = publications.filter(({ record }) => localDois(record).has(doi));
		if (byDoi.length) {
			return byDoi.find(({ record }) => title && normTitle(record.title) === title) ?? byDoi[0];
		}
	}
	if (!title) return null;
	return publications.find(({ record }) => normTitle(record.title) === title) ?? null;
}

const byCitations = (a, b) => (b.cited_by_count ?? 0) - (a.cited_by_count ?? 0);

/**
 * Reconcile every work found, by any route, with the data files.
 *
 * `attributed(work)` says whether an author route (the ORCID or the OpenAlex
 * author record) returned the work. `idsReturned` holds the ids the
 * `openAlexId` lookup returned, or is null when that lookup failed — in which
 * case only a malformed id can be called stale.
 */
export function assessCoverage({ publications, works, attributed, idsReturned }) {
	const matchOf = new Map(); // work → publication
	const worksOf = new Map(publications.map((p) => [p, []]));
	for (const work of works) {
		const publication = matchPublication(work, publications);
		if (!publication) continue;
		matchOf.set(work, publication);
		worksOf.get(publication).push(work);
	}

	const shared = sharedDois(publications);
	const unattributed = [];
	const toRecord = [];
	const stale = [];
	const unindexed = [];

	for (const publication of publications) {
		const found = worksOf.get(publication).sort(byCitations);
		const raw = publication.record.openAlexId;
		const recorded = raw !== undefined && raw !== '';
		const id = normWorkId(raw);

		if (recorded && (!id || (idsReturned && !idsReturned.has(id)))) {
			stale.push({ publication, id: String(raw), malformed: !id });
		} else if (found.length === 0) {
			unindexed.push(publication);
		}
		if (found.length === 0) continue;

		if (!found.some(attributed)) unattributed.push({ publication, works: found });

		const dois = [...localDois(publication.record)];
		if (!recorded && !dois.some((d) => !shared.has(d))) {
			toRecord.push({ publication, works: found, sharedDoi: dois.length > 0 });
		}
	}

	return { matchOf, unattributed, toRecord, stale, unindexed };
}
