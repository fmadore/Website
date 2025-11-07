<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import CommunicationItem from './CommunicationItem.svelte';
	import Icon from '@iconify/svelte';

	let {
		communications = []
	}: {
		communications: Communication[];
	} = $props();
</script>

{#if communications.length > 0}
	<div class="upcoming-section">
		<div class="upcoming-header">
			<Icon icon="lucide:calendar" width="20" height="20" />
			<span>Upcoming Talks and Events</span>
		</div>

		<ul class="entity-list">
			{#each communications as communication, index (communication.id)}
				<CommunicationItem {communication} {index} />
			{/each}
		</ul>
	</div>
{/if}

<style>
	.upcoming-section {
		margin-bottom: var(--spacing-8);
	}

	.upcoming-header {
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

	/* Add a subtle visual separator after upcoming section */
	.upcoming-section::after {
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
	:global(html.dark) .upcoming-header {
		color: var(--color-highlight);
	}

	:global(html.dark) .upcoming-section::after {
		background: linear-gradient(
			to right,
			transparent,
			rgba(var(--color-primary-rgb), 0.2) 20%,
			rgba(var(--color-primary-rgb), 0.2) 80%,
			transparent
		);
	}
</style>
