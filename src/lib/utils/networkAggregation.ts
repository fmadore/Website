/**
 * Pure network builders shared by the visualisations pages
 * (publications/visualisations and conference-activity/visualisations).
 *
 * Every builder returns the same `NetworkData` shape consumed by
 * `NetworkGraph`: weighted nodes plus weighted edges, each tagged with
 * a `kind` that drives styling (colour, dash pattern, symbol) and legend copy
 * in the component. Keeping the graph *structure* here — including the
 * explicit centre→node edges of the egocentric networks — leaves the
 * component free of aggregation logic and makes the algorithms unit-testable
 * alongside the other builders in `vizAggregation.ts`.
 */
import type { Publication } from '#lib/types/publication.ts';
import type { Communication } from '#lib/types/communication.ts';
import { getContributorNames, isPersonContributor } from '#lib/utils/contributor.ts';

/** Node roles: colour is keyed on the role, size on the weight. */
export type NetworkNodeKind = 'center' | 'collaborator' | 'contributor' | 'entity';

/**
 * Edge families:
 * - `direct`: centre ↔ node (egocentric networks only)
 * - `peer`: two non-centre people who co-signed the same item
 * - `contributor`: linked through an edited volume / special issue
 * - `cooccurrence`: two entities (tags, institutions) sharing an item
 */
export type NetworkEdgeKind = 'direct' | 'peer' | 'contributor' | 'cooccurrence';

export interface NetworkNode {
	/** Display name — author, tag, or institution. Doubles as the graph id. */
	id: string;
	/** Number of unique items (publications/communications) behind the node. */
	weight: number;
	/** Item titles listed in the tooltip. */
	items: string[];
	kind: NetworkNodeKind;
}

export interface NetworkEdge {
	source: string;
	target: string;
	/** Number of unique items shared by the two endpoints. */
	weight: number;
	/**
	 * Tie strength when it differs from the count: set only by networks built
	 * with `shareLargeItems`, where an item with k keys gives each of its pairs
	 * 1/(k−1) rather than 1 (Newman's collaboration weighting). A 24-institution
	 * workshop then draws its 276 pairs as hairlines that barely pull in the
	 * layout, instead of a clique that dominates the plate. `weight` stays the
	 * plain count, which is what the tooltip and the table report.
	 */
	strength?: number;
	items: string[];
	kind: NetworkEdgeKind;
}

export interface NetworkData {
	/** Sorted weight-descending; the centre node (when present) comes first. */
	nodes: NetworkNode[];
	edges: NetworkEdge[];
}

/** The subset of a `NetworkData` a chart actually draws. */
export interface SelectedGraph {
	nodes: NetworkNode[];
	edges: NetworkEdge[];
	/** Largest weight among the non-centre nodes; the radius scale's domain. */
	maxWeight: number;
}

/**
 * Narrow a network to the top-N heaviest nodes and the edges between them.
 *
 * Lives here rather than in the chart so the drawn graph, the legend and the
 * screen-reader list all read from one source — and so it stays free of the
 * d3-force import in `networkLayout.ts`, letting the non-visual parts of the
 * component prerender.
 *
 * Ties break on the id, which keeps the selection (and therefore the layout
 * seeded from it) stable across builds.
 *
 * `direct` edges are never hidden by `visibleEdgeKinds`: they are the spokes
 * that define an egocentric network, and dropping them would leave the centre
 * node floating unconnected.
 */
export function selectGraph(
	nodes: NetworkNode[],
	edges: NetworkEdge[],
	options: { centerId?: string; maxNodes: number; visibleEdgeKinds?: NetworkEdgeKind[] }
): SelectedGraph {
	const { centerId, maxNodes, visibleEdgeKinds } = options;

	const centerNode = centerId ? nodes.find((n) => n.id === centerId) : undefined;
	const others = nodes
		.filter((n) => n.id !== centerId)
		.sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))
		.slice(0, Math.max(0, maxNodes));

	const kept = centerNode ? [centerNode, ...others] : others;
	const keptIds = new Set(kept.map((n) => n.id));
	const kindSet = visibleEdgeKinds ? new Set(visibleEdgeKinds) : undefined;

	const keptEdges = edges.filter(
		(e) =>
			keptIds.has(e.source) &&
			keptIds.has(e.target) &&
			(kindSet === undefined || e.kind === 'direct' || kindSet.has(e.kind))
	);

	return {
		nodes: kept,
		edges: keptEdges,
		maxWeight: others.reduce((m, n) => Math.max(m, n.weight), 1)
	};
}

