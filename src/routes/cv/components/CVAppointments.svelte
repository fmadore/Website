<script lang="ts">
	import { appointmentsByDate } from '$lib/data/appointments';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">
		Professional Appointments
	</h3>
	{#if appointmentsByDate.length > 0}
		<ul>
			{#each appointmentsByDate as appt (appt.id)}
				<li class="mb-3">
					<span class="font-medium">{appt.title}</span>,
					<em>{appt.institution}</em>{#if appt.location}, {appt.location}{/if}.
					<span class="block ml-4 text-sm text-light">{appt.dateRangeString}</span>
					{#if appt.details}
						<p class="ml-4 text-sm">{appt.details}</p>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-light">No professional appointments listed.</p>
	{/if}
</section>
