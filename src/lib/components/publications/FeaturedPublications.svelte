<script lang="ts">
	import type { Publication } from '$lib/types';
	import PublicationItem from './PublicationItem.svelte';

	let {
		publications = [],
		onfilterrequest
	}: {
		publications: Publication[];
		onfilterrequest?: (event: { type: string; value: string }) => void;
	} = $props();
</script>

{#if publications.length > 0}
	<div class="featured-section scroll-reveal">
		<p class="eyebrow featured-header">Featured</p>

		<ul class="entity-list grid-stagger">
			{#each publications as publication, index (publication.id)}
				<PublicationItem {publication} {onfilterrequest} {index} />
			{/each}
		</ul>
	</div>
{/if}

<style>
	/* Featured block — content on paper. The section marker is the accent
	 * mono eyebrow (.eyebrow); a hairline rule under the block closes it,
	 * separating the curated lead from the long bibliography that follows. */
	.featured-section {
		margin-bottom: var(--space-8);
	}

	.featured-header {
		/* .eyebrow supplies the mono accent kicker; only the spacing is local. */
		margin-bottom: var(--space-4);
	}

	.entity-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* Close the featured block with a full ink hairline, not a fading gradient. */
	.featured-section::after {
		content: '';
		display: block;
		margin-top: var(--space-8);
		height: var(--rule-hairline);
		background: var(--color-border);
	}
</style>
