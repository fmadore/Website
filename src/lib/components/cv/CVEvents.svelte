<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '$lib/utils/cvFormatters';
	import CVEntry from './CVEntry.svelte';

	const organizedEvents = communicationsByDate.filter((comm) => comm.type === 'event');
</script>

{#if organizedEvents.length > 0}
	<section>
		<h3>Organization of Academic Events</h3>
		<div class="space-y-3">
			{#each organizedEvents as comm (comm.id)}
				{@const commDate = new Date(comm.dateISO)}
				{@const formattedAuthors = formatCVAuthorList(comm.authors)}
				{@const dateDisplay = comm.date.includes('-')
					? comm.date.replace(/\s+\d{4}$/, '')
					: commDate.toLocaleDateString('en-GB', {
							day: 'numeric',
							month: 'long'
						})}
				<CVEntry year={commDate.getFullYear()}>
					{#if formattedAuthors}{@html formattedAuthors}. {/if}
					"{comm.title}"{#if comm.location}, {comm.location}{/if}, {dateDisplay}.
				</CVEntry>
			{/each}
		</div>
	</section>
{/if}
