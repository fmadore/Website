<script lang="ts">
	import type { MetaTag } from '$lib/utils/metaTags';

	// Shared renderer for the entity MetaTags components (publications,
	// communications, activities). Each caller computes its own MetaTag[]
	// and COinS string; this owns the identical head/COinS markup.
	let { tags, coins }: { tags: MetaTag[]; coins: string } = $props();
</script>

<svelte:head>
	{#each tags as tag, index (tag.name + tag.content + index)}
		<meta name={tag.name} content={tag.content} />
	{/each}
</svelte:head>

<!-- COinS metadata for Zotero compatibility -->
<span class="Z3988" title={coins} style="display: none;"></span>
