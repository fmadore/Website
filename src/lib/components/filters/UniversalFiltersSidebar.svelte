<script lang="ts">
	import type { UniversalFilterConfig, FilterSectionConfig } from '$lib/types/filters';
	import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
	import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
	import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';
	import { fly, slide } from 'svelte/transition';

	interface Props {
		config: UniversalFilterConfig;
		isExpandedMobile?: boolean;
		oncollapse?: () => void;
	}

	// Prop for the configuration object
	let { config, isExpandedMobile = false, oncollapse }: Props = $props();

	// Reactive statement to get the sections array
	let sections = $derived(config?.sections || []);

	// Function to handle clearing filters and notifying parent to collapse
	function handleClearFilters() {
		if (config?.clearAllFilters) {
			config.clearAllFilters();
			oncollapse?.(); // Call callback instead of dispatching event
		}
	}
</script>

<aside class="filter-sidebar sticky-top">
	<!-- Mobile Toggle Button Removed -->

	<!-- Collapsible Filter Sections Wrapper (Mobile) -->
	{#if isExpandedMobile}
		<div class="filter-sections-wrapper" transition:slide={{ duration: 200 }}>
			{#each sections as section, index (section.title)}
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
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Always visible on desktop -->
	<div class="filter-sections-wrapper-desktop">
		{#each sections as section, index (section.title)}
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
				{/if}
			</div>
		{/each}
	</div>
</aside>

<style>
	/* Main sidebar container - Enhanced modern design */
	.filter-sidebar {
		background: linear-gradient(
			135deg,
			var(--color-surface) 0%,
			color-mix(in srgb, var(--color-surface) 95%, var(--color-primary) 5%) 100%
		);
		border: 1px solid color-mix(in srgb, var(--color-border) 60%, var(--color-primary) 40%);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-6);
		box-shadow: 
			var(--shadow-md),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.05);
		transition:
			background 0.3s ease,
			border-color 0.3s ease,
			box-shadow 0.3s ease,
			transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	/* Subtle accent line at top */
	.filter-sidebar::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--color-primary) 0%,
			var(--color-accent) 50%,
			var(--color-highlight) 100%
		);
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
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
			padding: var(--spacing-4);
			border: none; /* Remove border on mobile */
			box-shadow: none; /* Remove shadow on mobile */
			padding: 0; /* Remove padding on mobile as sections are conditionally rendered */
			background: transparent; /* Make background transparent */
		}

		.filter-sidebar::before {
			display: none; /* Hide accent line on mobile */
		}

		/* Mobile toggle button styles removed */
		.filter-sections-wrapper {
			display: block; /* Allow Svelte's #if to control visibility */
			/* Enhanced mobile wrapper styling */
			background: linear-gradient(
				135deg,
				var(--color-surface) 0%,
				color-mix(in srgb, var(--color-surface) 95%, var(--color-primary) 5%) 100%
			);
			border: 1px solid color-mix(in srgb, var(--color-border) 60%, var(--color-primary) 40%);
			border-radius: var(--border-radius-lg);
			padding: var(--spacing-5);
			box-shadow: 
				var(--shadow-md),
				0 0 0 1px rgba(var(--color-primary-rgb), 0.05);
			margin-top: var(--spacing-4); /* Add space below the new toggle button */
			position: relative;
			overflow: hidden;
		}

		.filter-sections-wrapper::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 3px;
			background: linear-gradient(
				90deg,
				var(--color-primary) 0%,
				var(--color-accent) 50%,
				var(--color-highlight) 100%
			);
			border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
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
			/* Restore desktop styles potentially overridden by mobile */
			background: linear-gradient(
				135deg,
				var(--color-surface) 0%,
				color-mix(in srgb, var(--color-surface) 95%, var(--color-primary) 5%) 100%
			);
			border: 1px solid color-mix(in srgb, var(--color-border) 60%, var(--color-primary) 40%);
			border-radius: var(--border-radius-lg);
			padding: var(--spacing-6);
			box-shadow: 
				var(--shadow-md),
				0 0 0 1px rgba(var(--color-primary-rgb), 0.05);
			margin-bottom: 0; /* Reset margin from static */
		}

		.filter-sidebar::before {
			display: block; /* Show accent line on desktop */
		}
		.sticky-top {
			position: sticky;
			top: var(--spacing-8);
			max-height: calc(100vh - var(--spacing-8) - 2rem);
			overflow-y: auto;
			scrollbar-width: thin;
			scrollbar-color: var(--color-text-light) transparent;
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

	/* Individual filter section styling - Enhanced card-like design */
	.filter-section {
		background: var(--color-background);
		border: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent 30%);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-5);
		margin-bottom: var(--spacing-4);
		box-shadow: 
			var(--shadow-sm),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.02);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.filter-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background: linear-gradient(
			180deg,
			var(--color-primary) 0%,
			var(--color-accent) 100%
		);
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}

	.filter-section:hover {
		border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border) 80%);
		box-shadow: 
			var(--shadow-md),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.08);
		transform: translateY(-1px);
	}

	.filter-section:hover::before {
		opacity: 1;
	}

	.filter-section:last-of-type {
		margin-bottom: 0;
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
