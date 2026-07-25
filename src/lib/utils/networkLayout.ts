/**
 * Pure layout maths for the network graphs, kept out of the Svelte component
 * so it can be unit-tested alongside `networkAggregation.ts`.
 *
 * Given a `SelectedGraph` from `networkAggregation.selectGraph()`, this module
 * supplies the geometry in two independently testable steps:
 *
 *   computeNetworkLayout() a settled d3-force layout + deconflicted labels
 *   fitTransform()         the translate/scale that sits the result in the box
 *
 * It is the only module that pulls in d3-force, so the component imports it
 * dynamically and the force code stays in the lazy `d3-interactive` chunk.
 *
 * Two properties matter more here than in a typical force graph, and both are
 * deliberate:
 *
 * 1. **Determinism.** An archive should draw the same map on every visit.
 *    d3-force seeds node positions on a phyllotaxis spiral (already stable for
 *    a stable node order), but its forces call `Math.random()` to jiggle
 *    coincident points. `simulation.randomSource()` swaps that for a seeded
 *    PRNG, so the whole layout is a pure function of its input.
 *
 * 2. **Settled, not animated.** The simulation is ticked to convergence here
 *    and the component renders the final positions once. Nothing moves on
 *    screen — the register is print, not app (see `.impeccable.md`).
 */
import {
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	forceX,
	forceY,
	type SimulationLinkDatum,
	type SimulationNodeDatum
} from 'd3-force';
import type {
	NetworkEdge,
	NetworkEdgeKind,
	NetworkNode,
	SelectedGraph
} from '$lib/utils/networkAggregation';

/** A node kept by `selectGraph`, with the radius the layout will draw it at. */
export interface LaidOutNode extends NetworkNode {
	x: number;
	y: number;
	r: number;
	label: PlacedLabel;
}

/** Where a node's label goes, or `show: false` when nothing fitted. */
export interface PlacedLabel {
	text: string;
	/** Absolute position of the text anchor, in layout units. */
	x: number;
	y: number;
	anchor: 'start' | 'middle' | 'end';
	show: boolean;
}

export interface NetworkLayout {
	nodes: LaidOutNode[];
	edges: NetworkEdge[];
	/** Bounding box of everything drawn, in layout units. */
	bounds: Bounds;
}

export interface Bounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/** Node radius in layout units. Area — not radius — tracks the weight. */
export function nodeRadius(
	weight: number,
	maxWeight: number,
	isCenter: boolean,
	isMobile: boolean
): number {
	if (isCenter) return isMobile ? 26 : 34;
	const min = isMobile ? 7 : 9;
	const max = isMobile ? 18 : 24;
	const t = Math.sqrt(Math.max(0, weight) / Math.max(1, maxWeight));
	return min + (max - min) * Math.min(1, t);
}

/**
 * Deterministic 32-bit PRNG (mulberry32). Handed to d3-force via
 * `randomSource` so no part of the layout depends on `Math.random()`.
 */
