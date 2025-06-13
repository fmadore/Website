<script lang="ts">
	import type { UniversalFilterConfig, FilterSectionConfig } from '$lib/types/filters';
	import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
	import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
	import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';
	import FilterSectionChips from '$lib/components/filters/FilterSectionChips.svelte';
	import { fly, slide } from 'svelte/transition';

	interface Props {
		config: UniversalFilterConfig;
		isExpandedMobile?: boolean;
		oncollapse?: () => void;
	}

	// Prop for the configuration object
	let { config, isExpandedMobile = false, oncollapse }: Props = $props();

	// Reference to the sidebar element
	let sidebarElement: HTMLElement;

	// Reactive statement to get the sections array
	let sections = $derived(config?.sections || []);

	// Simplified approach: Just prevent any scroll changes during filter updates
	function preserveSidebarScroll(callback: () => void) {
		// Check if we're in a browser environment and have the sidebar element
		if (typeof window === 'undefined' || !sidebarElement) {
			callback();
			return;
		}

		// Capture current scroll position
		const scrollTop = sidebarElement.scrollTop;
		
		console.log('BEFORE - scrollTop:', scrollTop);
		
		// Execute the callback
		callback();
		
		console.log('AFTER callback - scrollTop is now:', sidebarElement.scrollTop);
		
		// Force restore scroll position with multiple attempts
		const forceRestore = () => {
			if (sidebarElement) {
				sidebarElement.scrollTop = scrollTop;
				console.log('Forced restore to:', scrollTop, 'actual:', sidebarElement.scrollTop);
			}
		};
		
		// Immediate restore
		forceRestore();
		
		// Multiple restore attempts
		requestAnimationFrame(forceRestore);
		setTimeout(forceRestore, 0);
		setTimeout(forceRestore, 10);
		setTimeout(forceRestore, 50);
		setTimeout(forceRestore, 100);
		setTimeout(forceRestore, 200);
		
		// Final check
		setTimeout(() => {
			if (sidebarElement) {
				console.log('FINAL CHECK - scrollTop:', sidebarElement.scrollTop, 'expected:', scrollTop);
				if (Math.abs(sidebarElement.scrollTop - scrollTop) > 1) {
					console.log('🚨 SCROLL POSITION STILL WRONG - forcing one more time');
					sidebarElement.scrollTop = scrollTop;
				}
			}
		}, 300);
	}

	// Enhanced function to handle clearing filters with scroll preservation
	function handleClearFilters() {
		if (config?.clearAllFilters) {
			preserveSidebarScroll(() => {
				config.clearAllFilters();
				oncollapse?.(); // Call callback instead of dispatching event
			});
		}
	}

	// Wrapper function to enhance any filter toggle with sidebar scroll preservation
	function createScrollPreservingToggle(originalToggle: (item: any) => void) {
		return (item: any) => {
			preserveSidebarScroll(() => originalToggle(item));
		};
	}

	// Enhanced sections with scroll-preserving toggles
	let enhancedSections = $derived(
		sections.map(section => {
			if (section.type === 'checkbox' || section.type === 'buttons' || section.type === 'chips') {
				return {
					...section,
					toggleItem: createScrollPreservingToggle(section.toggleItem)
				};
			} else if (section.type === 'range') {
				return {
					...section,
					updateRange: (min: number, max: number) => {
						preserveSidebarScroll(() => section.updateRange(min, max));
					},
					resetRange: () => {
						preserveSidebarScroll(() => section.resetRange());
					}
				};
			}
			return section;
		})
	);
</script>

