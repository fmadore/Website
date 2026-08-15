/**
 * Discovery sources: finding citations the citation graph cannot see.
 *
 * OpenAlex answers "who cites this DOI", which is only ever as good as the
 * reference lists publishers deposit. Three classes of citation are invisible
 * to it and are exactly the classes this bibliography attracts:
 *
 *   - **Monographs.** Much of what a historian is cited by arrives inside a
 *     book — 13 of the 44 publications here are themselves books or chapters —
 *     and books deposit references rarely or not at all. Google Books searches
 *     the scanned text itself, so it sees the footnote that no index recorded.
 *   - **Francophone grey literature.** 21 of the 44 are French or German, in a
 *     field whose theses, working papers and conference papers are deposited
 *     in HAL and indexed nowhere else.
 *   - **Non-DOI work.** 15 of the 44 carry no DOI, so no DOI-keyed service can
 *     reach them as a citation *target* under any circumstances — and the
 *     citing side is worse, since a book chapter that cites them frequently
 *     has no DOI either. A full-text name search does not care.
 *
 * All three are *discovery*, not record: they search for the author's name in
 * running text, which finds mentions in bibliographies, acknowledgements and
 * "see also" lists alongside genuine citations, and cannot say which of his
 * works is being cited. That is why the report keeps them under their own
 * heading and does not emit paste-ready `CitingWork` literals for them the way
 * the OpenAlex pass does — a lead has to be opened and read before it becomes
 * a record.
 *
 * Everything here is pure so it can be tested against captured payload shapes
 * rather than against three live APIs that change under you.
 */
import { normDoi, normTitle } from './citation-grouping.mjs';
import { cleanTitle, flatten } from './citation-text.mjs';

/**
 * The spellings of a name to search for.
 *
 * "Frédérick Madore" and "Frederick Madore" are both in circulation — the
 * accent survives in French-language venues and is dropped by roughly every
 * anglophone one, and a phrase search matches bytes. Wikipedia's search folds
 * diacritics and will return the same articles for both, which the key-based
 * de-duplication absorbs; Google Books does not, which is the reason this
 * exists.
 */
export function nameVariants(name) {
	const bare = name.normalize('NFD').replace(/[̀-ͯ]/g, '');
	return bare === name ? [name] : [name, bare];
}

/** `2019`, `2019-05` and `2019-05-01` all mean the same year. */
export function parseYear(value) {
	const year = Number.parseInt(String(value ?? '').slice(0, 4), 10);
	return Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : undefined;
}

/** Matched against a hit's author list to recognise the author's own work. */
const matchesAuthor = (authors, variants) => {
	const wanted = variants.map(normTitle);
	return (authors ?? []).some((a) => {
		const norm = normTitle(a);
		// HAL and Google Books both file names in either order ("Madore,
		// Frédérick" / "Frédérick Madore"), so compare on the normalised token
		// set rather than on the string.
		return wanted.some((w) => {
			const parts = w.split(' ').filter(Boolean);
			return parts.length > 0 && parts.every((p) => norm.split(' ').includes(p));
		});
	});
};

// ---------------------------------------------------------------------------
// Normalisation — one shape from three very different payloads
// ---------------------------------------------------------------------------

/**
 * The common shape. `key` is the acknowledgement key: stable across runs so a
 * dismissed lead stays dismissed, and namespaced by source so two services
 * cannot collide on an id.
 */

/** Google Books `volumes` response → discovery hits. */
export function normaliseGoogleBooks(payload) {
	return (payload?.items ?? [])
		.map((item) => {
			const v = item?.volumeInfo ?? {};
			const title = cleanTitle(v.subtitle ? `${v.title}: ${v.subtitle}` : v.title);
			if (!title || !item?.id) return null;
			return {
				source: 'books',
				key: `books:${item.id}`,
				title,
				authors: (v.authors ?? []).filter(Boolean),
				year: parseYear(v.publishedDate),
				container: cleanTitle(v.publisher) || undefined,
				url: v.canonicalVolumeLink || v.infoLink || undefined,
				isbns: (v.industryIdentifiers ?? []).map((i) => i?.identifier).filter(Boolean),
				snippet: cleanTitle(item?.searchInfo?.textSnippet) || undefined
			};
		})
		.filter(Boolean);
}