/**
 * Shorten a label to at most `maxChars`, at a boundary a reader can trust.
 *
 * A comma-separated qualifier goes first ("University of Ibadan, Nigeria" →
 * "University of Ibadan…"), then whole words; a word is cut only when the
 * first one alone is too long. Cutting mid-word is how "Nigeria" came to read
 * "Niger…" on the institution network: a different country.
 */
export function truncateLabel(full: string, maxChars: number): string {
	if (full.length <= maxChars) return full;
	const room = Math.max(1, maxChars - 1);
	const trim = (text: string) => text.replace(/[\s,;:–-]+$/u, '');
	// Longest comma-prefix that fits.
	for (
		let comma = full.lastIndexOf(',', room);
		comma > 0;
		comma = full.lastIndexOf(',', comma - 1)
	) {
		const head = trim(full.slice(0, comma));
		if (head.length > 0 && head.length <= room) return `${head}…`;
	}
	// Otherwise the longest whole-word prefix.
	const space = full.lastIndexOf(' ', room);
	if (space > 0) {
		const head = trim(full.slice(0, space));
		if (head.length > 0) return `${head}…`;
	}
	return `${full.slice(0, room)}…`;
}

/**
 * Split a "Jane Doe, John Smith and Alice Roe" name list into individual
 * names. Splits on commas, the word "and", and ampersands — with word
 * boundaries, so names *containing* "and" ("Alexander", "Randall") survive
 * intact (the previous inline regex split on the bare substring "and",
 * cutting such names mid-word).
 * Arrays pass through. Results are trimmed, de-duplicated, empties dropped.
 */
export function splitNameList(value: string | string[] | null | undefined): string[] {
	if (value == null) return [];
	const parts = Array.isArray(value) ? value : value.split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s*&\s*/);
	const seen = new Set<string>();
	for (const part of parts) {
		const name = part?.trim();
		if (name) seen.add(name);
	}
	return Array.from(seen);
}

/** Order-independent key for an undirected pair. */
function pairKey(a: string, b: string): string {
	return a < b ? `${a}|${b}` : `${b}|${a}`;
}

interface PairAccumulator {
	source: string;
	target: string;
	items: Set<string>;
	kind: NetworkEdgeKind;
	/** Σ of the per-item shares, when the builder weights by item size. */
	strength?: number;
}

/** Record one shared item on the undirected a–b edge (O(1) via Map). */
function addPair(
	pairs: Map<string, PairAccumulator>,
	a: string,
	b: string,
	title: string,
	kind: NetworkEdgeKind,
	share?: number
): void {
	if (a === b) return;
	const key = pairKey(a, b);
	let pair = pairs.get(key);
	if (!pair) {
		pair = { source: a, target: b, items: new Set(), kind };
		pairs.set(key, pair);
	}
	if (share !== undefined && !pair.items.has(title)) pair.strength = (pair.strength ?? 0) + share;
	pair.items.add(title);
}

function pairsToEdges(pairs: Map<string, PairAccumulator>): NetworkEdge[] {
	return Array.from(pairs.values()).map((pair) => ({
		source: pair.source,
		target: pair.target,
		weight: pair.items.size,
		...(pair.strength === undefined ? {} : { strength: pair.strength }),
		items: Array.from(pair.items),
		kind: pair.kind
	}));
}

/**
 * One item's contribution to an egocentric network, as seen from the centre
 * person. The builder excludes the centre from every name list itself.
 */
export interface EgoContribution {
	title: string;
	/** People who co-signed the item with the centre (co-authors, co-presenters…). */
	direct: string[];
	/**
	 * Groups of indirect collaborators — e.g. the editors of the volume a
	 * chapter appeared in, or the contributors to an edited volume. Members are
	 * linked to each other, and to each `bridgeTo` name, with `contributor`
	 * edges.
	 */
	contributorGroups?: { members: string[]; bridgeTo?: string[] }[];
}

