<script lang="ts">
	import type { UniversalFilterConfig } from '$lib/types/filters';
	import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
	import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
	import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';
	import FilterSectionChips from '$lib/components/filters/FilterSectionChips.svelte';
	import FilterSectionDropdown from '$lib/components/filters/FilterSectionDropdown.svelte';
	import { slide } from 'svelte/transition';
	import { getGlobalState } from '$lib/stores/globalState.svelte';

	const globalState = getGlobalState();

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

		// Execute the callback
		callback();

		// Restore scroll position using modern approach
		const restoreScroll = () => {
			if (sidebarElement && Math.abs(sidebarElement.scrollTop - scrollTop) > 1) {
				sidebarElement.scrollTop = scrollTop;
			}
		};

		// Use a single requestAnimationFrame for smooth restoration
		requestAnimationFrame(() => {
			restoreScroll();
			// Fallback check after animations complete
			setTimeout(restoreScroll, 100);
		});
	}

	// Wrapper function to enhance any filter toggle with sidebar scroll preservation
	function createScrollPreservingToggle(originalToggle: (item: string) => void) {
		return (item: string) => {
			globalState.animationsEnabled = false; // Disable animations before updating filters
			preserveSidebarScroll(() => originalToggle(item));
		};
	}

	// Enhanced sections with scroll-preserving toggles
	let enhancedSections = $derived(
		sections.map((section) => {
			if (section.type === 'checkbox' || section.type === 'buttons' || section.type === 'chips') {
				return {
					...section,
					toggleItem: createScrollPreservingToggle(section.toggleItem)
				};
			} else if (section.type === 'range') {
				return {
					...section,
					updateRange: (min: number, max: number) => {
						globalState.animationsEnabled = false; // Disable animations
						preserveSidebarScroll(() => section.updateRange(min, max));
					},
					resetRange: () => {
						globalState.animationsEnabled = false; // Disable animations
						preserveSidebarScroll(() => section.resetRange());
					}
				};
			}
			return section;
		})
	);
</script>

<aside class="filter-sidebar sticky-top page-enter" bind:this={sidebarElement}>
	<!-- Mobile Toggle Button Removed -->

	<!-- Collapsible Filter Sections Wrapper (Mobile) -->
	{#if isExpandedMobile}
		<div class="filter-sections-wrapper" transition:slide={{ duration: 200 }}>
			{#each enhancedSections as section (section.title)}
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
						/>
					{:else if section.type === 'dropdown'}
						<FilterSectionDropdown
							title={section.title}
							items={section.items}
							itemLabels={section.itemLabels}
							activeItems={section.activeItems}
							toggleItem={section.toggleItem}
							counts={section.counts}
							placeholder={section.placeholder}
							searchThreshold={section.searchThreshold}
							maxHeight={section.maxHeight}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	<!-- Always visible on desktop -->
	<div class="filter-sections-wrapper-desktop">
		{#each enhancedSections as section (section.title)}
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
					/>
				{:else if section.type === 'dropdown'}
					<FilterSectionDropdown
						title={section.title}
						items={section.items}
						itemLabels={section.itemLabels}
						activeItems={section.activeItems}
						toggleItem={section.toggleItem}
						counts={section.counts}
						placeholder={section.placeholder}
						searchThreshold={section.searchThreshold}
						maxHeight={section.maxHeight}
					/>
				{/if}
			</div>
		{/each}
	</div>
</aside>

<style>
	/* Main sidebar container - Clean unified design */
	.filter-sidebar {
		position: relative;
		contain: layout style;
		transition: box-shadow var(--duration-normal) var(--ease-out);
	}

	/* Filter sections wrapper (for mobile collapse) */
	.filter-sections-wrapper {
		display: none;
		overflow: hidden;
	}

	/* Desktop filter sections wrapper */
	.filter-sections-wrapper-desktop {
		display: block;
	}

	/* Sticky positioning for desktop */
	.sticky-top {
		position: static;
		max-height: none;
		overflow-y: visible;
		margin-bottom: var(--space-xl);
	}

	/* Mobile/Tablet breakpoint - show collapsible filters */
	@media (--lg-down) {
		.filter-sidebar {
			background: transparent;
			border: none;
			box-shadow: none;
			padding: 0;
		}

		.filter-sections-wrapper {
			display: flex;
			flex-direction: column;
			gap: var(--space-sm);
			padding: 0;
			margin-top: var(--space-md);
		}

		.filter-sections-wrapper-desktop {
			display: none;
		}

		.sticky-top {
			position: static;
			max-height: none;
			overflow-y: visible;
			margin-bottom: 0;
		}
	}

	/* Desktop breakpoint - show sidebar filters */
	@media (--lg) {
		.filter-sections-wrapper {
			display: none;
		}

		.filter-sections-wrapper-desktop {
			display: flex;
			flex-direction: column;
			gap: 0;
		}

		.filter-sidebar {
			background: var(--color-surface);
			border: var(--border-width-thin) solid var(--color-border);
			border-radius: var(--border-radius-lg);
			padding: var(--space-lg);
			box-shadow: var(--shadow-sm);
			margin-bottom: 0;
		}

		.filter-sidebar:hover {
			box-shadow: var(--shadow-md);
		}

		.sticky-top {
			position: sticky;
			top: var(--space-xl);
			/* No max-height - show all content without scrollbar */
			overflow: visible;
		}
	}

	/* Individual filter section styling */
	.filter-section {
		background: transparent;
		border: none;
		padding: 0;
		position: relative;
	}

	/* Desktop: Add dividers between sections */
	@media (--lg) {
		.filter-section {
			padding-bottom: var(--space-md);
			margin-bottom: var(--space-md);
			border-bottom: var(--border-width-thin) solid
				color-mix(in srgb, var(--color-border) 60%, transparent);
		}

		.filter-section:last-of-type {
			border-bottom: none;
			margin-bottom: 0;
			padding-bottom: 0;
		}
	}

	/* Dark mode enhancements */
	:global(html.dark) .filter-sidebar {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .filter-section {
		border-color: color-mix(in srgb, var(--color-border) 40%, transparent);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-sidebar {
			transition: none;
		}
	}
</style>
