<script lang="ts">
	// Hover tooltip of the CareerTimeline — split out of CareerTimeline.svelte.
	import { fade } from 'svelte/transition';
	import { type TimelineItem, getCategoryColor, getCategoryLabel } from '$lib/types/timeline';

	interface Props {
		item: TimelineItem;
		x: number;
		y: number;
		/** Flips below the mark when there is no room above it. */
		placement?: 'above' | 'below';
	}

	let { item, x, y, placement = 'above' }: Props = $props();

	/**
	 * Built in one expression so the en dash stays closed up: split across
	 * template lines, Svelte's whitespace handling rendered "2018 –2020".
	 */
	const formatRange = (entry: TimelineItem): string => {
		const start = entry.startDate.getFullYear();
		const end = entry.endDate?.getFullYear();
		if (end !== undefined && end !== start) return `${start}–${end}`;
		if (entry.isOngoing) return `${start}–present`;
		return String(start);
	};
</script>

<div
	class="tooltip-card"
	class:below={placement === 'below'}
	style="transform: translate({x}px, {y}px);"
	transition:fade={{ duration: 150 }}
>
	<div class="tooltip-header">
		<span
			class="tooltip-category-indicator"
			style="background-color: {getCategoryColor(item.category)}"
		></span>
		<span class="tooltip-category">{getCategoryLabel(item.category)}</span>
	</div>
	<div class="tooltip-title">{item.title}</div>
	{#if item.subtitle}
		<div class="tooltip-subtitle">{item.subtitle}</div>
	{/if}
	<div class="tooltip-date">{formatRange(item)}</div>
</div>

<style>
	.tooltip-card {
		position: absolute;
		top: 0;
		left: 0;
		z-index: var(--z-tooltip);
		pointer-events: none;
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		padding: var(--space-3);
		min-width: 200px;
		max-width: 300px;
		transform: translate(-50%, -100%);
		margin-top: calc(-1 * var(--space-3));
	}

	.tooltip-card.below {
		transform: translate(-50%, 0);
		margin-top: var(--space-5);
	}

	.tooltip-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	/* Square swatch: the category colour is a data mark, not a dot ornament. */
	.tooltip-category-indicator {
		width: var(--space-2);
		height: var(--space-2);
		flex: none;
	}

	.tooltip-category {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
		color: var(--color-text-light);
	}

	.tooltip-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
		margin-bottom: var(--space-1);
		line-height: var(--line-height-tight);
	}

	.tooltip-subtitle {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xs);
		color: var(--color-text-light);
		margin-bottom: var(--space-1);
	}

	.tooltip-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-soft);
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	@media (prefers-reduced-motion: reduce) {
		.tooltip-card {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
