<!--
NetworkGraph — renders NetworkData from $lib/utils/networkAggregation:
egocentric collaboration networks (with a centre node) and flat co-occurrence
networks (keywords, institutions).

Drawn as declarative SVG from a settled d3-force layout, replacing the ECharts
`graph` series. Three things follow from that choice:

  • Nothing moves. The simulation is ticked to convergence in
    `networkLayout.ts` and the result is rendered once, from a seeded PRNG, so
    the same corpus always draws the same map. The register is print.
  • Labels never collide. Slots are assigned greedily by weight and a node
    that cannot find clear space goes unlabelled — the ECharts series had no
    collision handling, so dense graphs printed names on top of each other.
  • Filtering is not relayout. `highlightQuery` only ever changes styling;
    the layout depends on the selection alone, so typing in the search box
    dims nodes instead of restarting the simulation.

Colour encodes the node/edge kind, size and link distance encode the weight;
no two channels carry the same value.
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import Icon from '@iconify/svelte';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import { downloadSvgAsImage } from '$lib/utils/chartActions';
	import ChartToolbar from './ChartToolbar.svelte';
	import { selectGraph } from '$lib/utils/networkAggregation';
	import type { NetworkNode, NetworkEdge, NetworkEdgeKind } from '$lib/utils/networkAggregation';
	import type { FitTransform, NetworkLayout } from '$lib/utils/networkLayout';

	type NetworkLabels = {
		itemSingular?: string; // e.g. 'publication' or 'communication'
		itemPlural?: string; // e.g. 'Publications' or 'Communications'
		collaboratorNode?: string; // legend label for collaborator nodes
		contributorNode?: string; // legend label for contributor nodes
		entityNode?: string; // legend label for entity nodes (keywords, institutions)
		directEdge?: string; // e.g. 'Direct collaboration'
		peerEdge?: string; // edge tooltip heading + legend (e.g. 'Co-author connection')
		peerShared?: string; // line before the list (e.g. 'Shared publications')
		contributorEdge?: string; // e.g. 'Contributor connection'
		contributorShared?: string; // e.g. 'Shared edited volumes/special issues'
		cooccurrenceEdge?: string; // e.g. 'Keyword co-occurrence'
		cooccurrenceShared?: string; // e.g. 'Publications sharing both'
	};

	let {
		nodes = [] as NetworkNode[],
		edges = [] as NetworkEdge[],
		centerId = undefined,
		maxNodes = 20, // Cap on non-centre nodes, for readability
		visibleEdgeKinds = undefined,
		highlightQuery = '',
		entityColor = 'slateBlue',
		labels = {} as NetworkLabels,
		filename = 'network',
		ariaDescription = undefined
	}: {
		nodes?: NetworkNode[];
		edges?: NetworkEdge[];
		centerId?: string;
		maxNodes?: number;
		visibleEdgeKinds?: NetworkEdgeKind[];
		highlightQuery?: string;
		entityColor?: 'slateBlue' | 'sage';
		labels?: NetworkLabels;
		filename?: string;
		ariaDescription?: string;
	} = $props();

	const labelCopy = $derived({
		itemSingular: labels.itemSingular ?? 'publication',
		itemPlural: labels.itemPlural ?? 'Publications',
		collaboratorNode: labels.collaboratorNode ?? 'Collaborators',
		contributorNode: labels.contributorNode ?? 'Contributors',
		entityNode: labels.entityNode ?? 'Entities',
		directEdge: labels.directEdge ?? 'Direct collaboration',
		peerEdge: labels.peerEdge ?? 'Co-author connection',
		peerShared: labels.peerShared ?? 'Shared publications',
		contributorEdge: labels.contributorEdge ?? 'Contributor connection',
		contributorShared: labels.contributorShared ?? 'Shared edited volumes/special issues',
		cooccurrenceEdge: labels.cooccurrenceEdge ?? 'Co-occurrence',
		cooccurrenceShared: labels.cooccurrenceShared ?? 'Shared items'
	});

	let outerContainer = $state<HTMLDivElement>(undefined!);
	let plotContainer = $state<HTMLDivElement>(undefined!);
	let svgEl = $state<SVGSVGElement>(undefined!);
	let containerWidth = $state(900);
	let containerHeight = $state(460);

	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// getResolvedChartColors() reads getTheme() internally, so this $derived
	// re-runs on a theme toggle — and because the SVG binds these as
	// attributes, recolouring costs one attribute patch, not a re-render.
	const resolvedColors = $derived(getResolvedChartColors());

	/* Colour encodes the node's role — size already encodes the weight, so a
	 * count-keyed colour ramp would double-encode it. Ink = centre, pine =
	 * collaborators (the living connections), ochre = contributor-only,
	 * slate-blue/olive = entities (keywords, institutions). */
	const nodeColors = $derived({
		center: resolvedColors.primary,
		collaborator: resolvedColors.accent,
		contributor: resolvedColors.ochre,
		entity: entityColor === 'sage' ? resolvedColors.sage : resolvedColors.slateBlue
	});

	const edgeColors = $derived({
		direct: resolvedColors.primary,
		peer: resolvedColors.accent,
		contributor: resolvedColors.ochre,
		cooccurrence: resolvedColors.primary
	});

	// Dash patterns are the non-colour channel for the edge kind, so the layers
	// stay distinguishable in the PNG export and for colour-blind readers.
	const EDGE_DASH: Record<NetworkEdgeKind, string | null> = {
		direct: null,
		peer: '6 4',
		contributor: '2 3',
		cooccurrence: null
	};
	const EDGE_OPACITY: Record<NetworkEdgeKind, number> = {
		direct: 0.4,
		peer: 0.45,
		contributor: 0.4,
		cooccurrence: 0.28
	};

	function edgeWidth(edge: NetworkEdge): number {
		const scale = edge.kind === 'direct' ? 1.2 : 1;
		return Math.max(0.75, Math.min(5, Math.log1p(edge.weight) * 1.9 * scale));
	}

	// --- Selection (drives the layout) -------------------------------------
	// Deliberately independent of highlightQuery: search must not relayout.
	const selection = $derived(selectGraph(nodes, edges, { centerId, maxNodes, visibleEdgeKinds }));

	// --- Highlight (drives styling only) -----------------------------------
	// Diacritic-insensitive matching ("Frédérick" matches "frederick").
	function fold(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '');
	}

	const foldedQuery = $derived(fold(highlightQuery.trim()));
	const matchedIds = $derived(
		foldedQuery
			? new Set(selection.nodes.filter((n) => fold(n.id).includes(foldedQuery)).map((n) => n.id))
			: undefined
	);

	let hoveredId = $state<string | null>(null);

	/**
	 * Nodes adjacent to the hovered/focused one — the `focus: 'adjacency'` idiom.
	 * Collected as an array and frozen into a Set at the end: the derived
	 * recomputes wholesale, so nothing ever mutates the Set after it is read.
	 */
	const adjacentIds = $derived.by(() => {
		if (!hoveredId) return undefined;
		const ids = [hoveredId];
		for (const edge of selection.edges) {
			if (edge.source === hoveredId) ids.push(edge.target);
			else if (edge.target === hoveredId) ids.push(edge.source);
		}
		return new Set(ids);
	});

	/** A node is dimmed when it is outside the search match or the focus set. */
	function nodeDimmed(id: string): boolean {
		if (adjacentIds) return !adjacentIds.has(id);
		if (matchedIds) return !matchedIds.has(id);
		return false;
	}

	function edgeDimmed(edge: NetworkEdge): boolean {
		if (adjacentIds) return !(adjacentIds.has(edge.source) && adjacentIds.has(edge.target));
		if (matchedIds) return !(matchedIds.has(edge.source) || matchedIds.has(edge.target));
		return false;
	}

	// --- Layout -------------------------------------------------------------
	// networkLayout.ts is the only module importing d3-force, so it loads
	// lazily and the force code stays in the d3-interactive chunk.
	type LayoutModule = typeof import('$lib/utils/networkLayout');
	let layoutModule = $state<LayoutModule | null>(null);
	let layout = $state<NetworkLayout | null>(null);

	$effect(() => {
		let cancelled = false;
		import('$lib/utils/networkLayout').then((mod) => {
			if (!cancelled) layoutModule = mod;
		});
		return () => {
			cancelled = true;
		};
	});

	/**
	 * Measure with the real font rather than the module's monospace estimate,
	 * so label collision uses the widths the browser will actually draw.
	 */
	let measureCtx: CanvasRenderingContext2D | null = null;
	function measureText(text: string, fontSize: number): number {
		if (typeof document === 'undefined') return text.length * fontSize * 0.6;
		if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
		if (!measureCtx) return text.length * fontSize * 0.6;
		measureCtx.font = `${fontSize}px ${resolvedColors.fontFamily}`;
		return measureCtx.measureText(text).width;
	}

	// Resizing streams values during a window drag and each rebuild re-runs a
	// 400-tick simulation, so coalesce everything after the first sized paint.
	let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
	let hasBuilt = false;

	$effect(() => {
		const mod = layoutModule;
		const selected = selection;
		const width = containerWidth;
		const height = containerHeight;
		const mobile = isMobile;

		if (!mod || selected.nodes.length === 0 || width < 1 || height < 1) return;

		const build = () => {
			layout = mod.computeNetworkLayout(selected, {
				width,
				height,
				isMobile: mobile,
				measureText
			});
			resetZoom();
		};

		if (!hasBuilt) {
			hasBuilt = true;
			build();
			return;
		}
		clearTimeout(rebuildTimer);
		rebuildTimer = setTimeout(build, 150);
		return () => clearTimeout(rebuildTimer);
	});

	const nodeById = $derived(new Map((layout?.nodes ?? []).map((n) => [n.id, n])));
	const fontSize = $derived(isMobile ? 10 : 12);

	// --- Zoom / pan ---------------------------------------------------------
	// The fit transform is installed *as* the zoom transform, so there is a
	// single transform to reason about and "reset" means "back to fit".
	let transform = $state<FitTransform>({ x: 0, y: 0, k: 1 });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- d3-zoom behaviour, typed on use
	let zoomBehavior: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- d3 selection of the svg element
	let zoomSelection: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- d3-zoom's zoomIdentity
	let zoomIdentity: any = null;

	$effect(() => {
		if (!svgEl) return;
		let disposed = false;

		Promise.all([import('d3-zoom'), import('d3-selection')]).then(([zoomMod, selectionMod]) => {
			if (disposed || !svgEl) return;
			zoomIdentity = zoomMod.zoomIdentity;
			zoomBehavior = zoomMod
				.zoom()
				.scaleExtent([0.4, 6])
				.on('zoom', (event: { transform: FitTransform }) => {
					transform = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
				});
			zoomSelection = selectionMod.select(svgEl);
			zoomSelection.call(zoomBehavior);
			applyFit();
		});

		return () => {
			disposed = true;
			zoomSelection?.on('.zoom', null);
			zoomSelection = null;
			zoomBehavior = null;
		};
	});

	/** Push the layout's fit transform into d3-zoom as the new baseline. */
	function applyFit() {
		if (!layout || !layoutModule) return;
		const fit = layoutModule.fitTransform(layout.bounds, containerWidth, containerHeight);
		transform = fit;
		if (zoomSelection && zoomBehavior && zoomIdentity) {
			zoomSelection.call(zoomBehavior.transform, zoomIdentity.translate(fit.x, fit.y).scale(fit.k));
		}
	}

	function resetZoom() {
		// The layout has just been replaced; wait for it to land in state.
		queueMicrotask(applyFit);
	}

	function zoomBy(factor: number) {
		if (zoomSelection && zoomBehavior) zoomSelection.call(zoomBehavior.scaleBy, factor);
	}

	// --- Tooltip ------------------------------------------------------------
	type TooltipContent = { title: string; meta?: string; lines: string[] };
	let tooltip = $state<{ content: TooltipContent; x: number; y: number } | null>(null);

	function edgeHeading(kind: NetworkEdgeKind): { heading: string; shared: string } {
		switch (kind) {
			case 'peer':
				return { heading: labelCopy.peerEdge, shared: labelCopy.peerShared };
			case 'contributor':
				return { heading: labelCopy.contributorEdge, shared: labelCopy.contributorShared };
			case 'cooccurrence':
				return { heading: labelCopy.cooccurrenceEdge, shared: labelCopy.cooccurrenceShared };
			default:
				return { heading: labelCopy.directEdge, shared: labelCopy.peerShared };
		}
	}

	/** Long item lists overflow the plate; cap them and say how many were cut. */
	function summarise(items: string[], limit: number = 6): string[] {
		if (items.length <= limit) return items;
		return [...items.slice(0, limit), `…and ${items.length - limit} more`];
	}

	function nodeTooltip(node: NetworkNode): TooltipContent {
		if (node.kind === 'center') {
			return {
				title: node.id,
				meta: `Centre of the network — ${node.weight} ${labelCopy.itemPlural.toLowerCase()} with collaborators`,
				lines: []
			};
		}
		return {
			title: node.id,
			meta: `${labelCopy.itemPlural}: ${node.weight}`,
			lines: summarise(node.items)
		};
	}

	/** One-line description of an edge for the accessibility tree. */
	function edgeAriaLabel(edge: NetworkEdge): string {
		const { heading, shared } =
			edge.kind === 'direct'
				? { heading: labelCopy.directEdge, shared: labelCopy.itemPlural }
				: edgeHeading(edge.kind);
		return `${heading}: ${edge.source} and ${edge.target} — ${shared}: ${edge.weight}`;
	}

	function edgeTooltip(edge: NetworkEdge): TooltipContent {
		if (edge.kind === 'direct') {
			const unit = edge.weight > 1 ? labelCopy.itemPlural.toLowerCase() : labelCopy.itemSingular;
			return {
				title: `${edge.source} ↔ ${edge.target}`,
				meta: `${edge.weight} ${unit}`,
				lines: summarise(edge.items)
			};
		}
		const { heading, shared } = edgeHeading(edge.kind);
		return {
			title: heading,
			meta: `${edge.source} ↔ ${edge.target} — ${shared}: ${edge.weight}`,
			lines: summarise(edge.items)
		};
	}

	/** Place the tooltip near a point, clamped inside the plot box. */
	function positionTooltip(clientX: number, clientY: number, content: TooltipContent) {
		if (!plotContainer) return;
		const rect = plotContainer.getBoundingClientRect();
		tooltip = {
			content,
			x: Math.max(0, Math.min(clientX - rect.left + 14, rect.width - 8)),
			y: Math.max(0, Math.min(clientY - rect.top + 14, rect.height - 8))
		};
	}

	/** Keyboard path: anchor the tooltip to the node's own screen position. */
	function positionTooltipAtNode(id: string, content: TooltipContent) {
		const node = nodeById.get(id);
		if (!node || !plotContainer) return;
		const rect = plotContainer.getBoundingClientRect();
		tooltip = {
			content,
			x: Math.max(0, Math.min(node.x * transform.k + transform.x + 14, rect.width - 8)),
			y: Math.max(0, Math.min(node.y * transform.k + transform.y + 14, rect.height - 8))
		};
	}

	function clearHover() {
		hoveredId = null;
		tooltip = null;
	}

	// --- Screen-reader description -----------------------------------------
	const effectiveAriaDescription = $derived.by(() => {
		if (ariaDescription) return ariaDescription;
		const kept = selection.nodes;
		if (kept.length === 0) return 'Empty network graph.';
		const others = kept.filter((n) => n.kind !== 'center');
		const top = others
			.slice(0, 3)
			.map((n) => `${n.id} (${n.weight})`)
			.join(', ');
		return centerId
			? `Network centred on ${centerId} with ${others.length} connected nodes. Strongest connections: ${top}.`
			: `Network of ${others.length} nodes. Largest: ${top}.`;
	});

	// --- Legend -------------------------------------------------------------
	const legendEntries = $derived.by(() => {
		const nodeKinds = new Set(selection.nodes.map((n) => n.kind));
		const edgeKinds = new Set(selection.edges.map((e) => e.kind));
		const entries: Array<{
			key: string;
			shape: 'circle' | 'square' | 'solid' | 'dashed' | 'dotted';
			color: string;
			label: string;
		}> = [];

		if (nodeKinds.has('center') && centerId) {
			entries.push({ key: 'center', shape: 'circle', color: nodeColors.center, label: centerId });
		}
		if (nodeKinds.has('collaborator')) {
			entries.push({
				key: 'collaborator',
				shape: 'circle',
				color: nodeColors.collaborator,
				label: labelCopy.collaboratorNode
			});
		}
		if (nodeKinds.has('contributor')) {
			entries.push({
				key: 'contributor',
				shape: 'square',
				color: nodeColors.contributor,
				label: labelCopy.contributorNode
			});
		}
		if (nodeKinds.has('entity')) {
			entries.push({
				key: 'entity',
				shape: 'circle',
				color: nodeColors.entity,
				label: labelCopy.entityNode
			});
		}
		if (edgeKinds.has('direct')) {
			entries.push({
				key: 'direct',
				shape: 'solid',
				color: edgeColors.direct,
				label: labelCopy.directEdge
			});
		}
		if (edgeKinds.has('peer')) {
			entries.push({
				key: 'peer',
				shape: 'dashed',
				color: edgeColors.peer,
				label: labelCopy.peerEdge
			});
		}
		if (edgeKinds.has('contributor')) {
			entries.push({
				key: 'contributor-edge',
				shape: 'dotted',
				color: edgeColors.contributor,
				label: labelCopy.contributorEdge
			});
		}
		if (edgeKinds.has('cooccurrence')) {
			entries.push({
				key: 'cooccurrence',
				shape: 'solid',
				color: edgeColors.cooccurrence,
				label: labelCopy.cooccurrenceEdge
			});
		}
		return entries;
	});

	function handleDownload() {
		if (svgEl) void downloadSvgAsImage(svgEl, filename, resolvedColors.surface);
	}
