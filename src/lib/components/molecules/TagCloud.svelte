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
	let activeTagSet = $derived(
		activeTags instanceof Set ? activeTags : new Set(activeTags)
	);

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
				<a
					href={getTagHref ? getTagHref(tag) : '#'}
					class="tag-cloud-item"
					class:active={isActive}
					style="font-size: {getFontSize(frequency)}rem; opacity: {isActive ? 1 : getOpacity(frequency)}"
					title={getTitle(tag, frequency)}
					onclick={(e) => handleClick(e, tag)}
					role={ontagclick ? 'button' : undefined}
				>
					<span class="tag-name">{tag}</span>
					<span class="tag-count">({frequency})</span>
				</a>
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

	.tag-cloud-title {
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-body);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0 0 var(--space-sm) 0;
	}

	.tag-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		justify-content: flex-start;
		line-height: var(--line-height-relaxed);
	}

	.tag-cloud-item {
		display: inline-flex;
		align-items: center;
		white-space: normal;
		padding: var(--space-1) var(--space-2);
		color: var(--color-primary);
		text-decoration: none;
		border-radius: var(--border-radius-full);
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		background: color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent);
		font-weight: var(--font-weight-medium);
		line-height: 1.2;
		max-width: 100%;
	}

	.tag-name {
		margin-right: var(--space-1);
	}

	.tag-count {
		font-size: 0.85em;
		opacity: 0.7;
		font-weight: var(--font-weight-normal);
	}

	.tag-cloud-item:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		color: var(--color-primary-dark);
		transform: scale(1.05);
	}

	.tag-cloud-item.active {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
		color: var(--color-primary-dark);
		font-weight: var(--font-weight-semibold);
		box-shadow: 0 0 0 var(--border-width-thin) var(--color-primary);
	}

	.tag-cloud-item:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-1);
	}

	.no-tags {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Dark mode support */
	:global(html.dark) .tag-cloud-item {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
	}

	:global(html.dark) .tag-cloud-item:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
	}

	:global(html.dark) .tag-cloud-item.active {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
	}
</style>
