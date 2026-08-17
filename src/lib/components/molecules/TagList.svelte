<script lang="ts">
	import { base } from '$app/paths';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	let {
		tags = [],
		baseUrl = '/search?tag=', // Default base URL, can be overridden
		sectionTitle = 'Tags',
		showTitle = true
	}: {
		tags?: string[] | undefined | null;
		baseUrl?: string;
		sectionTitle?: string;
		showTitle?: boolean;
	} = $props();

	let visibleTags = $derived(tags?.filter((tag) => !!tag) ?? []);
</script>

{#if visibleTags.length > 0}
	<section class="tag-list-section">
		{#if showTitle}
			<h2 class="tag-list-title">{sectionTitle}</h2>
		{/if}
		<div class="tag-list chip-row">
			{#each visibleTags as tag (tag)}
				<!-- The label is typeset ("Côte d’Ivoire"); the href keeps the raw tag,
				     since that string is what the filter on the target page matches. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- tag search URL -->
				<a class="chip" href="{base}{baseUrl}{encodeURIComponent(tag)}">{typesetQuotes(tag)}</a>
			{/each}
		</div>
	</section>
{/if}

<style>
	.tag-list-section {
		margin-bottom: var(--space-lg);
	}

	/* Section label — the data voice: mono caps over a hairline. */
	.tag-list-title {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm) 0;
		padding-bottom: var(--space-2);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
		line-height: var(--line-height-snug);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	@media (prefers-reduced-motion: reduce) {
		.tag-list-section,
		.tag-list > :global(*) {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>
