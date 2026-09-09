<script lang="ts">
	// Detail card + previous/next navigation of the CareerTimeline —
	// split out of CareerTimeline.svelte.
	import Icon from '@iconify/svelte';
	import { type TimelineItem, getCategoryColor, getCategoryLabel } from '$lib/types/timeline';
	import { getContrastLabelStyle, resolveColor } from '$lib/utils/chartColorUtils';
	import { getTheme } from '$lib/stores/themeStore.svelte';

	interface Props {
		item: TimelineItem;
		/** Position of the item in the full timeline (0-based). */
		index: number;
		total: number;
		onprevious: () => void;
		onnext: () => void;
		onclose: () => void;
	}

	let { item, index, total, onprevious, onnext, onclose }: Props = $props();

	// Contrast-aware ink/paper icon color for the category tile (no hardcoded
	// white). Tracks the theme so the resolved --color-timeline-* value is
	// re-read when daylight/midnight toggles.
	const iconColorOnCategory = $derived.by(() => {
		void getTheme();
		return getContrastLabelStyle(resolveColor(getCategoryColor(item.category))).color;
	});

	// Category Icons Mapping
	const categoryIcons: Record<string, string> = {
		positions: 'lucide:briefcase',
		education: 'lucide:graduation-cap',
		grants: 'lucide:coins',
		publications: 'lucide:file-text',
		presentations: 'lucide:presentation',
		awards: 'lucide:award',
		fieldwork: 'lucide:map-pin',
		default: 'lucide:circle'
	};

	function getIconForCategory(category: string): string {
		return categoryIcons[category] || categoryIcons.default || 'lucide:circle';
	}
</script>

<div class="detail-card surface-card">
	<!-- Category Icon & Header -->
	<div class="card-content-wrapper">
		<div class="category-icon-large" style="--_cat-color: {getCategoryColor(item.category)};">
			<Icon
				icon={getIconForCategory(item.category)}
				width="28"
				height="28"
				color={iconColorOnCategory}
			/>
		</div>

		<div class="card-main-info">
			<div class="card-header-row">
				<h2 class="detail-title">{item.title}</h2>
				<button class="close-btn-minimal" onclick={onclose} aria-label="Close">
					<Icon icon="lucide:x" width="18" height="18" />
				</button>
			</div>

			<div class="detail-meta-row">
				<!-- The badge text stays in ink; the category colour rides a swatch
				     beside it, so no string wears a series colour. -->
				<span class="meta-badge">
					<span
						class="meta-swatch"
						style="--_cat-color: {getCategoryColor(item.category)};"
						aria-hidden="true"
					></span>
					{item.startDate.getFullYear()}
					{#if item.endDate && item.endDate.getFullYear() !== item.startDate.getFullYear()}
						–{item.endDate.getFullYear()}
					{:else if item.isOngoing}
						–Present
					{/if}
				</span>
				<span class="meta-dot" aria-hidden="true">•</span>
				<span class="detail-subtitle">{item.subtitle || getCategoryLabel(item.category)}</span>
			</div>

			{#if item.description}
				<p class="detail-description">{item.description}</p>
			{/if}
		</div>
	</div>

	<!-- Navigation Footer -->
	<div class="detail-navigation">
		<button class="nav-btn previous" onclick={onprevious} disabled={index === 0}>
			<Icon icon="lucide:chevron-left" width="18" height="18" />
			<span>Previous</span>
		</button>

		<span class="nav-count">
			<span class="current">{index + 1}</span>
			<span class="separator">of</span>
			<span class="total">{total}</span>
		</span>

		<button class="nav-btn next" onclick={onnext} disabled={index === total - 1}>
			<span>Next</span>
			<Icon icon="lucide:chevron-right" width="18" height="18" />
		</button>
	</div>
</div>

<style>
	/* Detail Card */
	/* Flat archival panel — override the .surface-card global so the detail
	   card reads as a printed plate: square, hairline, no glass, no shadow. */
	.detail-card {
		position: relative;
		border-radius: 0;
		margin-top: var(--space-md);
		border: var(--border-width-thin) solid var(--color-border);
		overflow: hidden;
		background: var(--color-surface-elevated);
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
	}

	.card-content-wrapper {
		padding: var(--space-xl);
		display: flex;
		gap: var(--space-lg);
		align-items: flex-start;
	}

	.category-icon-large {
		width: var(--space-14);
		height: var(--space-14);
		border-radius: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		/*
		 * --_cat-color is set inline per item (e.g. var(--color-timeline-positions)).
		 * Flat category-coloured tile, no glow — Ink + Signal.
		 */
		background: var(--_cat-color, var(--color-accent));
	}

	.card-main-info {
		flex: 1;
		min-width: 0; /* Prevent flex blowout */
	}

	.card-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-md);
		margin-bottom: var(--space-xs);
	}

	.detail-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-title);
		color: var(--color-text);
		margin: 0;
		line-height: 1.3;
	}

	.close-btn-minimal {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-1);
		margin: calc(-1 * var(--space-1)) calc(-1 * var(--space-1)) 0 0;
		/* Square, and no smaller than the 24px target floor. */
		border-radius: 0;
		min-width: var(--space-6);
		min-height: var(--space-6);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn-minimal:hover {
		color: var(--color-text-emphasis);
		background: var(--color-surface-alt);
	}

	.close-btn-minimal:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.detail-meta-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.meta-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-figures);
		padding: var(--space-0-5) var(--space-2);
		border-radius: 0;
		border: var(--border-width-thin) solid var(--color-border);
		color: var(--color-text-soft);
		font-weight: var(--font-weight-medium);
	}

	.meta-swatch {
		width: var(--space-2);
		height: var(--space-2);
		flex: none;
		background: var(--_cat-color, var(--color-accent));
	}

	.meta-dot {
		color: var(--color-text-muted);
		font-size: var(--space-2);
	}

	.detail-subtitle {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.detail-description {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
		line-height: 1.6;
		max-width: var(--measure-prose);
		margin: 0;
	}

	.detail-navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-xl);
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-caps);
		padding: var(--space-2) var(--space-3);
		border-radius: 0;
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.nav-btn:hover:not(:disabled) {
		color: var(--color-text-emphasis);
		background: var(--color-surface-alt);
	}

	.nav-btn:disabled {
		color: var(--color-text-light);
		cursor: not-allowed;
	}

	.nav-count {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
		display: flex;
		align-items: baseline;
		gap: var(--space-1-5);
	}

	.nav-count .current {
		color: var(--color-text-emphasis);
		font-weight: var(--font-weight-bold);
	}

	/* Mobile Optimizations */
	@media (--md-down) {
		.card-content-wrapper {
			flex-direction: column;
			gap: var(--space-md);
		}

		.category-icon-large {
			width: var(--space-12);
			height: var(--space-12);
		}

		.card-header-row {
			margin-top: var(--space-xs);
		}

		.detail-navigation {
			padding: var(--space-md);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.nav-btn,
		.close-btn-minimal {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
