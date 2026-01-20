<script lang="ts">
	import { appointmentsByDate } from '$lib/data/appointments';
	import CVEntry from './CVEntry.svelte';

	// Format year range for display (e.g., "2013-15", "2023", or "2026-" for ongoing)
	function formatYearRange(startYear: number, endYear?: number | null): string {
		// Ongoing position (endYear is null)
		if (endYear === null) {
			return `${startYear}-`;
		}
		// Single year or no end year provided
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

<section>
	<h3>Professional Appointments</h3>
	{#if appointmentsByDate.length > 0}
		<div class="space-y-3">
			{#each appointmentsByDate as appt (appt.id)}
				<CVEntry year={formatYearRange(appt.startYear, appt.endYear)} yearWidth="fixed">
					<span class="font-medium">{appt.title}</span>,
					{appt.institution}{#if appt.location}, {appt.location}{/if}.
					{#if appt.details}
						<p class="text-sm mt-1">{appt.details}</p>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="text-light">No professional appointments listed.</p>
	{/if}
</section>
