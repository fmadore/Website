/**
 * Pure network builders shared by the visualisations pages
 * (publications/visualisations and conference-activity/visualisations).
 *
 * Every builder returns the same `NetworkData` shape consumed by
 * `EChartsNetworkGraph`: weighted nodes plus weighted edges, each tagged with
 * a `kind` that drives styling (colour, dash pattern, symbol) and legend copy
 * in the component. Keeping the graph *structure* here — including the
 * explicit centre→node edges of the egocentric networks — leaves the
 * component free of aggregation logic and makes the algorithms unit-testable
 * alongside the other builders in `vizAggregation.ts`.
 */
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';

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
	items: string[];
	kind: NetworkEdgeKind;
}

export interface NetworkData {
	/** Sorted weight-descending; the centre node (when present) comes first. */
	nodes: NetworkNode[];
	edges: NetworkEdge[];
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
}

/** Record one shared item on the undirected a–b edge (O(1) via Map). */
function addPair(
	pairs: Map<string, PairAccumulator>,
	a: string,
	b: string,
	title: string,
	kind: NetworkEdgeKind
): void {
	if (a === b) return;
	const key = pairKey(a, b);
	let pair = pairs.get(key);
	if (!pair) {
		pair = { source: a, target: b, items: new Set(), kind };
		pairs.set(key, pair);
	}
	pair.items.add(title);
}

function pairsToEdges(pairs: Map<string, PairAccumulator>): NetworkEdge[] {
	return Array.from(pairs.values()).map((pair) => ({
		source: pair.source,
		target: pair.target,
		weight: pair.items.size,
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
				addPair(peerPairs, directNames[i], directNames[j], title, 'peer');
			}
		}

		for (const group of contributorGroups ?? []) {
			const members = splitNameList(group.members).filter(notCenter);
			const bridgeTo = splitNameList(group.bridgeTo ?? []).filter(notCenter);
			for (const name of members) track(name, title, false);
			for (let i = 0; i < members.length; i++) {
				for (let j = i + 1; j < members.length; j++) {
					addPair(contributorPairs, members[i], members[j], title, 'contributor');
				}
				for (const bridged of bridgeTo) {
					addPair(contributorPairs, members[i], bridged, title, 'contributor');
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
			const direct = [...(pub.authors ?? [])];
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
				...(comm.authors ?? []),
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
		dropIsolatedNodes = true
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
		for (let i = 0; i < keys.length; i++) {
			for (let j = i + 1; j < keys.length; j++) {
				addPair(pairs, keys[i], keys[j], title, 'cooccurrence');
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
 * Institution network across communications: two institutions are linked when
 * people affiliated with them appeared in the same panel, workshop, or event.
 * Thresholds default to 1/1 — the affiliation corpus is small, and the page
 * can tighten them once real density is known.
 */
export function buildInstitutionNetwork(
	comms: Communication[],
	options: { minNodeWeight?: number; minEdgeWeight?: number } = {}
): NetworkData {
	return buildCooccurrenceNetwork(comms, {
		getKeys: (comm) => [
			...(comm.participants ?? []).map((p) => p.affiliation ?? ''),
			...(comm.papers ?? []).flatMap((paper) =>
				(paper.authors ?? []).map((a) => a.affiliation ?? '')
			)
		],
		getTitle: (comm) => comm.title,
		minNodeWeight: options.minNodeWeight ?? 1,
		minEdgeWeight: options.minEdgeWeight ?? 1
	});
}
