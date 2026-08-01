<!--
NetworkArcDiagram — a ranked ledger of collaborators with arcs for the
connections between them. For the egocentric networks (co-authors,
co-presenters).

Why not a node-link graph: these networks are egocentric, so *every* node is
joined to the centre by construction. Those spokes are guaranteed to exist and
therefore encode nothing — in the force layout they were the most visually
dominant thing on the plate, a starburst drawn on top of the edges that
actually carry information (who among the collaborators has worked with whom).

So the centre is dropped and its name moved to the caption, the collaborators
become a ranked ledger — the site's default idiom for any keyed record — and
the peer/contributor edges become arcs in the gutter beside it. What was
background texture is now the whole subject of the chart.
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import { downloadSvgAsImage } from '$lib/utils/chartActions';
	import ChartToolbar from './ChartToolbar.svelte';
	import NetworkTooltip from './NetworkTooltip.svelte';
	import type { TooltipContent } from './NetworkTooltip.svelte';
	import { selectGraph } from '$lib/utils/networkAggregation';
	import type { NetworkEdge, NetworkEdgeKind, NetworkNode } from '$lib/utils/networkAggregation';
	import { orderNodes, type NodeOrder } from '$lib/utils/seriation';
	import '$styles/components/network-viz.css';

	let {
		nodes = [] as NetworkNode[],
		edges = [] as NetworkEdge[],
		centerId = undefined,
		maxNodes = 20,
		visibleEdgeKinds = undefined,
		highlightQuery = '',
		order = 'weight' as NodeOrder,
		labels = {} as {
			itemSingular?: string;
			itemPlural?: string;
			collaboratorNode?: string;
			contributorNode?: string;
			peerEdge?: string;
			peerShared?: string;
			contributorEdge?: string;
			contributorShared?: string;
		},
		filename = 'collaboration-arcs',
		ariaDescription = undefined
	}: {
		nodes?: NetworkNode[];
		edges?: NetworkEdge[];
		centerId?: string;
		maxNodes?: number;
		visibleEdgeKinds?: NetworkEdgeKind[];
		highlightQuery?: string;
		order?: NodeOrder;
		labels?: {
			itemSingular?: string;
			itemPlural?: string;
			collaboratorNode?: string;
			contributorNode?: string;
			peerEdge?: string;
			peerShared?: string;
			contributorEdge?: string;
			contributorShared?: string;
		};
		filename?: string;
		ariaDescription?: string;
	} = $props();

	const copy = $derived({
		itemSingular: labels.itemSingular ?? 'publication',
		itemPlural: labels.itemPlural ?? 'Publications',
		collaboratorNode: labels.collaboratorNode ?? 'Collaborators',
		contributorNode: labels.contributorNode ?? 'Contributors',
		peerEdge: labels.peerEdge ?? 'Co-author connection',
		peerShared: labels.peerShared ?? 'Shared publications',
		contributorEdge: labels.contributorEdge ?? 'Contributor connection',
		contributorShared: labels.contributorShared ?? 'Shared edited volumes/special issues'
	});

	let outerContainer = $state<HTMLDivElement>(undefined!);
	let plotArea = $state<HTMLDivElement>(undefined!);
	let svgEl = $state<SVGSVGElement>(undefined!);
	let areaWidth = $state(900);

	const isMobile = $derived((innerWidth.current ?? 1024) < 768);
	const colors = $derived(getResolvedChartColors());

	// --- Model -------------------------------------------------------------
	const selection = $derived(selectGraph(nodes, edges, { centerId, maxNodes, visibleEdgeKinds }));

	/** The centre is dropped: it links to everyone, so it is not a data point. */
	const rows = $derived(
		orderNodes(
			selection.nodes.filter((n) => n.kind !== 'center'),
			selection.edges,
			order
		)
	);
	const indexById = $derived(new Map(rows.map((r, i) => [r.id, i])));

	/** Only the edges that say something: centre spokes are structural. */
	const arcs = $derived(
		selection.edges.filter(
			(e) => e.kind !== 'direct' && indexById.has(e.source) && indexById.has(e.target)
		)
	);

	const maxRowWeight = $derived(rows.reduce((m, r) => Math.max(m, r.weight), 1));
	const maxArcWeight = $derived(arcs.reduce((m, a) => Math.max(m, a.weight), 1));

	// --- Geometry ----------------------------------------------------------
	const fontSize = $derived(isMobile ? 10 : 12);
	/**
	 * A fixed row height, not one divided out of the available space: this is a
	 * ledger, and ledger rows are a constant. When there are more rows than fit,
	 * the plate scrolls rather than compressing them past readability.
	 */
	const rowHeight = $derived(isMobile ? 22 : 24);
	/** Clears the chart toolbar, which floats over the top-right of the plate. */
	const padTop = 36;
	const padBottom = 12;
	const svgHeight = $derived(rows.length * rowHeight + padTop + padBottom);
	/** The arc gutter; arcs bulge left out of the axis. */
	const gutter = $derived(Math.min(180, Math.max(70, areaWidth * 0.2)));
	const axisX = $derived(gutter + 8);

	const rowY = (i: number) => padTop + i * rowHeight + rowHeight / 2;
	const dotRadius = (weight: number) =>
		3 + 4 * Math.sqrt(Math.max(0, weight) / Math.max(1, maxRowWeight));

	/**
	 * Elliptical arc from row i to row j, bulging into the gutter. Using an
	 * ellipse rather than a semicircle keeps distant pairs inside the gutter
	 * instead of swinging out past the plate edge.
	 */
	function arcPath(i: number, j: number): string {
		const y1 = rowY(Math.min(i, j));
		const y2 = rowY(Math.max(i, j));
		const ry = (y2 - y1) / 2;
		const rx = Math.min(gutter, ry);
		return `M ${axisX},${y1} A ${rx},${ry} 0 0 0 ${axisX},${y2}`;
	}

	function arcWidth(weight: number): number {
		return 0.8 + 2.2 * Math.sqrt(weight / Math.max(1, maxArcWeight));
	}

	const EDGE_DASH: Record<NetworkEdgeKind, string | undefined> = {
		direct: undefined,
		peer: undefined,
		contributor: '2 3',
		cooccurrence: undefined
	};
	const edgeColor = $derived({
		direct: colors.primary,
		peer: colors.accent,
		contributor: colors.ochre,
		cooccurrence: colors.primary
	});

	// --- Highlight ---------------------------------------------------------
	function fold(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '');
	}
	const foldedQuery = $derived(fold(highlightQuery.trim()));
	const matchedIds = $derived(
		foldedQuery
			? new Set(rows.filter((r) => fold(r.id).includes(foldedQuery)).map((r) => r.id))
			: undefined
	);

	let hoveredId = $state<string | null>(null);

	/** Rows joined to the hovered one — the adjacency reading. */
	const adjacentIds = $derived.by(() => {
		if (!hoveredId) return undefined;
		const ids = [hoveredId];
		for (const arc of arcs) {
			if (arc.source === hoveredId) ids.push(arc.target);
			else if (arc.target === hoveredId) ids.push(arc.source);
		}
		return new Set(ids);
	});

	function rowDimmed(id: string): boolean {
		if (adjacentIds) return !adjacentIds.has(id);
		if (matchedIds) return !matchedIds.has(id);
		return false;
	}

	function arcDimmed(edge: NetworkEdge): boolean {
		if (adjacentIds) return !(adjacentIds.has(edge.source) && adjacentIds.has(edge.target));
		if (matchedIds) return !(matchedIds.has(edge.source) || matchedIds.has(edge.target));
		return false;
	}

	// --- Tooltip -----------------------------------------------------------
	let tooltip = $state<{ content: TooltipContent; x: number; y: number } | null>(null);

	function summarise(items: string[], limit = 6): string[] {
		return items.length <= limit
			? items
			: [...items.slice(0, limit), `…and ${items.length - limit} more`];
	}

	function arcCopy(kind: NetworkEdgeKind): { heading: string; shared: string } {
		return kind === 'contributor'
			? { heading: copy.contributorEdge, shared: copy.contributorShared }
			: { heading: copy.peerEdge, shared: copy.peerShared };
	}

	function place(event: PointerEvent | FocusEvent, content: TooltipContent) {
		if (!plotArea) return;
		const rect = plotArea.getBoundingClientRect();
		const point =
			'clientX' in event
				? { x: event.clientX, y: event.clientY }
				: (() => {
						const box = (event.target as Element).getBoundingClientRect();
						return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
					})();
		tooltip = {
			content,
			x: Math.max(0, Math.min(point.x - rect.left + 14, rect.width - 8)),
			y: Math.max(0, Math.min(point.y - rect.top + 14, rect.height - 8))
		};
	}

	function showRow(event: PointerEvent | FocusEvent, node: NetworkNode) {
		hoveredId = node.id;
		place(event, {
			title: node.id,
			meta: `${copy.itemPlural}: ${node.weight}`,
			lines: summarise(node.items)
		});
	}

	function showArc(event: PointerEvent | FocusEvent, edge: NetworkEdge) {
		const { heading, shared } = arcCopy(edge.kind);
		place(event, {
			title: heading,
			meta: `${edge.source} ↔ ${edge.target} — ${shared}: ${edge.weight}`,
			lines: summarise(edge.items)
		});
	}

	function clearHover() {
		hoveredId = null;
		tooltip = null;
	}

	// --- Accessibility -----------------------------------------------------
	const effectiveAriaDescription = $derived.by(() => {
		if (ariaDescription) return ariaDescription;
		if (rows.length === 0) return 'Empty collaboration diagram.';
		const top = rows
			.slice(0, 3)
			.map((r) => `${r.id} (${r.weight})`)
			.join(', ');
		return (
			`Ranked list of ${rows.length} ${copy.collaboratorNode.toLowerCase()}` +
			(centerId ? ` of ${centerId}` : '') +
			`, with ${arcs.length} connections between them. Strongest: ${top}.`
		);
	});

	const legendKinds = $derived(new Set(arcs.map((a) => a.kind)));
	const hasContributors = $derived(rows.some((r) => r.kind === 'contributor'));

	function handleDownload() {
		if (svgEl) void downloadSvgAsImage(svgEl, filename, colors.surface);
	}
