<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { base } from '$app/paths';

	// Props
	let {
		allItems = [],
		currentItemId,
		filterKey,
		filterValue,
		title,
		itemComponent,
		baseItemUrl,
		maxItems = 3,
		sectionClass = 'related-items-section mt-10',
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
	</section>
{/if}

<style>
	.related-items-section {
		margin-top: var(--spacing-8);
		padding: var(--spacing-6);
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
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low, 0.08));
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low, 0.1));
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.related-items-section:hover {
		transform: var(--transform-lift-sm, translateY(-1px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-accent-rgb), 0.035) 50%,
			rgba(var(--color-highlight-rgb), 0.03) 100%
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-medium, 0.15));
	}

	.related-items-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-6);
		line-height: var(--line-height-tight);
		position: relative;
	}

	/* Elegant accent line under title matching other components */
	.related-items-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--spacing-2));
		left: 0;
		width: var(--spacing-16);
		height: var(--border-width-medium, 2px);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			rgba(var(--color-highlight-rgb), 0.3) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.related-items-section:hover .related-items-title::after {
		width: var(--spacing-20);
	}

	.related-items-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-4);
	}

	/* Dark mode refinements */
	:global(html.dark) .related-items-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.6) 0%,
			rgba(var(--color-primary-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.08);
	}

	:global(html.dark) .related-items-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.related-items-section {
			padding: var(--spacing-4);
		}

		.related-items-title {
			font-size: var(--font-size-lg);
		}
	}

	@media (min-width: 768px) {
		.related-items-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
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
