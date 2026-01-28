<!--
ECharts Network Graph - A network visualization for author collaborations
-->
<script lang="ts">
	import type * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import Icon from '@iconify/svelte';

	// Props
	type CollaborationData = {
		author: string;
		collaborationCount: number;
		publications: string[];
		isContributor?: boolean;
	};

	type CoAuthorConnection = {
		source: string;
		target: string;
		publicationCount: number;
		publications: string[];
	};

	let {
		data = [] as CollaborationData[],
		coAuthorConnections = [] as CoAuthorConnection[],
		contributorConnections = [] as CoAuthorConnection[],
		centerAuthor = 'Frédérick Madore',
		maxConnections = 20 // Limit to top collaborators for readability
	}: {
		data?: CollaborationData[];
		coAuthorConnections?: CoAuthorConnection[];
		contributorConnections?: CoAuthorConnection[];
		centerAuthor?: string;
		maxConnections?: number;
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = $state(null);
	let echartsLib: typeof echarts | null = null;
	let isChartReady = $state(false);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Zoom functions
	function zoomIn() {
		if (chart && !chart.isDisposed()) {
			chart.dispatchAction({
				type: 'graphRoam',
				zoom: 1.2,
				originX: chart.getWidth() / 2,
				originY: chart.getHeight() / 2
			});
		}
	}

	function zoomOut() {
		if (chart && !chart.isDisposed()) {
			chart.dispatchAction({
				type: 'graphRoam',
				zoom: 0.8,
				originX: chart.getWidth() / 2,
				originY: chart.getHeight() / 2
			});
		}
	}

	function resetZoom() {
		if (chart && !chart.isDisposed()) {
			chart.dispatchAction({
				type: 'restore'
			});
		}
	}

	// Utility functions for CSS variable resolution
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '';
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value;
	}

	// Reactive color resolution
	// Fallbacks match design system v2.0 values from variables.css (warm earth tones)
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary') || '#9a4419',
		text: getCSSVariableValue('--color-text') || '#2d2820',
		textLight: getCSSVariableValue('--color-text-light') || '#7a7267',
		border: getCSSVariableValue('--color-border') || '#e8e4df',
		surface: getCSSVariableValue('--color-surface') || '#faf9f7',

		accent: getCSSVariableValue('--color-accent') || '#c4a35a',
		highlight: getCSSVariableValue('--color-highlight') || '#f59e0b',
		success: getCSSVariableValue('--color-success') || '#10b981',
		fontFamily: getCSSVariableValue('--font-family-sans') || 'system-ui, sans-serif',
		currentTheme: getTheme()
	});

	// Create a color palette for different collaboration counts
	const collaborationColors = $derived.by(() => {
		const baseColors = [
			resolvedColors.highlight, // Orange for 1 collaboration
			resolvedColors.accent, // Purple for 2 collaborations
			resolvedColors.success, // Green for 3 collaborations
			resolvedColors.primary // Blue for 4 collaborations
		];

		const extendedColors = [...baseColors];
		for (let i = baseColors.length; i < 10; i++) {
			const baseIndex = i % baseColors.length;
			extendedColors.push(baseColors[baseIndex]);
		}

		return extendedColors;
	});

	// Process data for network graph
	const networkData = $derived.by(() => {
		// Limit to top collaborators for better visualization
		const topCollaborators = data
			.sort((a, b) => b.collaborationCount - a.collaborationCount)
			.slice(0, maxConnections);

		// Get list of top collaborator names for filtering connections
		const topCollaboratorNames = new Set(topCollaborators.map((c) => c.author));

		// Create nodes
		const nodes = [
			// Center node (main author)
			{
				id: centerAuthor,
				name: centerAuthor,
				symbolSize: isMobile ? 50 : 70,
				itemStyle: {
					color: resolvedColors.primary,
					borderColor: resolvedColors.primary,
					borderWidth: 3
				},
				label: {
					show: true,
					fontSize: isMobile ? 13 : 15,
					fontWeight: 'bold',
					color: resolvedColors.text,
					fontFamily: resolvedColors.fontFamily
				},
				category: 0,
				fixed: false
			},
			// Collaborator nodes
			...topCollaborators.map((collab) => ({
				id: collab.author,
				name: collab.author,
				symbolSize: Math.max(
					isMobile ? 20 : 25,
					Math.min(
						isMobile ? 40 : 50,
						(collab.collaborationCount /
							Math.max(...topCollaborators.map((c) => c.collaborationCount))) *
							(isMobile ? 40 : 50)
					)
				),
				itemStyle: {
					color:
						collaborationColors[
							Math.min(collab.collaborationCount - 1, collaborationColors.length - 1)
						]
				},
				label: {
					show: !isMobile || collab.collaborationCount > 2,
					fontSize: isMobile ? 10 : 12,
					color: resolvedColors.text,
					fontFamily: resolvedColors.fontFamily,
					position: 'right',
					distance: 10,
					formatter: function (params: any) {
						const maxLength = isMobile ? 15 : 20;
						return params.name.length > maxLength
							? params.name.substring(0, maxLength) + '...'
							: params.name;
					}
				},
				category: 1,
				fixed: false
			}))
		];

		// Create links - connections to center author
		const centerLinks = topCollaborators.map((collab) => ({
			source: centerAuthor,
			target: collab.author,
			lineStyle: {
				width: Math.max(1.5, Math.min(6, collab.collaborationCount * 1.5)),
				color: resolvedColors.primary,
				opacity: 0.5,
				type: 'solid' as const
			},
			label: {
				show: false
			},
			emphasis: {
				lineStyle: {
					width: Math.max(2, Math.min(8, collab.collaborationCount * 2)),
					opacity: 0.8
				}
			}
		}));

		// Create links between co-authors (only for those in top collaborators)
		const coAuthorLinks = coAuthorConnections
			.filter(
				(conn) => topCollaboratorNames.has(conn.source) && topCollaboratorNames.has(conn.target)
			)
			.map((conn) => ({
				source: conn.source,
				target: conn.target,
				lineStyle: {
					width: Math.max(1, Math.min(4, conn.publicationCount * 1.2)),
					color: resolvedColors.accent,
					opacity: 0.3,
					type: 'dashed' as const
				},
				label: {
					show: false
				},
				emphasis: {
					lineStyle: {
						width: Math.max(1.5, Math.min(5, conn.publicationCount * 1.5)),
						opacity: 0.6
					}
				},
				// Store connection data for tooltip
				connectionData: conn,
				connectionType: 'coauthor' as const
			}));

		// Create links for contributor connections (TOC authors from edited volumes/special issues)
		const contributorLinks = contributorConnections
			.filter(
				(conn) => topCollaboratorNames.has(conn.source) && topCollaboratorNames.has(conn.target)
			)
			.map((conn) => ({
				source: conn.source,
				target: conn.target,
				lineStyle: {
					width: Math.max(1, Math.min(3, conn.publicationCount * 1)),
					color: resolvedColors.highlight,
					opacity: 0.4,
					type: [4, 4] as [number, number] // Dotted line pattern
				},
				label: {
					show: false
				},
				emphasis: {
					lineStyle: {
						width: Math.max(1.5, Math.min(4, conn.publicationCount * 1.2)),
						opacity: 0.7
					}
				},
				// Store connection data for tooltip
				connectionData: conn,
				connectionType: 'contributor' as const
			}));

		const links = [...centerLinks, ...coAuthorLinks, ...contributorLinks];

		return { nodes, links };
	});

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false
		},
		tooltip: {
			trigger: 'item',
			triggerOn: 'mousemove',
			backgroundColor: `color-mix(in srgb, ${resolvedColors.surface} 90%, transparent)`,
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 12,
				fontFamily: resolvedColors.fontFamily
			},
			borderRadius: 8,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			extraCssText:
				'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: var(--shadow-lg); max-width: 280px; word-wrap: break-word; white-space: normal; line-height: 1.4;',
			confine: true,
			padding: [10, 14],
			position: function (
				point: [number, number],
				params: any,
				dom: HTMLElement,
				rect: any,
				size: any
			) {
				const tooltipWidth = size.contentSize[0];
				const tooltipHeight = size.contentSize[1];
				const chartWidth = size.viewSize[0];
				const chartHeight = size.viewSize[1];

				let x = point[0] + 10;
				let y = point[1] - tooltipHeight / 2;

				if (x + tooltipWidth > chartWidth) {
					x = point[0] - tooltipWidth - 10;
				}

				if (y < 0) {
					y = 10;
				} else if (y + tooltipHeight > chartHeight) {
					y = chartHeight - tooltipHeight - 10;
				}

				if (isMobile) {
					x = Math.max(10, Math.min(chartWidth - tooltipWidth - 10, point[0] - tooltipWidth / 2));
					if (point[1] - tooltipHeight - 15 >= 0) {
						y = point[1] - tooltipHeight - 15;
					} else {
						y = point[1] + 15;
						if (y + tooltipHeight > chartHeight) {
							y = chartHeight - tooltipHeight - 10;
						}
					}
				}

				return [x, y];
			},
			formatter: function (params: any) {
				if (params.dataType === 'node') {
					if (params.data.id === centerAuthor) {
						return `<strong>${params.data.name}</strong><br/>Center of collaboration network`;
					} else {
						const collab = data.find((c) => c.author === params.data.name);
						if (collab) {
							const publicationList = collab.publications.map((pub) => `• ${pub}`).join('<br/>');

							return `<strong>${params.data.name}</strong><br/>
								Collaborations with ${centerAuthor}: ${collab.collaborationCount}<br/>
								<em>Publications:</em><br/>
								${publicationList}`;
						}
					}
				} else if (params.dataType === 'edge') {
					// Check if this is a co-author or contributor connection
					if (params.data.connectionData) {
						const conn = params.data.connectionData;
						const connectionType = params.data.connectionType;
						const publicationList = conn.publications
							.map((pub: string) => `• ${pub}`)
							.join('<br/>');

						if (connectionType === 'contributor') {
							return `<strong>Contributor connection</strong><br/>
								${conn.source} ↔ ${conn.target}<br/>
								Shared edited volumes/special issues: ${conn.publicationCount}<br/>
								<em>Publications:</em><br/>
								${publicationList}`;
						}
						return `<strong>Co-author connection</strong><br/>
							${conn.source} ↔ ${conn.target}<br/>
							Shared publications: ${conn.publicationCount}<br/>
							<em>Publications:</em><br/>
							${publicationList}`;
					} else {
						// Connection to center author
						const collab = data.find((c) => c.author === params.data.target);
						return collab
							? `${collab.collaborationCount} collaboration${collab.collaborationCount > 1 ? 's' : ''} with ${centerAuthor}`
							: '';
					}
				}
				return params.data.name;
			}
		},
		series: [
			{
				name: 'Collaboration Network',
				type: 'graph',
				layout: 'force',
				data: networkData.nodes,
				links: networkData.links,
				categories: [{ name: centerAuthor }, { name: 'Collaborators' }],
				roam: 'scale', // Enable zoom and pan
				scaleLimit: {
					min: 0.5,
					max: 3
				},
				zoom: 1,
				focusNodeAdjacency: true,
				draggable: true,
				left: isMobile ? '5%' : '10%',
				right: isMobile ? '5%' : '20%',
				top: '10%',
				bottom: '10%',
				force: {
					repulsion: isMobile ? 300 : 500,
					gravity: 0.08,
					edgeLength: isMobile ? 120 : 180,
					layoutAnimation: true,
					friction: 0.6
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
		backgroundColor: 'transparent',
		animationDuration: 1500,
		animationEasing: 'cubicOut' as any
	});

	// Effect for initialization and cleanup
	$effect(() => {
		let mounted = true;
		let resizeObserver: ResizeObserver | undefined;

		// Load echarts library and initialize chart
		(async () => {
			if (!echartsLib) {
				try {
					const echartsModule = await import('echarts');
					if (mounted) {
						echartsLib = echartsModule;
					}
				} catch (error) {
					console.error('Failed to load ECharts:', error);
					return;
				}
			}

			// Initialize chart only when container is available and chart doesn't exist
			if (chartContainer && !chart && echartsLib) {
				try {
					chart = echartsLib.init(chartContainer);

					// Setup resize observer after chart is created
					resizeObserver = new ResizeObserver(() => {
						if (chart && !chart.isDisposed()) {
							chart.resize();
						}
					});
					resizeObserver.observe(chartContainer);
					isChartReady = true;
				} catch (error) {
					console.error('Failed to initialize ECharts:', error);
					return;
				}
			}
		})();

		return () => {
			mounted = false;
			isChartReady = false;
			resizeObserver?.disconnect();
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
		};
	});

	// Separate effect for updating chart when options change
	$effect(() => {
		if (isChartReady && chart && !chart.isDisposed() && data.length > 0) {
			try {
				chart.setOption(chartOption, true);
			} catch (error) {
				console.error('Failed to update chart options:', error);
			}
		}
	});
</script>

<div class="echarts-container scroll-reveal-scale">
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

	{#if !isMobile}
		<div class="legend-overlay">
			<div class="legend-item">
				<div
					class="legend-icon"
					style="background-color: {resolvedColors.primary}; border: 2px solid {resolvedColors.primary}"
				></div>
				<span>{centerAuthor}</span>
			</div>
			<div class="legend-item">
				<div class="legend-icon" style="background-color: {resolvedColors.highlight}"></div>
				<span>Collaborators</span>
			</div>
			<div class="legend-item">
				<div class="legend-line" style="background-color: {resolvedColors.primary}"></div>
				<span>Direct collaboration</span>
			</div>
			<div class="legend-item">
				<div
					class="legend-line"
					style="background-color: {resolvedColors.accent}; border-bottom: 2px dashed {resolvedColors.accent}; height: 0;"
				></div>
				<span>Co-author connection</span>
			</div>
			<div class="legend-item">
				<div
					class="legend-line legend-dotted"
					style="border-bottom-color: {resolvedColors.highlight};"
				></div>
				<span>Contributor connection</span>
			</div>
		</div>
	{/if}

	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 500px;
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
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

	.legend-overlay {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		z-index: 10;
		background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
		backdrop-filter: blur(var(--glass-blur-sm));
		-webkit-backdrop-filter: blur(var(--glass-blur-sm));
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius);
		padding: var(--space-3);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 200px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-xs);
		color: var(--color-text);
	}

	.legend-icon {
		width: 12px;
		height: 12px;
		border-radius: var(--border-radius-full);
	}

	.legend-line {
		width: 20px;
		height: 2px;
	}

	.legend-dotted {
		background-color: transparent;
		border-bottom: 2px dotted;
		height: 0;
	}

	.zoom-btn {
		width: var(--space-10);
		height: var(--space-9);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
		backdrop-filter: blur(var(--glass-blur-sm));
		-webkit-backdrop-filter: blur(var(--glass-blur-sm));
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius);
		color: var(--color-text);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		box-shadow: var(--shadow-sm);
	}

	.zoom-btn:hover {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.zoom-btn:active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
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
		.echarts-container {
			height: 400px;
		}

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
			height: 350px;
		}

		.zoom-btn {
			width: var(--space-8);
			height: var(--space-8);
		}
	}
</style>
