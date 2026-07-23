<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';
	import Button from '$lib/components/atoms/Button.svelte';

	const FADE_DURATION = 220;

	interface RelatedListItem {
		id: string | number;
		[key: string]: unknown;
	}

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
		titleClass = 'editorial-section-title',
		gridClass = 'related-items-grid'
	}: {
		allItems?: RelatedListItem[];
		currentItemId: string | number;
		filterKey: string;
		filterValue: string | number | undefined;
		title: string;
		itemComponent: ComponentType;
		baseItemUrl: string;
		viewAllUrl?: string;
		maxItems?: number;
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
				<div in:fade={{ duration: motionDuration(FADE_DURATION), easing: cubicOut }}>
					<ItemComponent {item} itemUrl={`${baseItemUrl}${item.id}`} />
				</div>
			{/each}
		</div>

		{#if viewAllLink}
			<div class="view-all-container">
				<Button href={viewAllLink} variant="outline-secondary" size="base">View all →</Button>
			</div>
		{/if}
	</section>
{/if}

<style>
	/* Content-on-paper section; related-item cards carry their own chrome. */
	.related-items-section {
		margin-top: var(--space-2xl);
	}

	/* Section title uses the shared .editorial-section-title utility
	 * (typography.css) so this section's heading matches Reviews, Cited By, and
	 * the other detail-page sections — the previous bespoke .related-items-title
	 * added a second short accent rule that read as disconnected. */

	.related-items-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	/* Hairline-ruled footer row; formerly split with the global panels.css
	 * .view-all-container rule (now route-scoped to the panel components). */
	.view-all-container {
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		border-top: var(--border-width-thin) solid var(--color-border-light);
		text-align: left;
	}

	.view-all-container :global(.btn) {
		display: flex;
		width: 100%;
		justify-content: center;
		white-space: normal;
		text-align: center;
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
</style>