</script>

<div class="viz-plate" bind:this={outerContainer}>
	<ChartToolbar
		chart={null}
		onDownload={handleDownload}
		showDecalToggle={false}
		showFullscreen={true}
		fullscreenTarget={outerContainer}
		{filename}
	/>

	<div class="viz-plate-area" bind:this={plotArea} bind:clientWidth={areaWidth}>
		<!-- The pointer handler only clears the hover state on exit. -->
		<svg
			bind:this={svgEl}
			class="arc-svg"
			width="100%"
			height={svgHeight}
			viewBox="0 0 {areaWidth} {svgHeight}"
			preserveAspectRatio="xMinYMin meet"
			role="img"
			aria-label={effectiveAriaDescription}
			onpointerleave={clearHover}
		>
			<!-- Row hairlines: the ledger's rules, drawn before anything else. -->
			<g class="rules" stroke={colors.border} stroke-width="0.5" opacity="0.5">
				{#each rows as row, i (row.id)}
					<line
						x1={axisX}
						y1={padTop + i * rowHeight}
						x2={areaWidth - 8}
						y2={padTop + i * rowHeight}
					/>
				{/each}
			</g>

			<!-- Arcs, under the axis marks. -->
			<g class="arcs" fill="none">
				{#each arcs as arc (arc.kind + arc.source + arc.target)}
					{@const i = indexById.get(arc.source)!}
					{@const j = indexById.get(arc.target)!}
					{@const dim = arcDimmed(arc)}
					<path
						d={arcPath(i, j)}
						stroke={edgeColor[arc.kind]}
						stroke-width={arcWidth(arc.weight)}
						stroke-dasharray={EDGE_DASH[arc.kind]}
						stroke-opacity={dim ? 0.06 : arc.kind === 'contributor' ? 0.42 : 0.6}
						stroke-linecap="round"
					/>
					<!-- Fat transparent hit path: a 1px arc is unhittable. -->
					<path
						class="arc-hit"
						d={arcPath(i, j)}
						stroke="transparent"
						stroke-width={Math.max(10, arcWidth(arc.weight) + 8)}
						role="img"
						aria-label="{arcCopy(arc.kind).heading}: {arc.source} and {arc.target} — {arcCopy(
							arc.kind
						).shared}: {arc.weight}"
						onpointerenter={(e) => showArc(e, arc)}
						onpointermove={(e) => showArc(e, arc)}
						onpointerleave={clearHover}
					/>
				{/each}
			</g>

			<!-- The ledger: axis dot, rank, name, count. -->
			<g class="rows">
				{#each rows as row, i (row.id)}
					{@const y = rowY(i)}
					{@const dim = rowDimmed(row.id)}
					<!-- A focusable graphic that reveals its description on focus is the
					     documented SVG pattern, and the only keyboard path into the chart. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<g
						class="arc-row"
						class:arc-row--dim={dim}
						tabindex="0"
						role="img"
						aria-label="{i + 1}. {row.id}: {row.weight} {row.weight === 1
							? copy.itemSingular
							: copy.itemPlural.toLowerCase()}"
						onpointerenter={(e) => showRow(e, row)}
						onpointermove={(e) => showRow(e, row)}
						onpointerleave={clearHover}
						onfocus={(e) => showRow(e, row)}
						onblur={clearHover}
					>
						<rect
							x={axisX}
							y={y - rowHeight / 2}
							width={areaWidth - axisX}
							height={rowHeight}
							fill="transparent"
						/>
						{#if row.kind === 'contributor'}
							<!-- Contributor-only people are squares: a non-colour channel for
							     the role, and on-brand (the system's corners are square). -->
							<rect
								x={axisX - dotRadius(row.weight)}
								y={y - dotRadius(row.weight)}
								width={dotRadius(row.weight) * 2}
								height={dotRadius(row.weight) * 2}
								fill={colors.ochre}
							/>
						{:else}
							<circle cx={axisX} cy={y} r={dotRadius(row.weight)} fill={colors.accent} />
						{/if}
						<text
							class="arc-rank"
							x={axisX + 14}
							{y}
							dominant-baseline="middle"
							fill={colors.textLight}
							font-family={colors.fontFamily}
							font-size={fontSize - 1}>{String(i + 1).padStart(2, '0')}</text
						>
						<text
							class="arc-name"
							x={axisX + 42}
							{y}
							dominant-baseline="middle"
							fill={colors.text}
							font-family={colors.fontFamily}
							font-size={fontSize}>{row.id}</text
						>
						<text
							class="arc-count"
							x={areaWidth - 12}
							{y}
							text-anchor="end"
							dominant-baseline="middle"
							fill={colors.textLight}
							font-family={colors.fontFamily}
							font-size={fontSize}>{row.weight}</text
						>
					</g>
				{/each}
			</g>
		</svg>

		{#if tooltip}
			<NetworkTooltip content={tooltip.content} x={tooltip.x} y={tooltip.y} />
		{/if}
	</div>

	<div class="viz-legend">
		<span class="viz-legend-entry">
			<span
				class="viz-legend-swatch viz-legend-swatch--round"
				style="background-color: {colors.accent}"
			></span>
			{copy.collaboratorNode}
		</span>
		{#if hasContributors}
			<span class="viz-legend-entry">
				<span class="viz-legend-swatch" style="background-color: {colors.ochre}"></span>
				{copy.contributorNode}
			</span>
		{/if}
		{#if legendKinds.has('peer')}
			<span class="viz-legend-entry">
				<span class="viz-legend-line viz-legend-line--solid" style="color: {colors.accent}"></span>
				{copy.peerEdge}
			</span>
		{/if}
		{#if legendKinds.has('contributor')}
			<span class="viz-legend-entry">
				<span class="viz-legend-line viz-legend-line--dotted" style="color: {colors.ochre}"></span>
				{copy.contributorEdge}
			</span>
		{/if}
		{#if centerId}
			<span class="viz-legend-entry">Centre ({centerId}) omitted — joined to all</span>
		{/if}
	</div>

	<ul class="sr-only">
		{#each rows as row (row.id)}
			<li>
				{row.id}: {row.weight}
				{row.weight === 1 ? copy.itemSingular : copy.itemPlural.toLowerCase()}
			</li>
		{/each}
	</ul>
</div>

<style>
	.arc-svg {
		display: block;
	}

	.arc-row {
		cursor: pointer;
	}

	/* Instant state change — the register is print, not app. */
	.arc-row--dim {
		opacity: var(--opacity-20, 0.2);
	}

	.arc-row:focus-visible {
		outline: none;
	}

	.arc-row:focus-visible .arc-name {
		fill: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	.arc-row:hover .arc-name {
		fill: var(--color-accent);
	}

	.arc-name,
	.arc-rank,
	.arc-count {
		pointer-events: none;
	}

	.arc-count {
		font-variant-numeric: tabular-nums;
	}

	.arc-hit {
		cursor: pointer;
	}
</style>