</script>

<div class="network-container scroll-reveal-scale" bind:this={outerContainer}>
	<ChartToolbar
		chart={null}
		onDownload={handleDownload}
		showDecalToggle={false}
		showFullscreen={true}
		fullscreenTarget={outerContainer}
		{filename}
	/>
	<div class="zoom-controls">
		<button
			class="zoom-btn"
			onclick={() => zoomBy(1.25)}
			title="Zoom In"
			aria-label="Zoom in on network graph"
		>
			<Icon icon="lucide:zoom-in" width="20" height="20" />
		</button>
		<button
			class="zoom-btn"
			onclick={applyFit}
			title="Reset Zoom"
			aria-label="Reset network graph zoom"
		>
			<Icon icon="lucide:maximize-2" width="20" height="20" />
		</button>
		<button
			class="zoom-btn"
			onclick={() => zoomBy(0.8)}
			title="Zoom Out"
			aria-label="Zoom out on network graph"
		>
			<Icon icon="lucide:zoom-out" width="20" height="20" />
		</button>
	</div>

	<div
		class="plot"
		bind:this={plotContainer}
		bind:clientWidth={containerWidth}
		bind:clientHeight={containerHeight}
	>
		<!-- The pointer handler here only clears the hover state on exit. -->
		<svg
			bind:this={svgEl}
			class="network-svg"
			width="100%"
			height="100%"
			role="img"
			aria-label={effectiveAriaDescription}
			onpointerleave={clearHover}
		>
			<g transform="translate({transform.x},{transform.y}) scale({transform.k})">
				<!-- Edges first: they sit under the discs. -->
				<g class="edges" fill="none">
					{#each layout?.edges ?? [] as edge (edge.kind + edge.source + edge.target)}
						{@const a = nodeById.get(edge.source)}
						{@const b = nodeById.get(edge.target)}
						{#if a && b}
							{@const dim = edgeDimmed(edge)}
							<line
								x1={a.x}
								y1={a.y}
								x2={b.x}
								y2={b.y}
								stroke={edgeColors[edge.kind]}
								stroke-width={edgeWidth(edge)}
								stroke-dasharray={EDGE_DASH[edge.kind] ?? undefined}
								stroke-opacity={dim ? 0.05 : EDGE_OPACITY[edge.kind]}
								stroke-linecap="round"
							/>
							<!-- Invisible fat hit area: a 1px line is unhittable. Carries the
							     edge's aria-label so the connection is in the accessibility
							     tree, but stays out of the tab order — with up to ~150 edges,
							     tab stops per edge would drown the focusable nodes. -->
							<line
								class="edge-hit"
								role="img"
								aria-label={edgeAriaLabel(edge)}
								x1={a.x}
								y1={a.y}
								x2={b.x}
								y2={b.y}
								stroke="transparent"
								stroke-width={Math.max(10, edgeWidth(edge) + 8)}
								onpointerenter={(e) => positionTooltip(e.clientX, e.clientY, edgeTooltip(edge))}
								onpointermove={(e) => positionTooltip(e.clientX, e.clientY, edgeTooltip(edge))}
								onpointerleave={clearHover}
							/>
						{/if}
					{/each}
				</g>

				<!-- Nodes. Each is focusable, so the graph is keyboard-navigable —
				     the canvas series it replaces could only be read via the list below. -->
				<g class="nodes">
					{#each layout?.nodes ?? [] as node (node.id)}
						{@const dim = nodeDimmed(node.id)}
						<!-- A focusable graphic that reveals its description on focus is the
						     documented SVG pattern, and it is the only keyboard path into the
						     graph. role="button" would be a lie: nothing is activated. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<g
							class="node"
							class:node--dim={dim}
							tabindex="0"
							role="img"
							aria-label="{node.id}: {node.weight} {node.weight === 1
								? labelCopy.itemSingular
								: labelCopy.itemSingular + 's'}"
							onpointerenter={(e) => {
								hoveredId = node.id;
								positionTooltip(e.clientX, e.clientY, nodeTooltip(node));
							}}
							onpointermove={(e) => positionTooltip(e.clientX, e.clientY, nodeTooltip(node))}
							onpointerleave={clearHover}
							onfocus={() => {
								hoveredId = node.id;
								positionTooltipAtNode(node.id, nodeTooltip(node));
							}}
							onblur={clearHover}
						>
							{#if node.kind === 'contributor'}
								<!-- Contributor nodes are squares — a non-colour channel for
								     the role, and on-brand (the system's corners are square). -->
								<rect
									x={node.x - node.r}
									y={node.y - node.r}
									width={node.r * 2}
									height={node.r * 2}
									fill={nodeColors[node.kind]}
									stroke={resolvedColors.surface}
									stroke-width="1"
								/>
							{:else}
								<circle
									cx={node.x}
									cy={node.y}
									r={node.r}
									fill={nodeColors[node.kind]}
									stroke={node.kind === 'center' ? resolvedColors.surface : resolvedColors.surface}
									stroke-width={node.kind === 'center' ? 2 : 1}
								/>
							{/if}
							{#if node.label.show}
								<text
									x={node.label.x}
									y={node.label.y}
									text-anchor={node.label.anchor}
									fill={resolvedColors.text}
									font-family={resolvedColors.fontFamily}
									font-size={node.kind === 'center' ? fontSize + 2 : fontSize}
									font-weight={node.kind === 'center' ? 700 : 400}>{node.label.text}</text
								>
							{/if}
						</g>
					{/each}
				</g>
			</g>
		</svg>

		{#if tooltip}
			<div
				class="network-tooltip"
				role="tooltip"
				style:left="{tooltip.x}px"
				style:top="{tooltip.y}px"
			>
				<strong>{tooltip.content.title}</strong>
				{#if tooltip.content.meta}
					<em>{tooltip.content.meta}</em>
				{/if}
				{#if tooltip.content.lines.length > 0}
					<ul>
						{#each tooltip.content.lines as line (line)}
							<li>{line}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Always-visible legend strip: the meaning of colours and dashes must
	     survive on mobile, where an absolute overlay would be hidden. -->
	{#if legendEntries.length > 0}
		<div class="network-legend">
			{#each legendEntries as entry (entry.key)}
				<span class="legend-entry">
					{#if entry.shape === 'circle' || entry.shape === 'square'}
						<span
							class="legend-swatch"
							class:legend-swatch-round={entry.shape === 'circle'}
							style="background-color: {entry.color}"
						></span>
					{:else}
						<span class="legend-line legend-line-{entry.shape}" style="color: {entry.color}"></span>
					{/if}
					{entry.label}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Nodes are focusable, so this is a summary rather than the only path in.
	     It is rendered from `selection` (no d3 import), so it prerenders. -->
	<ul class="sr-only">
		{#each selection.nodes as node (node.id)}
			<li>
				{node.id}: {node.weight}
				{node.weight === 1 ? labelCopy.itemSingular : labelCopy.itemSingular + 's'}
			</li>
		{/each}
	</ul>
</div>

<style>
	.network-container {
		width: 100%;
		height: 100%;
		min-height: 350px;
		display: flex;
		flex-direction: column;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.network-container:fullscreen {
		height: 100vh;
		width: 100vw;
		background-color: var(--color-surface);
	}

	.plot {
		position: relative;
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
	}

	.network-svg {
		display: block;
		width: 100%;
		height: 100%;
		/* d3-zoom handles the pan gesture; stop the browser scrolling instead. */
		touch-action: none;
		cursor: grab;
	}

	.network-svg:active {
		cursor: grabbing;
	}

	.edge-hit {
		cursor: pointer;
	}

	.node {
		cursor: pointer;
	}

	/* Instant state change — the register is print, not app. */
	.node--dim {
		opacity: var(--opacity-15, 0.15);
	}

	.node:focus-visible {
		outline: none;
	}

	.node:focus-visible circle,
	.node:focus-visible rect {
		stroke: var(--color-accent);
		stroke-width: 3;
	}

	/* Flat archival tooltip: square corners, hairline border, no shadow. */
	.network-tooltip {
		position: absolute;
		z-index: var(--z-dropdown);
		max-width: 280px;
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		color: var(--color-text);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		line-height: var(--line-height-normal);
		pointer-events: none;
	}

	.network-tooltip strong {
		display: block;
		font-weight: var(--font-weight-semibold);
	}

	.network-tooltip em {
		display: block;
		margin-top: var(--space-3xs);
		color: var(--color-text-light);
		font-style: normal;
	}

	.network-tooltip ul {
		margin: var(--space-2xs) 0 0;
		padding: 0;
		list-style: none;
	}

	.network-tooltip li {
		margin-top: var(--space-3xs);
		padding-left: var(--space-3);
		text-indent: calc(-1 * var(--space-3));
		color: var(--color-text-soft);
	}

	.network-tooltip li::before {
		content: '· ';
	}

	/* Legend strip — mono data voice, hairline rule above, wraps on mobile. */
	.network-legend {
		flex: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		padding: var(--space-2) var(--space-1) 0;
		border-top: var(--border-width-thin) solid var(--color-border);
		margin-top: var(--space-2);
	}

	.legend-entry {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		color: var(--color-text-soft);
	}

	.legend-swatch {
		width: var(--space-3);
		height: var(--space-3);
		border-radius: 0;
	}

	.legend-swatch-round {
		border-radius: var(--border-radius-full);
	}

	.legend-line {
		width: var(--space-5);
		height: 0;
		border-bottom-width: var(--space-0-5);
		border-bottom-color: currentColor;
	}

	.legend-line-solid {
		border-bottom-style: solid;
	}

	.legend-line-dashed {
		border-bottom-style: dashed;
	}

	.legend-line-dotted {
		border-bottom-style: dotted;
	}

	.zoom-controls {
		position: absolute;
		top: var(--space-4);
		left: var(--space-4);
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.zoom-btn {
		width: var(--space-9);
		height: var(--space-9);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		color: var(--color-text-light);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.zoom-btn:hover {
		background-color: var(--color-accent);
		color: var(--color-text-inverted);
		border-color: var(--color-accent);
	}

	.zoom-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.network-container {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
			will-change: auto !important;
		}

		.zoom-btn {
			transition: none !important;
		}
	}

	@media (--md-down) {
		.zoom-controls {
			top: var(--space-2);
			left: var(--space-2);
			gap: var(--space-1);
		}
	}

	@media (--xs-down) {
		.network-container {
			min-height: 300px;
		}

		.zoom-btn {
			width: var(--space-8);
			height: var(--space-8);
		}
	}
</style>
