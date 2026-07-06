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
	<section class="upcoming-section scroll-reveal">
		<div class="upcoming-header">
			<Icon icon="lucide:calendar" width="15" height="15" aria-hidden="true" />
			<span class="eyebrow upcoming-header-label">Upcoming Talks and Events</span>
		</div>

		<ul class="entity-list grid-stagger">
			{#each communications as communication, index (communication.id)}
				<CommunicationItem {communication} {index} />
			{/each}
		</ul>
	</section>
{/if}

<style>
	/* The upcoming block is a №-style section: a heavy accent rule marks it as
	 * the current/forthcoming record, a mono eyebrow labels it. */
	.upcoming-section {
		margin-bottom: var(--space-2xl);
		padding-top: var(--space-sm);
		border-top: var(--rule-section) solid var(--color-accent);
	}

	.upcoming-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-accent);
		margin-bottom: var(--space-lg);
	}

	/* .eyebrow already supplies the mono caps + accent; keep its margin reset. */
	.upcoming-header-label {
		margin: 0;
	}

	.entity-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* Close the block with a hairline rule under the last item. */
	.upcoming-section::after {
		content: '';
		display: block;
		margin-top: var(--space-lg);
		border-top: var(--rule-hairline) solid var(--color-border);
	}
</style>
