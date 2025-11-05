<script lang="ts">
	import type { Publication } from '$lib/types';
	import PublicationItem from './PublicationItem.svelte';
	import Icon from '@iconify/svelte';

	let {
		publications = [],
		onfilterrequest
	}: {
		publications: Publication[];
		onfilterrequest?: (event: { type: string; value: string }) => void;
	} = $props();
</script>

{#if publications.length > 0}
	<div class="featured-section">
		<div class="featured-header">
			<Icon icon="lucide:star" width="20" height="20" />
			<span>Featured Publications</span>
		</div>

		<ul class="entity-list">
			{#each publications as publication, index (publication.id)}
				<li class="entity-list-item">
					<PublicationItem {publication} {onfilterrequest} {index} />
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.featured-section {
		margin-bottom: var(--spacing-8);
	}

	.featured-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		color: var(--color-accent);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		margin-bottom: var(--spacing-4);
		padding-left: var(--spacing-1);
	}

	.entity-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.entity-list-item {
		margin-bottom: var(--spacing-6);
	}

	/* Add a subtle visual separator after featured section */
	.featured-section::after {
		content: '';
		display: block;
		margin-top: var(--spacing-8);
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			rgba(var(--color-primary-rgb), 0.1) 20%,
			rgba(var(--color-primary-rgb), 0.1) 80%,
			transparent
		);
	}

	/* Dark mode adjustments */
	:global(html.dark) .featured-header {
		color: var(--color-highlight);
	}

	:global(html.dark) .featured-section::after {
		background: linear-gradient(
			to right,
			transparent,
			rgba(var(--color-primary-rgb), 0.2) 20%,
			rgba(var(--color-primary-rgb), 0.2) 80%,
			transparent
		);
	}
</style>
