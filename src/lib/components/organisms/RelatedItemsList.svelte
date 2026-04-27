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
		titleClass = 'related-items-title',
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
	<section class="{sectionClass} glass-section-panel scroll-reveal">
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
	}

	@media (--sm) {
		.related-items-section {
			padding: var(--space-xl);
		}
	}

	.related-items-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		/* Reset global h2 margin-top so the title doesn't push the tile content
		 * down by 48 px. The panel's own padding provides the breathing room. */
		margin: 0 0 var(--space-lg) 0;
		line-height: var(--line-height-tight);
		position: relative;
	}

	@media (--sm) {
		.related-items-title {
			font-size: var(--font-size-xl);
		}
	}

	/* Quiet hairline rule under the title — replaces the highlight-gradient
	 * underline that expanded on hover. Editorial rhythm, no decorative gloss. */
	.related-items-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-xs));
		left: 0;
		width: var(--space-2xl);
		height: var(--border-width-thin);
		background: var(--color-border-dark);
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
