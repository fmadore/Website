<script lang="ts">
	// Detail card + previous/next navigation of the CareerTimeline —
	// split out of CareerTimeline.svelte.
	import { fly } from 'svelte/transition';
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
		return categoryIcons[category] || categoryIcons.default;
	}
</script>

<div class="detail-card surface-card" in:fly={{ y: 20, duration: 300 }}>
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
				<h3 class="detail-title">{item.title}</h3>
				<button class="close-btn-minimal" onclick={onclose} aria-label="Close">
					<Icon icon="lucide:x" width="18" height="18" />
				</button>
			</div>

			<div class="detail-meta-row">
				<span class="meta-badge" style="--_cat-color: {getCategoryColor(item.category)};">
					{item.startDate.getFullYear()}
					{#if item.endDate && item.endDate.getFullYear() !== item.startDate.getFullYear()}
						–{item.endDate.getFullYear()}
					{:else if item.isOngoing}
						–Present
					{/if}
				</span>
				<span class="meta-dot">•</span>
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
		border: 1px solid var(--color-border);
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
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
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
		border-radius: var(--border-radius-full);
		transition:
			color var(--duration-normal) var(--ease-out),
			background-color var(--duration-normal) var(--ease-out);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn-minimal:hover {
		color: var(--color-danger);
		background: color-mix(in srgb, var(--color-danger) 10%, transparent);
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
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		padding: var(--space-0-5) var(--space-2);
		border-radius: 0;
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--_cat-color, var(--color-accent)) 40%, transparent);
		background: color-mix(in srgb, var(--_cat-color, var(--color-accent)) 15%, transparent);
		color: var(--_cat-color, var(--color-accent));
		font-weight: var(--font-weight-medium);
	}

	.meta-dot {
		color: var(--color-text-muted);
		font-size: var(--space-2);
	}

	.detail-subtitle {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
	}

	.detail-description {
		font-size: var(--font-size-md);
		color: var(--color-text-light);
		line-height: 1.6;
		margin: 0;
	}

	.detail-navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-xl);
		border-top: 1px solid var(--color-border);
		background: color-mix(in srgb, var(--color-surface) 30%, transparent);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		padding: var(--space-2) var(--space-3);
		border-radius: 0;
		transition: all 0.2s ease;
	}

	.nav-btn:hover:not(:disabled) {
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 5%, transparent);
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nav-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		display: flex;
		align-items: baseline;
		gap: var(--space-1-5);
	}

	.nav-count .current {
		color: var(--color-text);
		font-weight: var(--font-weight-bold);
	}

	.nav-count .total {
		font-family: var(--font-family-mono);
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
		.close-btn-minimal,
		.detail-card {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