export function seededRandom(seed: number = 0x9e3779b9): () => number {
	let a = seed >>> 0;
	return function random(): number {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Approximate advance width of monospace text, used when no canvas exists. */
export function approximateTextWidth(text: string, fontSize: number): number {
	// Spline Sans Mono's advance is ~0.6em; every glyph is the same width.
	return text.length * fontSize * 0.6;
}

export interface LayoutOptions {
	width: number;
	height: number;
	isMobile?: boolean;
	/** Label font size in layout units. */
	fontSize?: number;
	/** Longest label rendered before truncation is attempted. */
	maxLabelChars?: number;
	/**
	 * Cap on how many nodes are labelled at all. On a narrow viewport, trying to
	 * label everything widens the bounding box until the fit transform shrinks
	 * the whole plate to unreadable — fewer, larger labels beat more, tinier
	 * ones. Unlabelled nodes keep their tooltip and their aria-label.
	 */
	maxLabels?: number;
	/** Injected so the component can measure with a real font. */
	measureText?: (text: string, fontSize: number) => number;
	/** Simulation ticks. 400 settles these graph sizes comfortably. */
	ticks?: number;
	seed?: number;
}

type SimNode = SimulationNodeDatum & { id: string; r: number; kind: NetworkNode['kind'] };
type SimLink = SimulationLinkDatum<SimNode> & { kind: NetworkEdgeKind; weight: number };

/**
 * Run the force layout to convergence and place the labels.
 *
 * The centre node (when there is one) is pinned to the middle: it is attached
 * to every other node by construction, so letting it float only smears the
 * whole graph around without encoding anything.
 */
export function computeNetworkLayout(
	selected: SelectedGraph,
	options: LayoutOptions
): NetworkLayout {
	const {
		width,
		height,
		isMobile = false,
		fontSize = isMobile ? 10 : 12,
		maxLabelChars = isMobile ? 18 : 28,
		maxLabels = isMobile ? 12 : Infinity,
		measureText = approximateTextWidth,
		ticks = 400,
		seed
	} = options;

	const { nodes, edges, maxWeight } = selected;
	if (nodes.length === 0) {
		return { nodes: [], edges: [], bounds: { minX: 0, minY: 0, maxX: width, maxY: height } };
	}

	const simNodes: SimNode[] = nodes.map((node) => ({
		id: node.id,
		kind: node.kind,
		r: nodeRadius(node.weight, maxWeight, node.kind === 'center', isMobile)
	}));
	const byId = new Map(simNodes.map((n) => [n.id, n]));

	// Only edges whose endpoints both survived selection reach this far, but
	// guard anyway — forceLink throws on an unresolvable node id.
	const simLinks: SimLink[] = edges
		.filter((e) => byId.has(e.source) && byId.has(e.target))
		.map((e) => ({ source: e.source, target: e.target, kind: e.kind, weight: e.weight }));

	const center = simNodes.find((n) => n.kind === 'center');
	if (center) {
		center.fx = width / 2;
		center.fy = height / 2;
	}

	const base = Math.min(width, height) / (isMobile ? 3.2 : 3.8);
	const random = seededRandom(seed);

	const simulation = forceSimulation(simNodes)
		.randomSource(random)
		.force(
			'link',
			forceLink<SimNode, SimLink>(simLinks)
				.id((d) => d.id)
				// Heavier ties sit closer together — the distance encodes the
				// weight, so the edge width isn't carrying it alone.
				.distance((l) => base / (1 + Math.log1p(l.weight) * 0.45))
				.strength((l) => (l.kind === 'direct' ? 0.35 : 0.12))
		)
		.force('charge', forceManyBody<SimNode>().strength(isMobile ? -260 : -420))
		// Centring is split into two axes with the horizontal pull weakened by
		// the container's aspect ratio, so the cloud takes the shape of the box
		// it lives in. A plain forceCenter pulls equally and leaves a wide plate
		// with big empty margins either side. (Same trick as D3BubbleChart.)
		.force('x', forceX<SimNode>(width / 2).strength(0.07 / Math.max(1, width / height)))
		.force('y', forceY<SimNode>(height / 2).strength(0.07))
		// The +6 keeps a hairline of ground between adjacent discs.
		.force('collide', forceCollide<SimNode>((d) => d.r + 6).iterations(4))
		.stop();

	for (let i = 0; i < ticks; i++) simulation.tick();

	const positioned = simNodes.map((sim, index) => ({
		node: nodes[index]!,
		x: sim.x ?? width / 2,
		y: sim.y ?? height / 2,
		r: sim.r
	}));

	const labels = placeLabels(positioned, { fontSize, maxLabelChars, maxLabels, measureText });

	const laidOut: LaidOutNode[] = positioned.map((p, i) => ({
		...p.node,
		x: p.x,
		y: p.y,
		r: p.r,
		label: labels[i]!
	}));

	return { nodes: laidOut, edges, bounds: boundsOf(laidOut, fontSize, measureText) };
}

interface Rect {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
	return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/** True when a circle intersects an axis-aligned rectangle. */
function circleHitsRect(cx: number, cy: number, r: number, rect: Rect): boolean {
	const nearestX = Math.max(rect.x0, Math.min(cx, rect.x1));
	const nearestY = Math.max(rect.y0, Math.min(cy, rect.y1));
	const dx = cx - nearestX;
	const dy = cy - nearestY;
	return dx * dx + dy * dy < r * r;
}

/**
 * Greedy label placement: important nodes claim a slot first, and anything
 * that cannot find a clear one goes unlabelled rather than being printed on
 * top of a neighbour. This is the single biggest legibility win over the
 * ECharts `graph` series, which has no label-collision handling at all.
 *
 * Each node is offered four slots (right, left, above, below) at full length,
 * then the same four truncated. The centre node is always labelled — it is the
 * subject of the diagram — and claims its slot before anyone else.
 */
function placeLabels(
	positioned: { node: NetworkNode; x: number; y: number; r: number }[],
	options: {
		fontSize: number;
		maxLabelChars: number;
		maxLabels: number;
		measureText: (text: string, fontSize: number) => number;
	}
): PlacedLabel[] {
	const { fontSize, maxLabelChars, maxLabels, measureText } = options;
	const gap = 6;
	// Half the *visual* line box, not the cap height: ascender + descender plus
	// a little leading. Measuring tighter than this is what makes stacked
	// labels read as touching even though the rectangles technically clear.
	const half = fontSize * 0.58;
	// Horizontal breathing room, so two labels side by side stay distinct.
	const padX = 4;

	const labels: PlacedLabel[] = new Array(positioned.length);
	const claimed: Rect[] = [];

	/**
	 * Candidate slot `slot` (right, left, above, below) pushed `offset` beyond
	 * the node's edge. Trying successively larger offsets is what lets a hub in
	 * a crowded middle reach past its neighbours to clear space — with only the
	 * near ring, the heaviest nodes systematically lose their labels to the
	 * discs packed around them, which is precisely backwards.
	 */
	const candidateRect = (
		p: { x: number; y: number; r: number },
		text: string,
		slot: number,
		offset: number
	): { rect: Rect; label: Omit<PlacedLabel, 'show'> } => {
		// The drawn text is `w` wide; the rect it reserves is padded so
		// neighbouring labels keep a visible gap rather than merely not touching.
		const w = measureText(text, fontSize);
		const rw = w + padX * 2;
		// Baseline sits slightly below the node's centre line, so the text looks
		// vertically centred against the disc rather than hanging off it.
		const baseline = fontSize * 0.34;
		switch (slot) {
			case 0: {
				const x = p.x + p.r + offset;
				return {
					rect: { x0: x - padX, y0: p.y - half, x1: x + rw - padX, y1: p.y + half },
					label: { text, x, y: p.y + baseline, anchor: 'start' }
				};
			}
			case 1: {
				const x = p.x - p.r - offset;
				return {
					rect: { x0: x - rw + padX, y0: p.y - half, x1: x + padX, y1: p.y + half },
					label: { text, x, y: p.y + baseline, anchor: 'end' }
				};
			}
			case 2: {
				const y = p.y - p.r - offset;
				return {
					rect: { x0: p.x - rw / 2, y0: y - half * 2, x1: p.x + rw / 2, y1: y },
					label: { text, x: p.x, y, anchor: 'middle' }
				};
			}
			default: {
				const y = p.y + p.r + offset + fontSize * 0.8;
				return {
					rect: { x0: p.x - rw / 2, y0: y - half * 2, x1: p.x + rw / 2, y1: y },
					label: { text, x: p.x, y, anchor: 'middle' }
				};
			}
		}
	};

	// Near ring first — a label touching its node is unambiguous. The further
	// rings stay radially aligned, so the association survives the distance.
	const offsets = [gap, gap + fontSize * 1.4, gap + fontSize * 2.8];

	// Centre first, then heaviest first: the nodes a reader looks for get the
	// clean slots, and the tail is what goes unlabelled.
	const order = positioned
		.map((p, index) => ({ p, index }))
		.sort(
			(a, b) =>
				Number(b.p.node.kind === 'center') - Number(a.p.node.kind === 'center') ||
				b.p.node.weight - a.p.node.weight ||
				a.p.node.id.localeCompare(b.p.node.id)
		);

	let shown = 0;

	for (const { p, index } of order) {
		// `maxLabelChars` is a hard cap on what is drawn, not a fallback: a long
		// name is shortened even when it happens to have room, so label width
		// stays bounded and the fit transform can't be dragged out by one entry.
		const full = p.node.id;
		const text =
			full.length > maxLabelChars ? full.slice(0, Math.max(1, maxLabelChars - 1)) + '…' : full;
		const isCenter = p.node.kind === 'center';

		let placed: PlacedLabel | null = null;
		// The near-right slot, used when a label must be drawn regardless.
		const fallback: PlacedLabel = { ...candidateRect(p, text, 0, gap).label, show: true };

		// Past the cap, only the centre still gets a label. `order` is
		// weight-descending, so the budget is spent on the heaviest nodes.
		const overBudget = shown >= maxLabels && !isCenter;

		search: for (const offset of overBudget ? [] : offsets) {
			for (let slot = 0; slot < 4; slot++) {
				const { rect, label } = candidateRect(p, text, slot, offset);

				const hitsLabel = claimed.some((c) => rectsOverlap(c, rect));
				const hitsNode = positioned.some(
					(other) => other !== p && circleHitsRect(other.x, other.y, other.r, rect)
				);
				if (!hitsLabel && !hitsNode) {
					claimed.push(rect);
					placed = { ...label, show: true };
					break search;
				}
			}
		}

		// The centre is never dropped — it is the subject of the diagram — and it
		// claims its slot so nobody else lands on top of it. Everyone else yields.
		if (placed) {
			labels[index] = placed;
			shown++;
		} else if (isCenter) {
			labels[index] = fallback;
			claimed.push(candidateRect(p, text, 0, gap).rect);
			shown++;
		} else {
			labels[index] = { ...fallback, show: false };
		}
	}

	return labels;
}

/**
 * Bounding box over the discs and whichever labels were actually placed.
 *
 * Takes the same measurer the placement used — measuring with the module's
 * estimate while placing with the browser's real metrics would understate the
 * box and let the fit transform clip the widest labels.
 */
function boundsOf(
	nodes: LaidOutNode[],
	fontSize: number,
	measureText: (text: string, fontSize: number) => number
): Bounds {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	const grow = (x0: number, y0: number, x1: number, y1: number) => {
		minX = Math.min(minX, x0);
		minY = Math.min(minY, y0);
		maxX = Math.max(maxX, x1);
		maxY = Math.max(maxY, y1);
	};

	for (const node of nodes) {
		grow(node.x - node.r, node.y - node.r, node.x + node.r, node.y + node.r);
		if (!node.label.show) continue;
		const w = measureText(node.label.text, fontSize);
		const x =
			node.label.anchor === 'start'
				? node.label.x
				: node.label.anchor === 'end'
					? node.label.x - w
					: node.label.x - w / 2;
		grow(x, node.label.y - fontSize, x + w, node.label.y + fontSize * 0.3);
	}

	if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
	return { minX, minY, maxX, maxY };
}

export interface FitTransform {
	x: number;
	y: number;
	k: number;
}

/**
 * The transform that sits `bounds` inside a `width`×`height` box with `padding`
 * to spare. Capped at k = 1 so a sparse graph is never blown up past its
 * nominal type size — it only ever shrinks to fit.
 */
export function fitTransform(
	bounds: Bounds,
	width: number,
	height: number,
	padding: number = 12
): FitTransform {
	const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
	const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
	const k = Math.min(
		1,
		(width - padding * 2) / contentWidth,
		(height - padding * 2) / contentHeight
	);
	return {
		k,
		x: width / 2 - ((bounds.minX + bounds.maxX) / 2) * k,
		y: height / 2 - ((bounds.minY + bounds.maxY) / 2) * k
	};
}
