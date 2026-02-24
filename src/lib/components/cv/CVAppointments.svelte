<script lang="ts">
	import { appointmentsByDate } from '$lib/data/appointments';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Professional Appointments"
	items={appointmentsByDate}
	year={(appt) => formatCVYearRange(appt.startYear, appt.endYear)}
	key={(appt) => appt.id}
	yearWidth="fixed"
	emptyMessage="No professional appointments listed."
>
	{#snippet entry(appt)}
		<span class="font-medium">{appt.title}</span>,
		{appt.institution}{#if appt.location}, {appt.location}{/if}.
		{#if appt.details}
			<p class="text-sm mt-1">{appt.details}</p>
		{/if}
	{/snippet}
</CVSection>
