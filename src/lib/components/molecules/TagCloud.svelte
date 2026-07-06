<script lang="ts">
	interface TagCloudProps {
		/** Array of [tagName, frequency] tuples, pre-sorted by frequency descending */
		tags: [string, number][];
		/** Maximum number of tags to display */
		maxTags?: number;
		/** Singular noun for the tooltip (e.g. "activity", "publication") */
		itemLabel?: string;
		/** Plural noun for the tooltip (e.g. "activities", "publications") */
		itemLabelPlural?: string;
		/** Title displayed above the tag cloud */
		title?: string;
		/** Callback when a tag is clicked. If not provided, tags are not interactive. */
		ontagclick?: (tag: string) => void;
		/** Optional href builder for tags. If provided, tags render as links. */
		getTagHref?: (tag: string) => string;
		/** Set of currently active/selected tags (for highlighting) */
		activeTags?: Set<string> | string[];
	}

	let {
		tags,
		maxTags = 20,
		itemLabel = 'item',
		itemLabelPlural = 'items',
		title = 'Explore by Tags',
		ontagclick,
		getTagHref,
		activeTags = []
	}: TagCloudProps = $props();

	// Limit to maxTags
	let displayTags = $derived(tags.slice(0, maxTags));

	// Calculate min and max frequencies for scaling
	let frequencyStats = $derived.by(() => {
		const frequencies = displayTags.map(([, freq]) => freq);
		return {
			minFreq: Math.min(...frequencies, 1),
			maxFreq: Math.max(...frequencies, 1)
		};
	});

	// Normalize active tags to a Set for O(1) lookup
	let activeTagSet = $derived(activeTags instanceof Set ? activeTags : new Set(activeTags));

	function getFontSize(frequency: number): number {
		const { minFreq, maxFreq } = frequencyStats;
		const range = maxFreq - minFreq;
		if (range === 0) return 0.85;
		const normalized = (frequency - minFreq) / range;
		return 0.8 + normalized * 0.3;
	}

	function getOpacity(frequency: number): number {
		const { minFreq, maxFreq } = frequencyStats;
		const range = maxFreq - minFreq;
		if (range === 0) return 1;
		const normalized = (frequency - minFreq) / range;
		return 0.6 + normalized * 0.4;
	}

	function getTitle(tag: string, frequency: number): string {
		const label = frequency === 1 ? itemLabel : itemLabelPlural;
		return `${tag} (${frequency} ${label})`;
	}

	function handleClick(event: MouseEvent, tag: string) {
		if (ontagclick) {
			event.preventDefault();
			ontagclick(tag);
		}
	}
</script>

<div class="tag-cloud-container scroll-reveal">
	<h3 class="tag-cloud-title">{title}</h3>
	{#if displayTags.length > 0}
		<div class="tag-cloud">
			{#each displayTags as [tag, frequency] (tag)}
				{@const isActive = activeTagSet.has(tag)}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- href from callback or anchor-only -->
				<a
					href={getTagHref ? getTagHref(tag) : '#'}
					class="tag-cloud-item"
					class:active={isActive}
					style="font-size: {getFontSize(frequency)}rem; opacity: {isActive
						? 1
						: getOpacity(frequency)}"
					title={getTitle(tag, frequency)}
					onclick={(e) => handleClick(e, tag)}
					role={ontagclick ? 'button' : undefined}
				>
					<span class="tag-name">{tag}</span>
					<span class="tag-count">({frequency})</span>
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/each}
		</div>
	{:else}
		<p class="no-tags">No tags available</p>
	{/if}
</div>

<style>
	.tag-cloud-container {
		padding-top: 0;
	}

	/* Title — the DATA voice: mono, letterspaced caps, faint ink. */
	.tag-cloud-title {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-snug);
		color: var(--color-text-emphasis);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		margin: 0 0 var(--space-sm) 0;
	}

	/* A frequency-scaled term cloud (real data as ornament): serif terms, no
	 * pills, no boxes — size carries weight. Sits like a key-terms list. */
	.tag-cloud {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: flex-start;
		column-gap: var(--space-3);
		row-gap: var(--space-1-5);
		line-height: 1.25;
	}

	.tag-cloud-item {
		display: inline-flex;
		align-items: baseline;
		white-space: normal;
		color: var(--color-text-soft);
		text-decoration: none;
		font-family: var(--font-family-serif);
		transition: color var(--duration-fast) var(--ease-out);
		line-height: 1.2;
		max-width: 100%;
		/* font-size is set inline, frequency-scaled */
	}

	.tag-name {
		margin-right: var(--space-1);
	}

	/* Count — a small mono figure trailing the term, in the data voice. */
	.tag-count {
		font-family: var(--font-family-mono);
		font-size: 0.62em;
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.tag-cloud-item:hover {
		color: var(--color-accent);
	}

	/* Selected term — pine, the accent marking the active filter. */
	.tag-cloud-item.active {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	.tag-cloud-item.active .tag-count {
		color: color-mix(in srgb, var(--color-accent) 70%, transparent);
	}

	.tag-cloud-item:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
	}

	.no-tags {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-style: italic;
	}

	@media (prefers-reduced-motion: reduce) {
		.tag-cloud-item {
			transition: none;
		}
	}
</style>
