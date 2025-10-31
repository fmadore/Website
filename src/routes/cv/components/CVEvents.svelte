<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '../utils/cvFormatters';

	const organizedEvents = communicationsByDate.filter((comm) => comm.type === 'event');
</script>

{#if organizedEvents.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">
			Organization of Academic Events
		</h3>
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
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{commDate.getFullYear()}</div>
					<div class="flex-1">
						{#if formattedAuthors}{@html formattedAuthors}. {/if}
						"{comm.title}"{#if comm.location}, {comm.location}{/if}, {dateDisplay}.
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
