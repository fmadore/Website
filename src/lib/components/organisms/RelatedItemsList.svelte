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
	<section class="{sectionClass} scroll-reveal">
		<h2 class={titleClass}>{title}</h2>
		<div class="{gridClass} grid-stagger">
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
		margin-top: var(--space-xl);
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Sophisticated glassmorphism effect matching other components */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent);
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	@media (--sm) {
		.related-items-section {
			padding: var(--space-xl);
		}
	}

	.related-items-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
	}

	.related-items-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
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
		bottom: calc(-1 * var(--space-sm));
		left: 0;
		width: var(--space-3xl);
		height: var(--border-width-medium);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			color-mix(in srgb, var(--color-highlight) 30%, transparent) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.related-items-section:hover .related-items-title::after {
		width: var(--space-5xl);
	}

	.related-items-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	.view-all-container {
		margin-top: var(--space-lg);
		text-align: center;
	}

	/* Dark mode refinements */
	:global(html.dark) .related-items-section {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 6%, transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	:global(html.dark) .related-items-section:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 6%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 8%, transparent) 100%
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