/**
 * HAL `search` response → discovery hits.
 *
 * HAL is Solr underneath, so multi-valued fields come back as arrays even when
 * they hold one value — `title_s` on a monolingual deposit is `['…']`, and on a
 * bilingual one holds both languages. Take the first and treat the rest as the
 * same record rather than as separate hits.
 */
export function normaliseHal(payload) {
	const first = (v) => (Array.isArray(v) ? v[0] : v);
	return (payload?.response?.docs ?? [])
		.map((d) => {
			const title = cleanTitle(first(d?.title_s));
			const id = d?.halId_s ?? d?.docid;
			if (!title || !id) return null;
			const doi = normDoi(d?.doiId_s);
			return {
				source: 'hal',
				key: `hal:${id}`,
				title,
				authors: (d?.authFullName_s ?? []).filter(Boolean),
				year: parseYear(d?.producedDateY_i),
				container:
					cleanTitle(first(d?.journalTitle_s) ?? first(d?.bookTitle_s) ?? d?.docType_s) ||
					undefined,
				url: d?.uri_s || undefined,
				doi: doi.startsWith('10.') ? doi : undefined,
				docType: d?.docType_s || undefined
			};
		})
		.filter(Boolean);
}

/**
 * MediaWiki `list=search` response → discovery hits.
 *
 * Kept separate from the two bibliographic sources throughout, because a
 * Wikipedia article is a different kind of reach and belongs under its own
 * heading — but it resolves the same way: recorded against the work it cites,
 * it stops being reported.
 */
