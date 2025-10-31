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
			<h4 class="text-lg font-semibold mt-3 mb-1 pl-4">Panels organised</h4>
			<ul class="list-disc pl-8">
				{#each organizedPanels as comm (comm.id)}
					<li class="mb-3">
						"{comm.panelTitle || comm.title}".
						{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}.
						{new Date(comm.dateISO).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}.
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Papers Presented -->
		{#if presentedPapers.length > 0}
			<h4 class="text-lg font-semibold mt-3 mb-1 pl-4">Papers presented</h4>
			<ul class="list-disc pl-8">
				{#each presentedPapers as comm (comm.id)}
					<li class="mb-3">
						{#if comm.authors}{@html formatCVAuthorList(comm.authors)}.
						{/if}
						"{comm.title}".
						{#if comm.panelTitle}Panel: <em>{comm.panelTitle}</em>.
						{/if}
						{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}.
						{new Date(comm.dateISO).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}.
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
