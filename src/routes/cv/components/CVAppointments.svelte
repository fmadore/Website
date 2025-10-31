<script lang="ts">
	import { appointmentsByDate } from '$lib/data/appointments';

	// Format year range for display (e.g., "2013-15" or "2023")
	function formatYearRange(startYear: number, endYear?: number | null): string {
		if (!endYear || endYear === startYear) {
			return startYear.toString();
		}
		// Compact format: use last 2 digits of end year if in same century
		const startCentury = Math.floor(startYear / 100);
		const endCentury = Math.floor(endYear / 100);
		if (startCentury === endCentury) {
			return `${startYear}-${endYear.toString().slice(-2)}`;
		}
		return `${startYear}-${endYear}`;
	}
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">
		Professional Appointments
	</h3>
	{#if appointmentsByDate.length > 0}
		<div class="space-y-3">
			{#each appointmentsByDate as appt (appt.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap w-20">
						{formatYearRange(appt.startYear, appt.endYear)}
					</div>
					<div class="flex-1">
						<span class="font-medium">{appt.title}</span>,
						{appt.institution}{#if appt.location}, {appt.location}{/if}.
						{#if appt.details}
							<p class="text-sm mt-1">{appt.details}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No professional appointments listed.</p>
	{/if}
</section>
