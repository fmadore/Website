<!--
ECharts Network Graph - renders NetworkData from $lib/utils/networkAggregation:
egocentric collaboration networks (with a centre node) and flat co-occurrence
networks (keywords, institutions). Colour encodes the node/edge kind, size
encodes the weight; the two channels never double-encode the same value.
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import Icon from '@iconify/svelte';
	import {
		getResolvedChartColors,
		getEChartsTooltipStyle,
		getBoundedTooltipPosition,
		getChartMotion,
		prefersReducedMotion
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';
	import type { DefaultLabelFormatterCallbackParams } from 'echarts';
	import type { NetworkNode, NetworkEdge, NetworkEdgeKind } from '$lib/utils/networkAggregation';

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

	// Container references
	let chartContainer: HTMLDivElement;
	let outerContainer = $state<HTMLDivElement>(undefined!);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive colour resolution — getResolvedChartColors() reads getTheme()
	// internally, so this $derived re-runs (and the chart recolours) on toggle.
	const resolvedColors = $derived(getResolvedChartColors());

	/* Colour encodes the node's role — size already encodes the weight, so the
	 * old count-keyed colour ramp double-encoded it. Ink = centre, pine =
	 * collaborators (the living connections), ochre = contributor-only,
	 * slate-blue/olive = entities (keywords, institutions). */
	const nodeColors = $derived({
		center: resolvedColors.primary,
		collaborator: resolvedColors.accent,
		contributor: resolvedColors.ochre,
		entity: entityColor === 'sage' ? resolvedColors.sage : resolvedColors.slateBlue
	});

	// Diacritic-insensitive matching ("Frédérick" matches "frederick").
	function fold(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '');
	}

	const foldedQuery = $derived(fold(highlightQuery.trim()));

	// Top-N selection + edge filtering, shared by the chart, the sr-only list,
	// the legend, and the search effect.
	const graphData = $derived.by(() => {
		const centerNode = centerId ? nodes.find((n) => n.id === centerId) : undefined;
		const others = nodes
			.filter((n) => n.id !== centerId)
			.sort((a, b) => b.weight - a.weight)
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
		const maxWeight = others.reduce((m, n) => Math.max(m, n.weight), 1);
		const matchedIds = foldedQuery
			? new Set(kept.filter((n) => fold(n.id).includes(foldedQuery)).map((n) => n.id))
			: undefined;
		return { kept, keptEdges, maxWeight, matchedIds };
	});

	// Data-derived screen-reader description (overridable via prop).
	const effectiveAriaDescription = $derived.by(() => {
		if (ariaDescription) return ariaDescription;
		const { kept } = graphData;
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

	function clampWidth(min: number, max: number, value: number): number {
		return Math.max(min, Math.min(max, value));
	}

	// Process data for the ECharts graph series
	const networkData = $derived.by(() => {
		const { kept, keptEdges, maxWeight, matchedIds } = graphData;

		const chartNodes = kept.map((node) => {
			const isCenter = node.kind === 'center';
			const dimmed = matchedIds !== undefined && !matchedIds.has(node.id);
			const symbolSize = isCenter
				? isMobile
					? 50
					: 70
				: clampWidth(
						isMobile ? 20 : 25,
						isMobile ? 40 : 50,
						(node.weight / maxWeight) * (isMobile ? 40 : 50)
					);
			return {
				id: node.id,
				name: node.id,
				symbolSize,
				// Contributor nodes are squares — a non-colour channel for the
				// role, and on-brand (the system's corners are square).
				symbol: node.kind === 'contributor' ? 'rect' : 'circle',
				itemStyle: {
					color: nodeColors[node.kind],
					opacity: dimmed ? 0.15 : 1,
					...(isCenter ? { borderColor: resolvedColors.primary, borderWidth: 3 } : {})
				},
				label: {
					show: !dimmed && (isCenter || !isMobile || node.weight > 2),
					fontSize: isCenter ? (isMobile ? 13 : 15) : isMobile ? 10 : 12,
					...(isCenter ? { fontWeight: 'bold' } : {}),
					color: resolvedColors.text,
					fontFamily: resolvedColors.fontFamily,
					position: 'right' as const,
					distance: 10,
					formatter: (params: DefaultLabelFormatterCallbackParams) => {
						const maxLength = isMobile ? 15 : 20;
						return params.name.length > maxLength
							? params.name.substring(0, maxLength) + '...'
							: params.name;
					}
				},
				// Payload for the tooltip formatter
				nodeData: node,
				fixed: false
			};
		});

		const edgeStyle = (edge: NetworkEdge) => {
			switch (edge.kind) {
				case 'direct':
					return {
						width: clampWidth(1.5, 6, edge.weight * 1.5),
						color: resolvedColors.primary,
						opacity: 0.5,
						type: 'solid' as const
					};
				case 'peer':
					return {
						width: clampWidth(1, 4, edge.weight * 1.2),
						color: resolvedColors.accent,
						opacity: 0.3,
						type: 'dashed' as const
					};
				case 'contributor':
					return {
						width: clampWidth(1, 3, edge.weight),
						color: resolvedColors.ochre,
						opacity: 0.4,
						type: [2, 3] as [number, number] // dotted
					};
				case 'cooccurrence':
					return {
						width: clampWidth(1, 5, edge.weight),
						color: resolvedColors.primary,
						opacity: 0.25,
						type: 'solid' as const
					};
			}
		};

		const chartLinks = keptEdges.map((edge) => {
			const base = edgeStyle(edge);
			const dimmed =
				matchedIds !== undefined && !matchedIds.has(edge.source) && !matchedIds.has(edge.target);
			return {
				source: edge.source,
				target: edge.target,
				lineStyle: { ...base, opacity: dimmed ? 0.06 : base.opacity },
				label: { show: false },
				emphasis: {
					lineStyle: {
						width: clampWidth(1.5, 8, edge.weight * 1.5),
						opacity: 0.8
					}
				},
				// Payload for the tooltip formatter
				edgeData: edge
			};
		});

		return { nodes: chartNodes, links: chartLinks };
	});

	// Legend entries — only the kinds actually present in the filtered graph.
	const legendEntries = $derived.by(() => {
		const nodeKinds = new Set(graphData.kept.map((n) => n.kind));
		const edgeKinds = new Set(graphData.keptEdges.map((e) => e.kind));
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
				color: resolvedColors.primary,
				label: labelCopy.directEdge
			});
		}
		if (edgeKinds.has('peer')) {
			entries.push({
				key: 'peer',
				shape: 'dashed',
				color: resolvedColors.accent,
				label: labelCopy.peerEdge
			});
		}
		if (edgeKinds.has('contributor')) {
			entries.push({
				key: 'contributor-edge',
				shape: 'dotted',
				color: resolvedColors.ochre,
				label: labelCopy.contributorEdge
			});
		}
		if (edgeKinds.has('cooccurrence')) {
			entries.push({
				key: 'cooccurrence',
				shape: 'solid',
				color: resolvedColors.primary,
				label: labelCopy.cooccurrenceEdge
			});
		}
		return entries;
	});

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

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false
		},
		tooltip: {
			trigger: 'item',
			triggerOn: 'mousemove',
			...getEChartsTooltipStyle(resolvedColors),
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 12,
				fontFamily: resolvedColors.fontFamily
			},
			extraCssText:
				'box-shadow: none; max-width: 280px; word-wrap: break-word; white-space: normal; line-height: 1.4;',
			confine: true,
			position: getBoundedTooltipPosition(isMobile),
			formatter: function (
				params: DefaultLabelFormatterCallbackParams | DefaultLabelFormatterCallbackParams[]
			) {
				if (Array.isArray(params)) return '';
				const p = params as DefaultLabelFormatterCallbackParams & {
					dataType?: string;
					data: Record<string, unknown>;
				};
				if (p.dataType === 'node' && p.data['nodeData']) {
					const node = p.data['nodeData'] as NetworkNode;
					if (node.kind === 'center') {
						return `<strong>${node.id}</strong><br/>Centre of the network<br/>${labelCopy.itemPlural} with collaborators: ${node.weight}`;
					}
					const itemList = node.items.map((item) => `• ${item}`).join('<br/>');
					return `<strong>${node.id}</strong><br/>
						<em>${labelCopy.itemPlural}: ${node.weight}</em><br/>
						${itemList}`;
				}
				if (p.dataType === 'edge' && p.data['edgeData']) {
					const edge = p.data['edgeData'] as NetworkEdge;
					if (edge.kind === 'direct') {
						return `${edge.weight} ${edge.weight > 1 ? labelCopy.itemPlural.toLowerCase() : labelCopy.itemSingular} with ${edge.source}`;
					}
					const { heading, shared } = edgeHeading(edge.kind);
					const itemList = edge.items.map((item) => `• ${item}`).join('<br/>');
					return `<strong>${heading}</strong><br/>
						${edge.source} ↔ ${edge.target}<br/>
						${shared}: ${edge.weight}<br/>
						${itemList}`;
				}
				return (p.data['name'] as string) ?? '';
			}
		},
		series: [
			{
				name: 'Network',
				type: 'graph',
				layout: 'force',
				data: networkData.nodes,
				links: networkData.links,
				roam: true, // Pan AND zoom the whole graph freely
				scaleLimit: {
					min: 0.5,
					max: 3
				},
				zoom: 1,
				focusNodeAdjacency: true,
				// Nodes stay draggable so you can pull the graph around; the shake came
				// from the animated layout below, not from dragging.
				draggable: true,
				left: isMobile ? '5%' : '10%',
				right: isMobile ? '5%' : '20%',
				top: '10%',
				bottom: '10%',
				force: {
					repulsion: isMobile ? 300 : 500,
					gravity: 0.08,
					edgeLength: isMobile ? 120 : 180,
					// Live force layout: the graph stays organic and you can drag
					// nodes and watch neighbours settle. Higher friction makes it
					// settle instead of oscillating; reduced-motion users get a
					// static, pre-settled layout.
					layoutAnimation: !prefersReducedMotion(),
					friction: 0.8
				},
				emphasis: {
					focus: 'adjacency',
					lineStyle: {
						width: 4,
						opacity: 0.9
					},
					label: {
						show: true
					}
				},
				lineStyle: {
					color: 'source',
					curveness: 0.1
				},
				label: {
					position: 'right',
					formatter: '{b}'
				},
				avoidLabelOverlap: true
			}
		],
		aria: getAriaConfig(false, effectiveAriaDescription),
		backgroundColor: 'transparent',
		...getChartMotion('settle')
	});

	// Use the ECharts hook for lifecycle management
	// Do NOT destructure `chart` — the getter must be called each time to get the current instance
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => nodes.length > 0
	});

	// When the search narrows to exactly one node, surface its tooltip so the
	// match is visible without hovering (keyboard/mobile path).
	$effect(() => {
		const matchedIds = graphData.matchedIds;
		const dataIndex =
			matchedIds?.size === 1 ? graphData.kept.findIndex((n) => matchedIds.has(n.id)) : -1;
		const frame = requestAnimationFrame(() => {
			const c = echartsInstance.chart;
			if (!c || c.isDisposed()) return;
			if (dataIndex >= 0) {
				c.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex });
			} else {
				c.dispatchAction({ type: 'hideTip' });
			}
		});
		return () => cancelAnimationFrame(frame);
	});

	// Zoom functions
	function zoomIn() {
		const c = echartsInstance.chart;
		if (c && !c.isDisposed()) {
			c.dispatchAction({
				type: 'graphRoam',
				seriesIndex: 0,
				zoom: 1.2,
				originX: c.getWidth() / 2,
				originY: c.getHeight() / 2
			});
		}
	}

	function zoomOut() {
		const c = echartsInstance.chart;
		if (c && !c.isDisposed()) {
			c.dispatchAction({
				type: 'graphRoam',
				seriesIndex: 0,
				zoom: 0.8,
				originX: c.getWidth() / 2,
				originY: c.getHeight() / 2
			});
		}
	}

	function resetZoom() {
		const c = echartsInstance.chart;
		if (c && !c.isDisposed()) {
			c.dispatchAction({
				type: 'restore'
			});
		}
	}
