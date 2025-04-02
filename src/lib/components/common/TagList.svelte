<script lang="ts">
	import { base } from '$app/paths';

	export let tags: string[] = [];
	// Optional base URL for tag links (e.g., "/publications?tag=")
	export let tagLinkBaseUrl: string | undefined = undefined; 

	function encodeTag(tag: string): string {
		return encodeURIComponent(tag);
	}
</script>

{#if tags && tags.length > 0}
	<div class="tag-list flex flex-wrap gap-2">
		{#each tags as tag}
			{#if tagLinkBaseUrl}
				<a 
					href="{base}{tagLinkBaseUrl}{encodeTag(tag)}" 
					class="tag-link"
				>
					<span class="tag">{tag}</span>
				</a>
			{:else}
				<span class="tag">{tag}</span>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.tag {
		display: inline-block;
		padding: 0.2rem 0.6rem;
		font-size: var(--font-size-xs);
		background-color: var(--color-primary-light);
		color: var(--color-primary-dark);
		border-radius: var(--border-radius-full);
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.tag-link {
		text-decoration: none;
	}

	.tag-link:hover .tag {
		background-color: var(--color-primary);
		color: white;
	}
</style>