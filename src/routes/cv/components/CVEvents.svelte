<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';

	const organizedEvents = communicationsByDate.filter((comm) => comm.type === 'event');
</script>

{#if organizedEvents.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">
			Organization of Academic Events
		</h3>
		<ul class="list-disc pl-6">
			{#each organizedEvents as comm (comm.id)}
				<li class="mb-3">
					{comm.title}.
					{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}.
					{new Date(comm.dateISO).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}.
				</li>
			{/each}
		</ul>
	</section>
{/if}
