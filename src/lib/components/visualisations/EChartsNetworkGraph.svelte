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
	
	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = null;
	let isMobile = $state(false);

	// Utility functions for CSS variable resolution
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '#6366f1';
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value || '#6366f1';
	}

	// Reactive mobile detection
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

	// Reactive color resolution
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary'),
		text: getCSSVariableValue('--color-text'),
		textLight: getCSSVariableValue('--color-text-light'),
		border: getCSSVariableValue('--color-border'),
		surface: getCSSVariableValue('--color-surface'),
		accent: getCSSVariableValue('--color-accent'),
		highlight: getCSSVariableValue('--color-highlight'),
		success: getCSSVariableValue('--color-success'),
		currentTheme: getTheme()
	});

	// Create a color palette for different collaboration counts
	const collaborationColors = $derived(() => {
		const baseColors = [
			resolvedColors.highlight,  // Orange for 1 collaboration
			resolvedColors.accent,     // Purple for 2 collaborations  
			resolvedColors.success,    // Green for 3 collaborations
			resolvedColors.primary,    // Blue for 4 collaborations
		];
		
		const extendedColors = [...baseColors];
		for (let i = baseColors.length; i < 10; i++) {
			const baseIndex = i % baseColors.length;
			extendedColors.push(baseColors[baseIndex]);
		}
		
		return extendedColors;
	});

	// Process data for network graph
	const networkData = $derived(() => {
		// Limit to top collaborators for better visualization
		const topCollaborators = data
			.sort((a, b) => b.collaborationCount - a.collaborationCount)
			.slice(0, maxConnections);

		// Create nodes
		const nodes = [
			// Center node (main author)
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
					color: collaborationColors()[Math.min(collab.collaborationCount - 1, collaborationColors().length - 1)]
				},
				label: {
					show: !isMobile || collab.collaborationCount > 2,
					fontSize: isMobile ? 10 : 12,
					color: resolvedColors.text,
					position: 'right',
					distance: 10,
					formatter: function(params: any) {
						const maxLength = isMobile ? 15 : 20;
						return params.name.length > maxLength ? 
							params.name.substring(0, maxLength) + '...' : 
							params.name;
					}
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

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false
		},
		tooltip: {
			trigger: 'item',
			backgroundColor: resolvedColors.surface,
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 12,
				fontFamily: 'Inter, -apple-system, sans-serif'
			},
			borderRadius: 6,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 280px; word-wrap: break-word; white-space: normal; line-height: 1.4;',
			confine: true,
			position: function(point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) {
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
			formatter: function(params: any) {
				if (params.dataType === 'node') {
					if (params.data.id === centerAuthor) {
						return `<strong>${params.data.name}</strong><br/>Center of collaboration network`;
					} else {
						const collab = data.find(c => c.author === params.data.name);
						if (collab) {
							const publicationList = collab.publications
								.map(pub => `• ${pub}`)
								.join('<br/>');
							
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
				roam: true,
				focusNodeAdjacency: true,
				draggable: true,
				left: '10%',
				right: '10%',
				top: '10%',
				bottom: '15%',
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
					}
				},
				lineStyle: {
					color: 'source',
					curveness: 0.1
				},
				label: {
					position: 'right',
					formatter: '{b}',
					emphasis: {
						show: true
					}
				},
				avoidLabelOverlap: true
			}
		],
		backgroundColor: 'transparent',
		animationDuration: 1500,
		animationEasing: 'cubicOut' as any
	});

	// Chart lifecycle management
	$effect(() => {
		// Initialize chart only when container is available and chart doesn't exist
		if (chartContainer && !chart) {
			try {
				chart = echarts.init(chartContainer);
			} catch (error) {
				console.error('Failed to initialize ECharts:', error);
				return;
			}
		}

		// Update chart options whenever they change
		if (chart && data.length > 0) {
			try {
				chart.setOption(chartOption, true);
			} catch (error) {
				console.error('Failed to set chart options:', error);
			}
		}
	});

	// Resize handling
	$effect(() => {
		if (!chartContainer || !chart) return;

		let resizeObserver: ResizeObserver | undefined;

		try {
			resizeObserver = new ResizeObserver(() => {
				if (chart && !chart.isDisposed()) {
					chart.resize();
				}
			});
			resizeObserver.observe(chartContainer);
		} catch (error) {
			console.error('Failed to setup resize observer:', error);
		}

		return () => {
			resizeObserver?.disconnect();
		};
	});

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
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