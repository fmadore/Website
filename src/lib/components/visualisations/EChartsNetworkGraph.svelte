<!--
ECharts Network Graph - A network visualization for author collaborations
-->
<script lang="ts">
	import * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	
	// Props
	type CollaborationData = {
		author: string;
		collaborationCount: number;
		publications: string[];
	};
	
	let {
		data = [] as CollaborationData[],
		centerAuthor = 'Frédérick Madore',
		title = 'Author Collaboration Network',
		maxConnections = 20 // Limit to top collaborators for readability
	}: {
		data?: CollaborationData[];
		centerAuthor?: string;
		title?: string;
		maxConnections?: number;
	} = $props();
	
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;
	
	// Detect mobile screen size
	let isMobile = $state(false);
	
	$effect(() => {
		if (typeof window !== 'undefined') {
			const checkMobile = () => {
				isMobile = window.innerWidth < 768;
			};
			
			checkMobile();
			window.addEventListener('resize', checkMobile);
			
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	// Function to resolve CSS variables to actual color values
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '#6366f1';

		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value || '#6366f1';
	}

	// Resolve colors from CSS variables - reactive to theme changes
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		accent: getCSSVariableValue('--color-accent'),
		highlight: getCSSVariableValue('--color-highlight'),
		success: getCSSVariableValue('--color-success'),
		// Include theme to make this reactive to theme changes
		currentTheme: getTheme()
	});

	// Process data for network graph
	const networkData = $derived(() => {
		// Limit to top collaborators for better visualization
		const topCollaborators = data
			.sort((a, b) => b.collaborationCount - a.collaborationCount)
			.slice(0, maxConnections);

		// Create nodes
		const nodes = [
			// Center node (Frédérick Madore)
			{
				id: centerAuthor,
				name: centerAuthor,
				symbolSize: isMobile ? 40 : 60,
				itemStyle: {
					color: resolvedColors.primary
				},
				label: {
					show: true,
					fontSize: isMobile ? 12 : 14,
					fontWeight: 'bold',
					color: resolvedColors.text
				},
				category: 0
			},
			// Collaborator nodes
			...topCollaborators.map((collab, index) => ({
				id: collab.author,
				name: collab.author,
				symbolSize: Math.max(
					isMobile ? 15 : 20, 
					Math.min(
						isMobile ? 35 : 45, 
						(collab.collaborationCount / Math.max(...topCollaborators.map(c => c.collaborationCount))) * (isMobile ? 35 : 45)
					)
				),
				itemStyle: {
					color: index % 2 === 0 ? resolvedColors.accent : resolvedColors.highlight
				},
				label: {
					show: !isMobile || collab.collaborationCount > 2, // Show fewer labels on mobile
					fontSize: isMobile ? 10 : 12,
					color: resolvedColors.text
				},
				category: 1
			}))
		];

		// Create links
		const links = topCollaborators.map(collab => ({
			source: centerAuthor,
			target: collab.author,
			lineStyle: {
				width: Math.max(1, Math.min(8, collab.collaborationCount * 2)),
				color: resolvedColors.border,
				opacity: 0.6
			},
			label: {
				show: false
			}
		}));

		return { nodes, links };
	});

	// Chart options
	const option = $derived({
		title: {
			show: false // Hide internal title
		},
		tooltip: {
			trigger: 'item',
			backgroundColor: resolvedColors.surface,
			textStyle: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			borderRadius: 6,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);',
			formatter: function(params: any) {
				if (params.dataType === 'node') {
					if (params.data.id === centerAuthor) {
						return `<strong>${params.data.name}</strong><br/>Center of collaboration network`;
					} else {
						const collab = data.find(c => c.author === params.data.name);
						if (collab) {
							const publicationList = collab.publications.join('<br/>');
							return `<strong>${params.data.name}</strong><br/>
								Collaborations: ${collab.collaborationCount}<br/>
								<em>Publications:</em><br/>
								${publicationList}`;
						}
					}
				} else if (params.dataType === 'edge') {
					const collab = data.find(c => c.author === params.data.target);
					return collab ? `${collab.collaborationCount} collaboration${collab.collaborationCount > 1 ? 's' : ''}` : '';
				}
				return params.data.name;
			}
		},
		legend: {
			show: false
		},
		series: [
			{
				name: 'Collaboration Network',
				type: 'graph',
				layout: 'force',
				data: networkData().nodes,
				links: networkData().links,
				categories: [
					{ name: 'Center Author' },
					{ name: 'Collaborators' }
				],
				roam: true, // Allow zoom and pan
				focusNodeAdjacency: true,
				draggable: true,
				left: '10%',
				right: '10%',
				top: '10%',
				bottom: '10%',
				force: {
					repulsion: isMobile ? 200 : 350,
					gravity: 0.08,
					edgeLength: isMobile ? 100 : 140,
					layoutAnimation: true
				},
				emphasis: {
					focus: 'adjacency',
					lineStyle: {
						width: 4,
						opacity: 0.9
					}
				},
				lineStyle: {
					color: 'source',
					curveness: 0.1
				},
				label: {
					position: 'right',
					formatter: '{b}'
				}
			}
		],
		backgroundColor: 'transparent',
		animationDuration: 1500,
		animationEasing: 'cubicOut' as any
	});

	// Initialize chart and handle updates
	$effect(() => {
		if (!chart && chartContainer) {
			chart = echarts.init(chartContainer);
		}

		if (chart) {
			chart.setOption(option, true);
		}
	});

	// Setup resize observer and cleanup
	$effect(() => {
		let resizeObserver: ResizeObserver | undefined;

		if (chartContainer && chart) {
			resizeObserver = new ResizeObserver(() => {
				chart?.resize();
			});
			resizeObserver.observe(chartContainer);
		}

		return () => {
			resizeObserver?.disconnect();
			chart?.dispose();
		};
	});
</script>

<div class="echarts-container" use:scrollAnimate={{ delay: 400, animationClass: 'scale-in-center', rootMargin: '100px', threshold: 0.1 }}>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 500px;
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
		/* Initial state for scroll animation */
		opacity: 0;
		transform: scale(0.8) translateY(20px);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}



	.chart {
		width: 100%;
		height: 100%;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.echarts-container {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.echarts-container {
			height: 400px;
		}
	}
	
	@media (max-width: 480px) {
		.echarts-container {
			height: 350px;
		}
	}
</style> 