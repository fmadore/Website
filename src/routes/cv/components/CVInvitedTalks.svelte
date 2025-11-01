<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '../utils/cvFormatters';

	const invitedTalks = communicationsByDate.filter(
		(comm) => comm.type === 'lecture' || comm.type === 'seminar' || comm.type === 'workshop'
	);
</script>

{#if invitedTalks.length > 0}
	<section>
		<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Invited Talks</h3>
		<div class="space-y-3">
			{#each invitedTalks as comm (comm.id)}
				{@const commDate = new Date(comm.dateISO)}
				{@const formattedAuthors = formatCVAuthorList(comm.authors)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{commDate.getFullYear()}</div>
					<div class="flex-1">
						{#if formattedAuthors}{@html formattedAuthors}. {/if}
						"{comm.title}"{#if comm.conference}, <em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}, {commDate.toLocaleDateString(
							'en-GB',
							{
								day: 'numeric',
								month: 'long'
							}
						)}.
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
