<script lang="ts">
	import { appointmentsByDate } from '$lib/data/appointments';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';
</script>

<!--
	Rendered with CVEntry (not the generic CVSection) so the ongoing appointment
	(endYear === null) can carry the accent "current" marker on its year key.
	<section> + <h3> + .space-y-3 remain as PDF-generator hooks.
-->
<section>
	<h3>Professional Appointments</h3>
	{#if appointmentsByDate.length > 0}
		<div class="space-y-3 ledger">
			{#each appointmentsByDate as appt (appt.id)}
				<CVEntry
					year={formatCVYearRange(appt.startYear, appt.endYear)}
					yearWidth="fixed"
					current={appt.endYear === null}
				>
					<span class="font-medium">{typesetQuotes(appt.title)}</span>,
					{typesetQuotes(appt.institution)}{#if appt.location}, {typesetQuotes(appt.location)}{/if}.
					{#if appt.details}
						<p class="text-sm mt-1">{typesetQuotes(appt.details)}</p>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No professional appointments listed.</p>
	{/if}
</section>
