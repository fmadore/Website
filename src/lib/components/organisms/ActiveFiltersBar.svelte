<script lang="ts">
	import type { UniversalFilterConfig, FilterSectionConfig } from '$lib/types/filters';
	import { getFilterLabel } from '$lib/utils/filterHelpers';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';
	import Icon from '@iconify/svelte';
	// Filter styles (relocated from the global app.css). ActiveFiltersBar renders
	// outside the sidebar (publications, conference-activity), so import here too.
	import '$styles/components/filters.css';

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

	/* Label — the DATA voice: mono, letterspaced caps. */
	.active-filters-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		flex-shrink: 0;
	}

	.active-filters-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		align-items: center;
		flex: 1 1 auto;
	}

	/* Applied filter — a flat mono chip carrying an ✕. Square, hairline frame,
	 * no fill: the section label reads faint, the value in accent, so it stamps
	 * "this filter is on" without a coloured pill. */
	.active-filter-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-1) var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-soft);
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		cursor: pointer;
		line-height: var(--line-height-none);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.active-filter-chip:hover {
		border-color: var(--color-accent);
		color: var(--color-text-emphasis);
	}

	.active-filter-chip:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.chip-section {
		color: var(--color-text-muted);
	}

	.chip-divider {
		color: var(--color-text-muted);
	}

	.chip-value {
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent);
		max-width: 18ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.active-filter-chip .chip-remove) {
		margin-left: var(--space-2xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.active-filter-chip:hover :global(.chip-remove) {
		color: var(--color-accent);
	}

	/* Clear all — a mono-caps text action. */
	.active-filters-clear {
		padding: 0;
		margin-left: var(--space-xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.08em;
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
		color: var(--color-accent);
	}

	.active-filters-clear:focus-visible {
		outline: none;
		color: var(--color-accent);
		box-shadow: var(--focus-ring);
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
	}
</style>