</script>

<div class="echarts-container scroll-reveal-scale" bind:this={outerContainer}>
	<ChartToolbar
		chart={echartsInstance.chart}
		showDecalToggle={false}
		showFullscreen={true}
		fullscreenTarget={outerContainer}
		{filename}
	/>
	<div class="zoom-controls">
		<button class="zoom-btn" onclick={zoomIn} title="Zoom In" aria-label="Zoom in on network graph">
			<Icon icon="lucide:zoom-in" width="20" height="20" />
		</button>
		<button
			class="zoom-btn"
			onclick={resetZoom}
			title="Reset Zoom"
			aria-label="Reset network graph zoom"
		>
			<Icon icon="lucide:maximize-2" width="20" height="20" />
		</button>
		<button
			class="zoom-btn"
			onclick={zoomOut}
			title="Zoom Out"
			aria-label="Zoom out on network graph"
		>
			<Icon icon="lucide:zoom-out" width="20" height="20" />
		</button>
	</div>

	<div bind:this={chartContainer} class="chart"></div>

	<!-- Always-visible legend strip: the meaning of colours and dashes must
	     survive on mobile, where the old absolute overlay was hidden. -->
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

	<!-- Canvas graphs aren't keyboard-navigable; this list plus the search box
	     is the accessible path to the same data. -->
	<ul class="sr-only">
		{#each graphData.kept as node (node.id)}
			<li>
				{node.id}: {node.weight}
				{node.weight === 1 ? labelCopy.itemSingular : labelCopy.itemSingular + 's'}
			</li>
		{/each}
	</ul>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		min-height: 350px;
		display: flex;
		flex-direction: column;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.echarts-container:fullscreen {
		height: 100vh;
		width: 100vw;
		background-color: var(--color-surface);
	}

	.chart {
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
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

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.echarts-container {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
			will-change: auto !important;
		}

		.zoom-btn {
			transition: none !important;
		}

		.zoom-btn:hover {
			transform: none !important;
		}
	}

	/* Responsive adjustments */
	@media (--md-down) {
		.zoom-controls {
			top: var(--space-2);
			left: var(--space-2);
			gap: var(--space-1);
		}

		.zoom-btn {
			width: var(--space-9);
			height: var(--space-9);
		}
	}

	@media (--xs-down) {
		.echarts-container {
			min-height: 300px;
		}

		.zoom-btn {
			width: var(--space-8);
			height: var(--space-8);
		}
	}
</style>