/**
 * Build an egocentric collaboration network: a centre node, one node per
 * collaborator, `direct` edges from the centre to everyone, `peer` edges
 * between people who co-signed the same item, and `contributor` edges inside
 * (and bridging out of) contributor groups.
 *
 * A person who is *ever* a direct collaborator gets `kind: 'collaborator'`;
 * contributor-only people get `kind: 'contributor'` (deliberately
 * order-independent, unlike the first-write-wins flag this replaces).
 */
export function buildEgoNetwork<T>(
	items: T[],
	getContribution: (item: T) => EgoContribution,
	options: { centerName: string }
): NetworkData {
	const { centerName } = options;
	const notCenter = (name: string) => name !== centerName;

	const people = new Map<string, { items: Set<string>; everDirect: boolean }>();
	const centerItems = new Set<string>();
	const peerPairs = new Map<string, PairAccumulator>();
	const contributorPairs = new Map<string, PairAccumulator>();

	const track = (name: string, title: string, direct: boolean) => {
		let person = people.get(name);
		if (!person) {
			person = { items: new Set(), everDirect: false };
			people.set(name, person);
		}
		person.items.add(title);
		person.everDirect ||= direct;
		centerItems.add(title);
	};

	for (const item of items) {
		const { title, direct, contributorGroups } = getContribution(item);
		const directNames = splitNameList(direct).filter(notCenter);

		for (const name of directNames) track(name, title, true);
		for (let i = 0; i < directNames.length; i++) {
			for (let j = i + 1; j < directNames.length; j++) {
				addPair(peerPairs, directNames[i]!, directNames[j]!, title, 'peer');
			}
		}

		for (const group of contributorGroups ?? []) {
			const members = splitNameList(group.members).filter(notCenter);
			const bridgeTo = splitNameList(group.bridgeTo ?? []).filter(notCenter);
			for (const name of members) track(name, title, false);
			for (let i = 0; i < members.length; i++) {
				for (let j = i + 1; j < members.length; j++) {
					addPair(contributorPairs, members[i]!, members[j]!, title, 'contributor');
				}
				for (const bridged of bridgeTo) {
					addPair(contributorPairs, members[i]!, bridged, title, 'contributor');
				}
			}
		}
	}

	const collaboratorNodes: NetworkNode[] = Array.from(people.entries())
		.map(([id, person]) => ({
			id,
			weight: person.items.size,
			items: Array.from(person.items),
			kind: (person.everDirect ? 'collaborator' : 'contributor') as NetworkNodeKind
		}))
		.sort((a, b) => b.weight - a.weight);

	const centerNode: NetworkNode = {
		id: centerName,
		weight: centerItems.size,
		items: Array.from(centerItems),
		kind: 'center'
	};

	// Explicit centre spokes: the component renders exactly what it is given.
	const directEdges: NetworkEdge[] = collaboratorNodes.map((node) => ({
		source: centerName,
		target: node.id,
		weight: node.weight,
		items: node.items,
		kind: 'direct'
	}));

	return {
		nodes: collaboratorNodes.length > 0 ? [centerNode, ...collaboratorNodes] : [],
		edges: [...directEdges, ...pairsToEdges(peerPairs), ...pairsToEdges(contributorPairs)]
	};
}

/**
 * Author collaboration network across publications.
 *
 * Direct collaborators: co-authors, plus editors of works the centre
 * (co-)edited (any type except chapter/encyclopedia, where `editors` names
 * the *volume* editors), plus the preface author. Contributor layer: volume
 * editors of chapters/encyclopedia entries (bridged to the chapter's
 * co-authors), and table-of-contents authors of edited volumes and special
 * issues.
 */
export function buildPublicationCollaborationNetwork(
	pubs: Publication[],
	centerName: string
): NetworkData {
	return buildEgoNetwork(
		pubs,
		(pub) => {
			const direct = getContributorNames(pub.authors?.filter(isPersonContributor));
			const isVolumeEditorField = pub.type === 'chapter' || pub.type === 'encyclopedia';
			if (pub.editors && !isVolumeEditorField) direct.push(...splitNameList(pub.editors));
			if (pub.prefacedBy) direct.push(pub.prefacedBy);

			const contributorGroups: EgoContribution['contributorGroups'] = [];
			if (pub.editors && isVolumeEditorField) {
				contributorGroups.push({ members: splitNameList(pub.editors), bridgeTo: direct });
			}
			if (pub.tableOfContents && (pub.type === 'book' || pub.type === 'special-issue')) {
				const tocAuthors = pub.tableOfContents.flatMap((entry) =>
					typeof entry === 'string' ? [] : (entry.authors ?? [])
				);
				if (tocAuthors.length > 0) contributorGroups.push({ members: tocAuthors });
			}

			return { title: pub.title, direct, contributorGroups };
		},
		{ centerName }
	);
}