<aside class="filter-sidebar sticky-top" bind:this={sidebarElement}>
	<!-- Mobile Toggle Button Removed -->

	<!-- Collapsible Filter Sections Wrapper (Mobile) -->
	{#if isExpandedMobile}
		<div class="filter-sections-wrapper" transition:slide={{ duration: 200 }}>
			{#each enhancedSections as section, index (section.title)}
				<div class="filter-section" in:fly={{ y: 10, duration: 200, delay: index * 50 }}>
					{#if section.type === 'checkbox'}
						<FilterSectionCheckbox
							title={section.title}
							items={section.items}
							itemLabels={section.itemLabels}
							activeItems={section.activeItems}
							toggleItem={section.toggleItem}
							counts={section.counts}
						/>
					{:else if section.type === 'range'}
						<FilterSectionRangeSlider
							title={section.title}
							allYears={section.allYears}
							activeRange={section.activeRange}
							updateRange={section.updateRange}
							resetRange={section.resetRange}
						/>
					{:else if section.type === 'buttons'}
						<FilterSectionButtons
							title={section.title}
							items={section.items}
							activeItems={section.activeItems}
							toggleItem={section.toggleItem}
							counts={section.counts}
						/>
					{:else if section.type === 'chips'}
						<FilterSectionChips
							title={section.title}
							items={section.items}
							activeItems={section.activeItems}
							toggleItem={section.toggleItem}
							counts={section.counts}
							searchThreshold={section.searchThreshold}
							initialDisplayCount={section.initialDisplayCount}
							showSearch={section.showSearch}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Always visible on desktop -->
	<div class="filter-sections-wrapper-desktop">
		{#each enhancedSections as section, index (section.title)}
			<div class="filter-section">
				{#if section.type === 'checkbox'}
					<FilterSectionCheckbox
						title={section.title}
						items={section.items}
						itemLabels={section.itemLabels}
						activeItems={section.activeItems}
						toggleItem={section.toggleItem}
						counts={section.counts}
					/>
				{:else if section.type === 'range'}
					<FilterSectionRangeSlider
						title={section.title}
						allYears={section.allYears}
						activeRange={section.activeRange}
						updateRange={section.updateRange}
						resetRange={section.resetRange}
					/>
				{:else if section.type === 'buttons'}
					<FilterSectionButtons
						title={section.title}
						items={section.items}
						activeItems={section.activeItems}
						toggleItem={section.toggleItem}
						counts={section.counts}
					/>
				{:else if section.type === 'chips'}
					<FilterSectionChips
						title={section.title}
						items={section.items}
						activeItems={section.activeItems}
						toggleItem={section.toggleItem}
						counts={section.counts}
						searchThreshold={section.searchThreshold}
						initialDisplayCount={section.initialDisplayCount}
						showSearch={section.showSearch}
					/>
				{/if}
			</div>
		{/each}
	</div>
</aside>

<style>
	/* Main sidebar container - Card design for the whole sidebar */
	.filter-sidebar {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-4);
		position: relative;
		box-shadow: var(--shadow-sm);
		/* Prevent layout shifts during content changes */
		contain: layout style;
		/* Enhanced glassmorphism to match other components */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Hover effects for glassmorphism */
	.filter-sidebar:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	/* Mobile Toggle Button Styling Removed */
	/*.mobile-toggle { ... }*/

	/* Filter sections wrapper (for mobile collapse) */
	.filter-sections-wrapper {
		display: none; /* Hidden by default on mobile, shown via JS */
		overflow: hidden; /* Needed for slide transition */
		border-radius: var(--border-radius-md);
	}

	/* Desktop filter sections wrapper */
	.filter-sections-wrapper-desktop {
		display: block; /* Always visible on desktop */
	}

	/* Sticky positioning for desktop */
	.sticky-top {
		position: static;
		max-height: none;
		overflow-y: visible;
		margin-bottom: var(--spacing-8);
	}

	@media (max-width: 900px) {
		/* Mobile breakpoint */
		.filter-sidebar {
			background: transparent; /* Make background transparent on mobile */
			border: none; /* Remove border on mobile */
			box-shadow: none; /* Remove shadow on mobile */
			padding: 0; /* Remove padding on mobile as sections are conditionally rendered */
		}

		.filter-sidebar::before {
			display: none; /* Hide accent line on mobile */
		}

		/* Mobile toggle button styles removed */
		.filter-sections-wrapper {
			display: block; /* Allow Svelte's #if to control visibility */
			background: var(--color-surface);
			border: 1px solid var(--color-border);
			border-radius: var(--border-radius-md);
			padding: var(--spacing-4);
			margin-top: var(--spacing-4);
			box-shadow: var(--shadow-sm);
		}
		.filter-sections-wrapper-desktop {
			display: none; /* Hide the desktop wrapper on mobile */
		}
		/* Remove sticky behavior on mobile */
		.sticky-top {
			position: static;
			max-height: none;
			overflow-y: visible;
			margin-bottom: 0; /* Removed margin as wrapper handles spacing */
		}
	}

	@media (min-width: 901px) {
		/* Desktop breakpoint */
		/* Mobile toggle styles removed */
		.filter-sections-wrapper {
			display: none; /* Hide mobile wrapper on desktop */
		}
		.filter-sections-wrapper-desktop {
			display: block; /* Show desktop wrapper */
		}
		.filter-sidebar {
			/* Restore card design on desktop with glassmorphism */
			background: linear-gradient(
				135deg,
				rgba(var(--color-primary-rgb), 0.03) 0%,
				rgba(var(--color-highlight-rgb), 0.02) 50%,
				rgba(var(--color-accent-rgb), 0.01) 100%
			);
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
			border-radius: var(--border-radius-md);
			padding: var(--spacing-4);
			box-shadow: 
				0 8px 32px 0 rgba(31, 38, 135, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			margin-bottom: 0;
		}
		.sticky-top {
			position: sticky;
			top: var(--spacing-8);
			max-height: calc(100vh - var(--spacing-8) - 2rem);
			overflow-y: auto;
			scrollbar-width: thin;
			scrollbar-color: var(--color-text-light) transparent;
			/* Ensure stable positioning during content changes */
			will-change: scroll-position;
			/* Prevent the sidebar from jumping during filter changes */
			transform: translateZ(0);
		}

		.sticky-top::-webkit-scrollbar {
			width: var(--scrollbar-width, 6px);
		}

		.sticky-top::-webkit-scrollbar-track {
			background: transparent;
		}

		.sticky-top::-webkit-scrollbar-thumb {
			background-color: var(--color-text-light);
			border-radius: var(--scrollbar-thumb-radius, var(--border-radius-sm));
			transition: background-color 0.2s ease-in-out;
		}

		.sticky-top:hover::-webkit-scrollbar-thumb {
			background-color: var(--color-text);
		}
	}

	/* Individual filter section styling - Clean minimal design */
	.filter-section {
		background: transparent;
		border: none;
		padding: 0;
		margin-bottom: var(--spacing-6);
		position: relative;
	}

	.filter-section:last-of-type {
		margin-bottom: 0;
	}

	/* Dark mode enhancements for glassmorphism */
	:global(html.dark) .filter-sidebar {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .filter-sidebar:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	/* Dark mode mobile wrapper */
	:global(html.dark) .filter-sections-wrapper {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Clear button styling removed */
	/*
    .clear-button-wrapper {
        margin-top: var(--spacing-6); 
        padding-top: var(--spacing-4); 
        border-top: 1px solid var(--color-border); 
    }

    .clear-button-wrapper.top-clear-button {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
        margin-bottom: var(--spacing-4); 
        padding-bottom: var(--spacing-4); 
        border-bottom: 1px solid var(--color-border); 
    }

    .clear-filters {
        width: 100%; 
    }
    .clear-filters.btn-secondary {
        background-color: var(--color-secondary);
        border-color: var(--color-secondary);
        color: white;
    }
    .clear-filters.btn-secondary:hover {
         background-color: #374151; 
         border-color: #374151;
    }
    */
</style>
