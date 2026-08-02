/**
 * Keying, grouping and de-duplication of citing works.
 *
 * Split out of `check-citations.mjs` because this is the one part of the
 * watcher with non-obvious behaviour and no observable output of its own: it
 * decides which of the works OpenAlex reports as "citing" are genuinely
 * separate citations. Everything here is pure, so it can be tested against
 * fixtures rather than against a live API that changes under you.
 *
 * The problem it solves: OpenAlex indexes a book at several granularities at
 * once, and publishers file their metadata inconsistently. One citation
 * arrives as up to a dozen records — the volume, every chapter, the index, the
 * list of contributors — and a naive reader reports all of them.
 */

/**
 * Titles must survive a round trip through two databases, so normalise hard:
 * strip diacritics (French titles are half this corpus), drop punctuation, and
 * collapse whitespace. Comparing raw strings would miss "Côte d'Ivoire" vs
 * "Cote d Ivoire" and every curly-vs-straight apostrophe.
 */
export const normTitle = (s) =>
	(s ?? '')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();

export const normDoi = (s) =>
	(s ?? '')
		.toLowerCase()
		.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
		.trim();

/**
 * The DOI of the containing volume, for chapter-level DOIs — or null when the
 * DOI does not look like a chapter of anything.
 *
 * Monographs are indexed chapter by chapter, each chapter carrying a DOI
 * derived from the book's: 10.1017/9781108690577.004, …005, …006. Left alone,
 * one book citing one article is reported as nine separate citations.
 *
 * The stem is only trusted when what remains ends in an ISBN-like run of
 * digits. Stripping the trailing number blindly would also turn
 * 10.4000/books.ifra.2073 into 10.4000/books.ifra — an OpenEdition *publisher*
 * prefix, not a volume — and collapse unrelated books from the same press into
 * a single citation.
 */
export function doiStem(doi) {
	const stem = normDoi(doi).replace(/[.-]\d{1,4}$/, '');
	if (stem === normDoi(doi)) return null; // nothing was stripped: not a chapter
	return /\d{8,}$/.test(stem) ? stem : null;
}

/** OpenAlex work types that are a part of a book rather than a work in themselves. */
const BOOK_PARTS = new Set(['book-chapter', 'paratext']);

/**
 * The bucket a citing work belongs to: everything that is really one citation
 * shares a key.
 *
 * Preferring the *container title* over the DOI is what makes this work across
 * publishers. De Gruyter and Cambridge derive chapter DOIs from the volume's,
 * so `doiStem` alone can rejoin them; OpenEdition does not — the volume
 * `10.4000/books.ifra.1713` and its chapter `…2070` share no stem, and
 * stripping further would collapse every IFRA book ever published into one
 * bucket. But both records name the volume: the chapter carries it in
 * `primary_location.raw_source_name`, and the volume record *is* it. That name
 * is the only join that holds for both.
 *
 * `raw_source_name` is only a container title for book parts. On an article it
 * is the journal, so keying on it there would merge two unrelated papers that
 * happen to share a venue — hence the type check. `other` is included only
 * when the DOI already looks like a book part, because Cambridge files a
 * monograph's preface and appendices under that type.
 */
export function groupKey(work) {
	const container =
		work.type === 'book'
			? work.title
			: BOOK_PARTS.has(work.type) || (work.type === 'other' && doiStem(work.doi))
				? work.container
				: '';
	if (container) return `volume:${normTitle(container)}`;
	return doiStem(work.doi) ?? work.doi ?? `title:${normTitle(work.title)}`;
}

/** Overlap of two reference lists, 0 (disjoint) to 1 (identical). */
export function jaccard(a, b) {
	const left = new Set(a ?? []);
	const right = new Set(b ?? []);
	if (left.size === 0 || right.size === 0) return 0;
	let shared = 0;
	for (const id of left) if (right.has(id)) shared++;
	return shared / (left.size + right.size - shared);
}

