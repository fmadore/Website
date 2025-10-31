<script lang="ts">
	import { communicationsByDate } from '$lib/data/communications';

	const organizedEvents = communicationsByDate.filter((comm) => comm.type === 'event');
</script>

{#if organizedEvents.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-2 border-b border-light pb-1">
			Organization of Academic Events
		</h3>
		<div class="space-y-3">
			{#each organizedEvents as comm (comm.id)}
				{@const commDate = new Date(comm.dateISO)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{commDate.getFullYear()}</div>
					<div class="flex-1">
						{comm.title}.
						{#if comm.location}{comm.location}. {/if}
						{commDate.toLocaleDateString('en-GB', {
							day: 'numeric',
							month: 'long'
						})}.
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
