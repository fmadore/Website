<script lang="ts">
	import { base } from '$app/paths';

	let {
		tags = [],
		baseUrl = '/search?tag=', // Default base URL, can be overridden
		sectionTitle = 'Tags',
		titleClass = 'text-lg font-semibold mb-2',
		listClass = 'flex flex-wrap gap-2',
		tagLinkClass = 'tag-link text-sm px-3 py-1 rounded-full', // Re-uses existing style
		sectionClass = 'mb-6'
	}: {
		tags?: string[] | undefined | null;
		baseUrl?: string;
		sectionTitle?: string;
		titleClass?: string;
		listClass?: string;
		tagLinkClass?: string;
		sectionClass?: string;
	} = $props();

	let visibleTags = $derived(tags?.filter((tag) => !!tag) ?? []);
</script>

{#if visibleTags.length > 0}
	<section class={sectionClass}>
		<h2 class={titleClass}>{sectionTitle}</h2>
		<div class={listClass}>
			{#each visibleTags as tag}
				<a href="{base}{baseUrl}{encodeURIComponent(tag)}" class={tagLinkClass}>
					{tag}
				</a>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Style for tag-link can be kept in the global stylesheet 
       or defined here if needed for component-specific overrides. 
       Using the one from the page for now. */
	.tag-link {
		background-color: var(--color-border);
		color: var(--color-text-light);
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		text-decoration: none;
	}
	.tag-link:hover {
		background-color: var(--color-primary);
		color: var(--color-background);
	}
</style>
