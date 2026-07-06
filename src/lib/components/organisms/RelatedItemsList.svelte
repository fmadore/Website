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
		gridClass = 'related-items-grid',
		sectionNumber = undefined
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
		/** Optional №-marker; when set, the heading renders as an Ink+Signal
		 * section head (№ NN + title) instead of a bare title. */
		sectionNumber?: string;
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
		{#if sectionNumber}
			<div class="section-head">
				<span class="section-no">№ {sectionNumber}</span>
				<h2 class={titleClass}>{title}</h2>
			</div>
		{:else}
			<h2 class={titleClass}>{title}</h2>
		{/if}
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

	.view-all-container {
		margin-top: var(--space-lg);
		text-align: left;
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
