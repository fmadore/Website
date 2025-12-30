<script lang="ts">
	import type { UniversalFilterConfig } from '$lib/types/filters';
	import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
	import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
	import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';
	import FilterSectionChips from '$lib/components/filters/FilterSectionChips.svelte';
	import FilterSectionDropdown from '$lib/components/filters/FilterSectionDropdown.svelte';
	import { slide } from 'svelte/transition';
	import { animationsEnabledStore as animationsEnabled } from '$lib/stores/globalState.svelte';

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
			animationsEnabled.set(false); // Disable animations before updating filters
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
						animationsEnabled.set(false); // Disable animations
						preserveSidebarScroll(() => section.updateRange(min, max));
					},
					resetRange: () => {
						animationsEnabled.set(false); // Disable animations
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
	/* Main sidebar container - Card design for the whole sidebar */
	.filter-sidebar {
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		padding: var(--space-md);
		position: relative;
		box-shadow: var(--shadow-sm);
		/* Prevent layout shifts during content changes */
		contain: layout style;
		/* Enhanced glassmorphism to match other components */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 3%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 1%, transparent) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		box-shadow:
			var(--shadow-glass),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		transition: all var(--duration-normal) var(--ease-out);
	}

	/* Hover effects for glassmorphism */
	.filter-sidebar:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 5%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 3%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 2%, transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-glass-lg),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium-high) * 100%), transparent);
	}

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
		margin-bottom: var(--space-xl);
	}

	/* Mobile/Tablet breakpoint (max-width: 1024px) - show collapsible filters */
	@media (max-width: 1024px) {
		.filter-sidebar {
			background: transparent;
			border: none;
			box-shadow: none;
			padding: 0;
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.filter-sidebar::before {
			display: none;
		}

		.filter-sidebar:hover {
			transform: none;
			background: transparent;
			border-color: transparent;
			box-shadow: none;
		}

		.filter-sections-wrapper {
			display: block;
			background: transparent;
			border: none;
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

	/* Desktop breakpoint (min-width: 1025px) - show sidebar filters */
	@media (min-width: 1025px) {
		.filter-sections-wrapper {
			display: none;
		}

		.filter-sections-wrapper-desktop {
			display: block;
		}

		.filter-sidebar {
			background: linear-gradient(
				135deg,
				color-mix(in srgb, var(--color-primary) 3%, transparent) 0%,
				color-mix(in srgb, var(--color-highlight) 2%, transparent) 50%,
				color-mix(in srgb, var(--color-accent) 1%, transparent) 100%
			);
			backdrop-filter: blur(var(--glass-blur-amount));
			-webkit-backdrop-filter: blur(var(--glass-blur-amount));
			border: var(--border-width-thin) solid
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
			border-radius: var(--border-radius-md);
			padding: var(--space-md);
			box-shadow:
				var(--shadow-glass),
				inset 0 1px 0
					color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
			margin-bottom: 0;
		}

		.sticky-top {
			position: sticky;
			top: var(--space-xl);
			max-height: none;
			overflow-y: visible;
			will-change: scroll-position;
			transform: translateZ(0);
		}
	}

	/* Large screens - more padding */
	@media (min-width: 1024px) {
		.filter-sidebar {
			padding: var(--space-lg);
		}
	}

	/* Individual filter section styling - Clean minimal design */
	.filter-section {
		background: transparent;
		border: none;
		padding: 0;
		margin-bottom: var(--space-lg);
		position: relative;
		will-change: opacity, transform;
	}

	.filter-section:last-of-type {
		margin-bottom: 0;
	}

	/* Staggered animation for filter sections */
	.filter-section:nth-child(1) {
		--stagger-delay: 0ms;
	}
	.filter-section:nth-child(2) {
		--stagger-delay: 50ms;
	}
	.filter-section:nth-child(3) {
		--stagger-delay: 100ms;
	}
	.filter-section:nth-child(4) {
		--stagger-delay: 150ms;
	}
	.filter-section:nth-child(5) {
		--stagger-delay: 200ms;
	}
	.filter-section:nth-child(n + 6) {
		--stagger-delay: 250ms;
	}

	/* Dark mode enhancements for glassmorphism */
	:global(html.dark) .filter-sidebar {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 6%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 2%, transparent) 100%
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
		box-shadow:
			var(--shadow-glass),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
	}

	:global(html.dark) .filter-sidebar:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 6%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 4%, transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-glass-lg),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
	}

	/* Dark mode mobile wrapper */
	:global(html.dark) .filter-sections-wrapper {
		background: transparent;
		border: none;
		box-shadow: none;
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-sidebar {
			transition: none;
			animation: none;
		}

		.filter-sidebar:hover {
			transform: none;
		}

		.filter-section {
			will-change: auto;
			animation: none;
		}
	}
</style>