export function normaliseWikipedia(payload, lang) {
	return (payload?.query?.search ?? [])
		.map((r) => {
			const title = cleanTitle(r?.title);
			if (!title) return null;
			return {
				source: 'wikipedia',
				key: `wikipedia:${lang}:${title}`,
				lang,
				title,
				url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
				snippet: cleanTitle(r?.snippet) || undefined
			};
		})
		.filter(Boolean);
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * Is this hit the author's own work rather than someone citing it?
 *
 * A name search returns his own books before anything else, and Google Books
 * holds a record for each of the three monographs. Three independent tests,
 * because each source supplies a different subset: authorship (both), the
 * title of a known publication (both), and the ISBN (Google Books only, and
 * the only one of the three that is unambiguous).
 */
export function isOwnWork(hit, { variants, localTitles, localIsbns }) {
	if (matchesAuthor(hit.authors, variants)) return true;
	if (localTitles.has(normTitle(hit.title))) return true;
	const bareIsbn = (s) => String(s ?? '').replace(/[^0-9xX]/g, '');
	return (hit.isbns ?? []).some((i) => localIsbns.has(bareIsbn(i)));
}

/**
 * The bibliographic leads worth reporting.
 *
 * Resolution is the same as for the OpenAlex pass — record the citation and it
 * stops being reported — so these are matched against every `citedBy` entry in
 * the repository, not just against the ones on the publication they appear to
 * cite: a full-text hit does not say *which* work it cites, so the only safe
 * question is whether this citing work is recorded anywhere at all.
 *
 * De-duplication runs across sources as well as within them. A thesis
 * deposited in HAL and issued as a book is one lead, and reporting it twice
 * under two headings is how a to-do list stops being read.
 */
export function selectFreshWorks(hits, { knownDois, knownTitles, acknowledged, own }) {
	const seenKeys = new Set();
	const seenTitles = new Set();
	const fresh = [];

	for (const hit of hits) {
		if (seenKeys.has(hit.key)) continue;
		seenKeys.add(hit.key);
		if (acknowledged.has(hit.key)) continue;
		if (own(hit)) continue;
		if (hit.doi && knownDois.has(hit.doi)) continue;

		const title = normTitle(hit.title);
		if (!title || knownTitles.has(title) || seenTitles.has(title)) continue;
		seenTitles.add(title);

		fresh.push(hit);
	}

	// Newest first: a citation from this year is the one worth opening.
	return fresh.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/**
 * Well past the longest URL any of these three services produces, and far short
 * of anything that would bloat an issue body.
 */
const MAX_HREF_LENGTH = 2000;

/**
 * A discovery URL, validated and escaped for use as a Markdown link target —
 * or undefined when it does not look like one, in which case the caller falls
 * back to plain text.
 *
 * These URLs come from three third-party services and are rendered into a
 * GitHub issue, so scheme is checked rather than assumed: `https://` only,
 * which rules out the `javascript:` and `data:` targets a Markdown link would
 * otherwise honour.
 *
 * Parentheses are escaped rather than rejected. A bare `)` closes the Markdown
 * link early, but parens are ordinary in what these sources return —
 * disambiguated Wikipedia titles ("Tabaski (fête)") carry them by convention —
 * and rejecting them silently demoted correct links to plain text.
 *
 * Normalising through `flatten` before the test rather than testing the raw
 * string is what makes the pattern sufficient. `\s` excludes the whitespace
 * controls but not the rest of C0, so on its own the test would pass a URL
 * carrying a NUL or an ANSI escape straight into the report — and into the
 * terminal the script prints to. Ordering matters: normalise, then validate,
 * so a string only reaches the report if it still looks like a URL *after* the
 * dangerous characters have been taken out of it.
 */
export function markdownHref(raw) {
	// Flattening with a ceiling one above the limit means a URL within it is
	// never truncated, and one beyond it always lands over the limit — so the
	// length test below catches it. A truncated URL would still satisfy the
	// pattern, and a link to the wrong page is worse than no link.
	const s = flatten(raw, MAX_HREF_LENGTH + 1);
	if (s.length > MAX_HREF_LENGTH) return undefined;
	if (!/^https:\/\/[^\s"'<>\\]+$/i.test(s)) return undefined;
	return s.replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/**
 * A URL reduced to a form two spellings of the same address share.
 *
 * The report renders an article URL with its parentheses percent-encoded, so
 * "Union_for_the_Republic_%28Togo%29" is what gets copied out of the issue,
 * while the same article arrives from the API as
 * "Union_for_the_Republic_(Togo)". Compared raw those are two different
 * strings, and a citation recorded from the issue would never match the hit it
 * came from — leaving it reported every month, which is exactly the failure
 * this comparison exists to prevent.
 */
export function normUrl(raw) {
	let s = String(raw ?? '').trim();
	try {
		s = decodeURIComponent(s);
	} catch {
		// Malformed escapes: compare what we were given rather than throwing.
	}
	return s.replace(/\/+$/, '').toLowerCase();
}

/**
 * Wikipedia mentions worth reporting.
 *
 * A mention resolves the same way every other finding does — record it against
 * the work it cites and it stops being reported. That was not true when this
 * was written: the assumption then was that nothing in the repository could
 * ever represent a Wikipedia article, so acknowledgement was the only exit.
 * Recording one as a `CitingWork` turns out to be perfectly reasonable, and
 * once it is recorded the repository is the state here too. Acknowledgement is
 * now only for articles that name the author without citing him.
 *
 * Matched on URL rather than title: a mention's title is the article's name,
 * which two language editions can share, while the URL is unique per wiki.
 */
export function selectFreshMentions(hits, { acknowledged, knownUrls }) {
	const seen = new Set();
	return hits
		.filter((hit) => {
			if (seen.has(hit.key) || acknowledged.has(hit.key)) return false;
			seen.add(hit.key);
			return !knownUrls.has(normUrl(hit.url));
		})
		.sort((a, b) => a.lang.localeCompare(b.lang) || a.title.localeCompare(b.title));
}