/**
 * Co-presenter network across communications: everyone who appears alongside
 * the centre as a co-author, panel participant, or paper author.
 */
export function buildCommunicationCoPresenterNetwork(
	comms: Communication[],
	centerName: string
): NetworkData {
	return buildEgoNetwork(
		comms,
		(comm) => ({
			title: comm.title,
			direct: [
				...getContributorNames(comm.authors?.filter(isPersonContributor)),
				...(comm.participants ?? []).map((p) => p.name),
				...(comm.papers ?? []).flatMap((paper) => (paper.authors ?? []).map((a) => a.name))
			].filter(Boolean)
		}),
		{ centerName }
	);
}

export interface CooccurrenceOptions<T> {
	/** Keys (tags, affiliations…) attached to an item. Nullish → item skipped. */
	getKeys: (item: T) => string[] | null | undefined;
	getTitle: (item: T) => string;
	/** Drop keys appearing on fewer items than this. Default 2 (no singletons). */
	minNodeWeight?: number;
	/** Drop pairs sharing fewer items than this. Default 2 (anti-hairball). */
	minEdgeWeight?: number;
	/** Drop nodes left without any edge after filtering. Default true. */
	dropIsolatedNodes?: boolean;
	/**
	 * Give each pair from an item with k keys a tie strength of 1/(k−1)
	 * (`NetworkEdge.strength`) instead of 1, so one large item cannot dominate
	 * the layout as a clique. Counts (`weight`) are unchanged. Default false.
	 */
	shareLargeItems?: boolean;
}

/**
 * Build a co-occurrence network: one `entity` node per key weighted by how
 * many items carry it, one `cooccurrence` edge per key pair weighted by how
 * many items carry both. Thresholds keep dense corpora from collapsing into
 * a hairball.
 */
export function buildCooccurrenceNetwork<T>(
	items: T[],
	options: CooccurrenceOptions<T>
): NetworkData {
	const {
		getKeys,
		getTitle,
		minNodeWeight = 2,
		minEdgeWeight = 2,
		dropIsolatedNodes = true,
		shareLargeItems = false
	} = options;

	const entities = new Map<string, Set<string>>();
	const pairs = new Map<string, PairAccumulator>();

	for (const item of items) {
		const raw = getKeys(item);
		if (!raw) continue;
		const keys = splitNameList(raw); // trims, dedupes per item
		if (keys.length === 0) continue;
		const title = getTitle(item);

		for (const key of keys) {
			let titles = entities.get(key);
			if (!titles) {
				titles = new Set();
				entities.set(key, titles);
			}
			titles.add(title);
		}
		const share = shareLargeItems ? 1 / Math.max(1, keys.length - 1) : undefined;
		for (let i = 0; i < keys.length; i++) {
			for (let j = i + 1; j < keys.length; j++) {
				addPair(pairs, keys[i]!, keys[j]!, title, 'cooccurrence', share);
			}
		}
	}

	const keptIds = new Set(
		Array.from(entities.entries())
			.filter(([, titles]) => titles.size >= minNodeWeight)
			.map(([id]) => id)
	);

	const edges = pairsToEdges(pairs).filter(
		(edge) => edge.weight >= minEdgeWeight && keptIds.has(edge.source) && keptIds.has(edge.target)
	);

	if (dropIsolatedNodes) {
		const connected = new Set<string>();
		for (const edge of edges) {
			connected.add(edge.source);
			connected.add(edge.target);
		}
		for (const id of keptIds) if (!connected.has(id)) keptIds.delete(id);
	}

	const nodes: NetworkNode[] = Array.from(keptIds)
		.map((id) => {
			const titles = entities.get(id)!;
			return { id, weight: titles.size, items: Array.from(titles), kind: 'entity' as const };
		})
		.sort((a, b) => b.weight - a.weight);

	return { nodes, edges };
}

