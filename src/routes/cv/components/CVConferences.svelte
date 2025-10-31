<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';
	import { formatCVAuthorList } from '../utils/cvFormatters';

	// Filter communications by type
	const organizedPanels = communicationsByDate.filter((comm) => comm.type === 'panel');
	const presentedPapers = communicationsByDate.filter((comm) => comm.type === 'conference');
</script>

{#if organizedPanels.length > 0 || presentedPapers.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">
			Conference Participation
		</h3>

		<!-- Panels Organised -->
		{#if organizedPanels.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Panels organised</h4>
			<div class="space-y-3">
				{#each organizedPanels as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					<div class="flex gap-4">
						<div class="font-semibold text-nowrap">{commDate.getFullYear()}</div>
						<div class="flex-1">
							"{comm.panelTitle || comm.title}".
							{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}.
							{commDate.toLocaleDateString('en-GB', {
								day: 'numeric',
								month: 'long'
							})}.
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Papers Presented -->
		{#if presentedPapers.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Papers presented</h4>
			<div class="space-y-3">
				{#each presentedPapers as comm (comm.id)}
					{@const commDate = new Date(comm.dateISO)}
					{@const formattedAuthors = formatCVAuthorList(comm.authors)}
					<div class="flex gap-4">
						<div class="font-semibold text-nowrap">{commDate.getFullYear()}</div>
						<div class="flex-1">
							{#if formattedAuthors}{@html formattedAuthors}. {/if}
							"{comm.title}".
							{#if comm.panelTitle}Panel: <em>{comm.panelTitle}</em>. {/if}
							{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}.
							{commDate.toLocaleDateString('en-GB', {
								day: 'numeric',
								month: 'long'
							})}.
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}
