<script lang="ts">
	import type { CommunicationSummary } from '$lib/types/communication';
	import CommunicationItem from './CommunicationItem.svelte';
	import Icon from '@iconify/svelte';

	let {
		communications = []
	}: {
		communications: CommunicationSummary[];
	} = $props();

	// The hanging year is printed once per year-group, exactly as the record
	// below does it — a forthcoming block that straddles a new year would
	// otherwise stamp the same figure on every row.
	const rows = $derived.by(() => {
		let lastYear: number | null = null;
		return communications.map((communication) => {
			const showYear = communication.year !== lastYear;
			lastYear = communication.year ?? null;
			return { communication, yearLabel: showYear ? (communication.year ?? null) : null };
		});
	});
</script>

{#if communications.length > 0}
	<section class="upcoming-section">
		<div class="upcoming-header">
			<Icon icon="lucide:calendar" width="15" height="15" aria-hidden="true" />
			<h2 class="eyebrow upcoming-header-label">Upcoming</h2>
		</div>

		<!-- The same finding-aid rows the record below prints, with the hanging
		     year filled once per year-group: a forthcoming talk is the same kind
		     of entry as a past one, and setting it as a tile instead cost 703px
		     per entry on a phone against 350 for a row. What marks it as current
		     is the block's pine rule, not a different idiom. -->
		<ol class="bib-list">
			{#each rows as { communication, yearLabel }, index (communication.id)}
				<li class="bib-item">
					<CommunicationItem {communication} {yearLabel} {index} />
				</li>
			{/each}
		</ol>
	</section>
{/if}

<style>
	/* The upcoming block is a ruled section: a heavy accent rule marks it as
	 * the current/forthcoming record, a mono eyebrow labels it. */
	.upcoming-section {
		margin-bottom: var(--space-2xl);
		padding-top: var(--rule-gap);
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

	/* Close the block with a hairline rule under the last item. */
	.upcoming-section::after {
		content: '';
		display: block;
		margin-top: var(--space-lg);
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}
</style>