/**
 * Words that open a description of a person's role rather than the name of a
 * body. An institution is named by what it is ("University of …", "Leibniz-
 * Zentrum …", "LASDEL"); a credit line that begins "Author of", "Founder,",
 * "Translator and Editor at" or "Unaffiliated" describes the speaker, and
 * linking it to other institutions would draw a person as an organisation.
 */
const ROLE_OPENING =
	/^(?:author|co-?founder|founder|translator|editor|writer|novelist|poet|artist|filmmaker|journalist|curator|director|consultant|freelance|independent|unaffiliated|retired|ph\.?d\.? candidate)\b/i;

/** False for a credit line that describes a role (see `ROLE_OPENING`), true otherwise. */
export function isInstitutionalAffiliation(affiliation: string): boolean {
	const value = affiliation.trim();
	return value.length > 0 && !ROLE_OPENING.test(value);
}

/** Typographic and straight apostrophes compare equal ("Côte d’Ivoire"). */
function foldApostrophes(value: string): string {
	return value.replace(/[’‘ʼ]/gu, "'");
}

let regionNames: ReadonlySet<string> | undefined;

/**
 * Every English country and region name the runtime's CLDR data knows
 * (`Intl.DisplayNames` over the two-letter ISO 3166 codes), apostrophes
 * folded. The site's own country list (`geo.ts`) holds only the countries
 * with a mapped record, so it missed Nigeria; the standard list does not.
 */
export function englishRegionNames(): ReadonlySet<string> {
	if (regionNames) return regionNames;
	const names = new Set<string>();
	try {
		const display = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });
		const A = 'A'.charCodeAt(0);
		for (let i = 0; i < 26; i++) {
			for (let j = 0; j < 26; j++) {
				const code = String.fromCharCode(A + i, A + j);
				const name = display.of(code);
				if (name && name !== code) names.add(foldApostrophes(name));
			}
		}
	} catch {
		// No Intl region data: fall back to the names the caller passes.
	}
	regionNames = names;
	return names;
}

/**
 * The institution an affiliation names, with a trailing ", <country>" removed
 * when the country is one of `countries`: "University of Ibadan, Nigeria" and
 * "University of Ibadan" are one node, and a long label is never cut to
 * "Niger…". Only a final segment that is a known country name is removed, so
 * "LLACAN, Centre national de la recherche scientifique" keeps its second half.
 */
export function institutionKey(affiliation: string, countries: ReadonlySet<string>): string {
	const value = affiliation.trim();
	const comma = value.lastIndexOf(',');
	if (comma <= 0) return value;
	const tail = foldApostrophes(value.slice(comma + 1).trim());
	return countries.has(tail) ? value.slice(0, comma).trim() : value;
}

/**
 * Institution network across communications: two institutions are linked when
 * people affiliated with them appeared in the same panel, workshop, or event.
 * Thresholds default to 1/1 — the affiliation corpus is small, and the page
 * can tighten them once real density is known.
 *
 * Three corrections on the raw credit lines, each a rule rather than a list:
 * role descriptions are not institutions (`isInstitutionalAffiliation`); a
 * trailing country is folded into the institution it qualifies
 * (`institutionKey`, against `englishRegionNames` plus any `countries`
 * passed); and an event's pairs
 * share one unit of tie strength (`shareLargeItems`), so a workshop with two
 * dozen institutions is drawn as the loose group it is rather than a clique.
 */
export function buildInstitutionNetwork(
	comms: Communication[],
	options: { minNodeWeight?: number; minEdgeWeight?: number; countries?: Iterable<string> } = {}
): NetworkData {
	const countries = new Set([
		...englishRegionNames(),
		...[...(options.countries ?? [])].map(foldApostrophes)
	]);
	return buildCooccurrenceNetwork(comms, {
		getKeys: (comm) =>
			[
				...(comm.participants ?? []).map((p) => p.affiliation ?? ''),
				...(comm.papers ?? []).flatMap((paper) =>
					(paper.authors ?? []).map((a) => a.affiliation ?? '')
				)
			]
				.filter(isInstitutionalAffiliation)
				.map((affiliation) => institutionKey(affiliation, countries)),
		getTitle: (comm) => comm.title,
		minNodeWeight: options.minNodeWeight ?? 1,
		minEdgeWeight: options.minEdgeWeight ?? 1,
		shareLargeItems: true
	});
}
