<script lang="ts">
	import type { UniversalFilterConfig, FilterSectionConfig } from '$lib/types/filters';
	import { getFilterLabel } from '$lib/utils/filterHelpers';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';
	import Icon from '@iconify/svelte';

	interface ActiveFilterChip {
		key: string;
		sectionTitle: string;
		label: string;
		remove: () => void;
	}

	interface Props {
		config: UniversalFilterConfig;
	}

	let { config }: Props = $props();

	const FADE_IN_DURATION = 200;

	function chipsForSection(section: FilterSectionConfig): ActiveFilterChip[] {
		if (section.type === 'range') {
			if (!section.activeRange) return [];
			const { min, max } = section.activeRange;
			const label = min === max ? `${min}` : `${min}–${max}`;
			return [
				{
					key: `${section.title}:range`,
					sectionTitle: section.title,
					label,
					remove: () => section.resetRange()
				}
			];
		}

		if (!section.activeItems || section.activeItems.length === 0) return [];

		return section.activeItems.map((item: string) => ({
			key: `${section.title}:${item}`,
			sectionTitle: section.title,
			label: getFilterLabel(section.itemLabels, item),
			remove: () => section.toggleItem(item)
		}));
	}

	const chips = $derived.by(() => {
		const out: ActiveFilterChip[] = [];
		for (const section of config?.sections ?? []) {
			out.push(...chipsForSection(section));
		}
		return out;
	});
	const hasActive = $derived(chips.length > 0);
</script>

{#if hasActive}
	<div class="active-filters-bar">
		<span class="active-filters-label">Active filters</span>
		<div class="active-filters-chips">
			{#each chips as chip (chip.key)}
				<button
					type="button"
					class="active-filter-chip"
					title="Remove {chip.sectionTitle}: {chip.label}"
					onclick={chip.remove}
					in:fade={{ duration: motionDuration(FADE_IN_DURATION), easing: cubicOut }}
				>
					<span class="chip-section">{chip.sectionTitle}</span>
					<span class="chip-divider" aria-hidden="true">·</span>
					<span class="chip-value">{chip.label}</span>
					<Icon icon="lucide:x" width="14" height="14" class="chip-remove" aria-hidden="true" />
				</button>
			{/each}
			<button type="button" class="active-filters-clear" onclick={() => config.clearAllFilters()}>
				Clear all
			</button>
		</div>
	</div>
{/if}

<style>
	.active-filters-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-sm) var(--space-md);
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-sm);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) 60%, transparent);
	}

	.active-filters-label {
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		flex-shrink: 0;
	}

	.active-filters-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		align-items: center;
		flex: 1 1 auto;
	}

	.active-filter-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-2xs) var(--space-xs) var(--space-2xs) var(--space-sm);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-primary) 25%, transparent);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		line-height: var(--line-height-none);
		transform: scale(1);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.active-filter-chip:hover {
		background: color-mix(in srgb, var(--color-primary) 16%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
		color: var(--color-primary-dark);
	}

	.active-filter-chip:active {
		transform: scale(0.96);
		transition-duration: var(--duration-instant);
	}

	.active-filter-chip:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.chip-section {
		opacity: 0.75;
		font-weight: var(--font-weight-medium);
	}

	.chip-divider {
		opacity: 0.4;
	}

	.chip-value {
		font-weight: var(--font-weight-semibold);
		max-width: 18ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.active-filter-chip .chip-remove) {
		margin-left: var(--space-2xs);
		opacity: 0.65;
		flex-shrink: 0;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.active-filter-chip:hover :global(.chip-remove) {
		opacity: 1;
	}

	.active-filters-clear {
		padding: 0;
		margin-left: var(--space-xs);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 3px;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.active-filters-clear:hover {
		color: var(--color-primary);
	}

	.active-filters-clear:focus-visible {
		outline: none;
		color: var(--color-primary);
		box-shadow: var(--focus-ring);
		border-radius: var(--border-radius-sm);
	}

	/* Dark mode — slightly stronger primary tint to read against the warm dusk surface */
	:global(html.dark) .active-filter-chip {
		background: color-mix(in srgb, var(--color-primary) 14%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
		color: var(--color-primary-light);
	}

	:global(html.dark) .active-filter-chip:hover {
		background: color-mix(in srgb, var(--color-primary) 22%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 55%, transparent);
		color: var(--color-primary-lighter);
	}

	@media (--sm-down) {
		.active-filters-bar {
			gap: var(--space-xs) var(--space-sm);
		}

		.chip-value {
			max-width: 14ch;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.active-filter-chip {
			transition: none;
		}

		.active-filter-chip:active {
			transform: none;
		}
	}
</style>
