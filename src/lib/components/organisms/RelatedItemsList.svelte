<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { base } from '$app/paths';
	import Button from '$lib/components/atoms/Button.svelte';

	// Props
	let {
		allItems = [],
		currentItemId,
		filterKey,
		filterValue,
		title,
		itemComponent,
		baseItemUrl,
		viewAllUrl,
		maxItems = 3,
		sectionClass = 'related-items-section mt-12',
		titleClass = 'related-items-title',
		gridClass = 'related-items-grid'
	}: {
		allItems?: any[]; // Array of all potential items (e.g., allPublications)
		currentItemId: string | number;
		filterKey: string; // Property to filter by (e.g., 'project', 'type')
		filterValue: any; // Value to match for the filterKey
		title: string; // Section title (e.g., "More Publications in this Project")
		itemComponent: ComponentType; // Component to render each item (e.g., ItemCard)
		// Removed itemPropName as it complicates <svelte:component>
		baseItemUrl: string; // Base URL for item links (e.g., "/publications/")
		viewAllUrl?: string; // URL for "View All" button (e.g., "/publications" or "/conference-activity")
		maxItems?: number; // Max items to display
		// Optional styling props
		sectionClass?: string;
		titleClass?: string;
		gridClass?: string;
	} = $props();

	// Reactive calculation for related items
	let relatedItems = $derived(
		allItems
			.filter(
				(item) =>
					item.id !== currentItemId && // Exclude current item
					item[filterKey] === filterValue // Match filter criteria
			)
			.slice(0, maxItems) // Limit number of items
	);

	// Construct the view all URL with filter if viewAllUrl is provided
	const viewAllLink = $derived(
		viewAllUrl && filterValue
			? `${viewAllUrl}?${filterKey}=${encodeURIComponent(filterValue)}`
			: viewAllUrl
	);
</script>

{#if relatedItems.length > 0}
	<section class={sectionClass}>
		<h2 class={titleClass}>{title}</h2>
		<div class={gridClass}>
			{#each relatedItems as item (item.id)}
				{@const ItemComponent = itemComponent}
				<ItemComponent {item} itemUrl={`${baseItemUrl}${item.id}`} />
			{/each}
		</div>
		
		{#if viewAllLink}
			<div class="view-all-container">
				<Button
					href={viewAllLink}
					variant="outline-primary"
					size="base"
					additionalClasses="glass-button"
				>
					View all →
				</Button>
			</div>
		{/if}
	</section>
{/if}

<style>
	.related-items-section {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Sophisticated glassmorphism effect matching other components */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.035) 0%,
			rgba(var(--color-accent-rgb), 0.025) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 8px));
		backdrop-filter: blur(var(--glass-blur-fallback, 8px));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb), var(--opacity-low));
		transition: all var(--anim-duration-base) var(--anim-ease-out);
	}

	@media (--sm) {
		.related-items-section {
			padding: var(--spacing-6);
		}
	}

	.related-items-section:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-accent-rgb), 0.035) 50%,
			rgba(var(--color-highlight-rgb), 0.03) 100%
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb), var(--opacity-medium));
	}

	.related-items-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-6);
		line-height: var(--line-height-tight);
		position: relative;
	}

	@media (--sm) {
		.related-items-title {
			font-size: var(--font-size-xl);
		}
	}

	/* Elegant accent line under title matching other components */
	.related-items-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--spacing-2));
		left: 0;
		width: var(--spacing-16);
		height: var(--border-width-medium);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			rgba(var(--color-highlight-rgb), 0.3) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--anim-duration-base) var(--anim-ease-out);
	}

	.related-items-section:hover .related-items-title::after {
		width: var(--spacing-20);
	}

	.related-items-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-4);
	}

	.view-all-container {
		margin-top: var(--spacing-6);
		text-align: center;
	}

	/* Dark mode refinements */
	:global(html.dark) .related-items-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-surface-rgb), 0.6) 0%,
			rgba(var(--color-primary-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb), 0.08);
	}

	:global(html.dark) .related-items-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-surface-rgb), 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	/* Responsive adjustments */
	@media (--md) {
		.related-items-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (--lg) {
		.related-items-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.related-items-section,
		.related-items-section:hover,
		.related-items-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