/**
 * How alike two chapters' reference lists must be before they are read as one
 * list filed twice. Measured, not guessed: across the *Transnational Islam*
 * volume the smeared chapters sit at 0.93–1.00 of each other while the one
 * chapter that genuinely cites — Sounaye's, with its own 13 references —
 * sits at 0.12. Any threshold in that gap gives the same answer, so this one
 * is not load-bearing to a decimal place.
 */
const SMEAR_SIMILARITY = 0.9;

/**
 * Below this a shared list means nothing: two chapters that each reference
 * three works can coincide by chance, and OpenAlex records plenty of stubs.
 */
const SMEAR_MIN_REFS = 5;

/**
 * The chapters whose reference list is really the whole volume's.
 *
 * Some publishers — OpenEdition conspicuously — attach the book's complete
 * bibliography to every chapter record. The volume then appears to be cited by
 * each of its chapters at once, including the ones that have no bibliography
 * at all: in the case that prompted this, "Lists of maps and photos" was
 * reported as citing an article on preachers in Burkina Faso, carrying the
 * same 78 references as four unrelated chapters on Boko Haram.
 *
 * A real chapter has its own bibliography, so sharing a list near-identically
 * with a *sibling* is the signal. Two genuine chapters by different authors do
 * not independently arrive at the same 78 references.
 */
export function smearedChapters(chapters) {
	const eligible = chapters.filter((c) => (c.refs?.length ?? 0) >= SMEAR_MIN_REFS);
	const smeared = new Set();
	for (let i = 0; i < eligible.length; i++) {
		for (let j = i + 1; j < eligible.length; j++) {
			if (jaccard(eligible[i].refs, eligible[j].refs) >= SMEAR_SIMILARITY) {
				smeared.add(eligible[i]);
				smeared.add(eligible[j]);
			}
		}
	}
	return smeared;
}

const authorKey = (work) => work.authors.join('|').toLowerCase();

/** The volume record of a group, if OpenAlex indexed one. */
const shortestDoi = (works) => [...works].sort((a, b) => a.doi.length - b.doi.length)[0];

/**
 * Reduce one volume's worth of records to the citations it actually
 * represents, dropping any already present in the local `citedBy`.
 */
function selectFromGroup(group) {
	// A single-author monograph is one citation however many chapters cite
	// back; an edited volume whose chapters have distinct authors genuinely
	// contains several, so only collapse when the authors are uniform.
	if (group.length > 1 && new Set(group.map(authorKey)).size === 1) {
		// Already recorded at volume level? Then its chapters are not news
		// either — this is what stops a book being re-reported chapter by
		// chapter after it has been added to `citedBy`.
		if (group.some((c) => c.known)) return [];
		return [shortestDoi(group)];
	}

	const chapters = group.filter((c) => c.type === 'book-chapter');
	if (chapters.length === 0) return group.filter((c) => !c.known);

	const smeared = smearedChapters(chapters);
	const real = chapters.filter((c) => !smeared.has(c));

	// Every chapter carries the same list, so which one cites is not knowable
	// from this metadata — but that the volume cites is. Report it once rather
	// than lose the citation entirely.
	if (real.length === 0) {
		if (group.some((c) => c.known)) return [];
		const volume = group.find((c) => c.type === 'book') ?? shortestDoi(chapters);
		return [volume];
	}

	// An edited volume's record aggregates its chapters' references, so it is
	// not a citation in its own right once the chapters are visible: the
	// citing work is the chapter, and that is what belongs in `citedBy`.
	const rest = group.filter((c) => c.type !== 'book' && c.type !== 'book-chapter');
	return [...real, ...rest].filter((c) => !c.known);
}

/**
 * The citing works worth reporting: one entry per real citation, with anything
 * already recorded locally removed.
 */
export function selectFreshCitations(candidates) {
	const groups = new Map();
	for (const work of candidates) {
		const key = groupKey(work);
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(work);
	}

	const fresh = [];
	for (const group of groups.values()) fresh.push(...selectFromGroup(group));
	return fresh;
}
