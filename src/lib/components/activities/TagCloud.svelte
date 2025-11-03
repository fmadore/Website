<script lang="ts">
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';

	interface TagCloudProps {
		activities: Activity[];
		maxTags?: number;
	}

	let { activities, maxTags = 20 }: TagCloudProps = $props();

	// Calculate tag frequencies using $derived
	let tagFrequency = $derived(() => {
		const freq = new Map<string, number>();
		activities.forEach((activity: Activity) => {
			if (activity.tags) {
				activity.tags.forEach((tag: string) => {
					freq.set(tag, (freq.get(tag) || 0) + 1);
				});
			}
		});
		return freq;
	});

	// Sort tags by frequency and limit to maxTags using $derived
	let sortedTags = $derived(() => {
		const tags = Array.from(tagFrequency().entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, maxTags);
		return tags;
	});

	// Calculate min and max frequencies for scaling using $derived
	let frequencyStats = $derived(() => {
		const frequencies = sortedTags().map(([, freq]) => freq);
		return {
			minFreq: Math.min(...frequencies, 1),
			maxFreq: Math.max(...frequencies, 1)
		};
	});

	// Function to calculate font size based on frequency
	function getFontSize(frequency: number): number {
		const { minFreq, maxFreq } = frequencyStats();
		const range = maxFreq - minFreq;
		if (range === 0) return 1; // All tags have same frequency
		const normalized = (frequency - minFreq) / range;
		// Scale between 0.75rem (small) and 1.5rem (large)
		return 0.75 + normalized * 0.75;
	}

	// Function to calculate opacity based on frequency
	function getOpacity(frequency: number): number {
		const { minFreq, maxFreq } = frequencyStats();
		const range = maxFreq - minFreq;
		if (range === 0) return 1;
		const normalized = (frequency - minFreq) / range;
		// Scale between 0.6 (light) and 1 (full)
		return 0.6 + normalized * 0.4;
	}
</script>

<div class="tag-cloud-container">
	<h3 class="tag-cloud-title">Explore by Tags</h3>
	{#if sortedTags().length > 0}
		<div class="tag-cloud">
			{#each sortedTags() as [tag, frequency] (tag)}
				<a
					href="{base}/activities?tag={encodeURIComponent(tag)}"
					class="tag-cloud-item"
					style="font-size: {getFontSize(frequency)}rem; opacity: {getOpacity(frequency)}"
					title="{tag} ({frequency} {frequency === 1 ? 'activity' : 'activities'})"
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
		margin-top: var(--spacing-8);
	}

	.tag-cloud-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin-top: 0;
		margin-bottom: var(--spacing-4);
		padding-bottom: var(--spacing-2);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	.tag-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
		align-items: center;
		justify-content: flex-start;
		line-height: var(--line-height-relaxed);
	}

	.tag-cloud-item {
		display: inline-block;
		padding: var(--spacing-1) var(--spacing-2);
		color: var(--color-primary);
		text-decoration: none;
		border-radius: var(--border-radius-md);
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		background: rgba(var(--color-primary-rgb), var(--opacity-5));
		font-weight: var(--font-weight-medium);
	}

	.tag-name {
		margin-right: var(--spacing-1);
	}

	.tag-count {
		font-size: 0.85em;
		opacity: 0.7;
		font-weight: var(--font-weight-normal);
	}

	.tag-cloud-item:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-10));
		color: var(--color-primary-dark);
		transform: scale(1.05);
	}

	.tag-cloud-item:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--spacing-1);
	}

	.no-tags {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Dark mode support */
	:global(html.dark) .tag-cloud-item {
		background: rgba(var(--color-primary-rgb), var(--opacity-10));
	}

	:global(html.dark) .tag-cloud-item:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-20));
	}
</style>
