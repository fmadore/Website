<script lang="ts">
	import { fieldworksByDate } from '$lib/data/fieldworks';
	import { researchRolesByDate } from '$lib/data/research-roles';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import CVEntry from './CVEntry.svelte';

	// Group fieldworks by location. Extract every year mentioned in the
	// human-readable `date` string so cross-year trips (e.g. "November 2014
	// - April 2015") show both years, not just the canonical `fw.year`.
	const groupedFieldworks = $derived(
		fieldworksByDate.reduce(
			(acc, fw) => {
				const location = `${fw.city}, ${fw.country}`;
				if (!acc[location]) {
					acc[location] = new Set<number>();
				}
				const yearsInDate = fw.date.match(/\b(19|20)\d{2}\b/g);
				if (yearsInDate && yearsInDate.length > 0) {
					for (const y of yearsInDate) acc[location].add(Number(y));
				} else {
					acc[location].add(fw.year);
				}
				return acc;
			},
			{} as Record<string, Set<number>>
		)
	);

	const displayFieldworks = $derived(
		Object.entries(groupedFieldworks)
			.map(([location, yearSet]) => {
				return {
					location,
					years: Array.from(yearSet).sort((a, b) => b - a) // Sort years descending for each location
				};
			})
			.sort((a, b) => {
				// Sort locations alphabetically
				return a.location.localeCompare(b.location);
			})
	);
</script>

<section>
	<h3>Research Experience</h3>

	<!-- Fieldwork Subsection -->
	<h4>Fieldwork</h4>
	{#if displayFieldworks.length > 0}
		<div class="space-y-3 ledger">
			{#each displayFieldworks as item (item.location)}
				<div class="cv-fieldwork-row">
					<span class="cv-fieldwork-place">{item.location}</span>:
					<span class="cv-fieldwork-years">{item.years.join(', ')}</span>.
				</div>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No fieldwork listed.</p>
	{/if}

	<!-- Research Roles Subsection -->
	<h4>Research Roles</h4>
	{#if researchRolesByDate.length > 0}
		<div class="space-y-3 ledger">
			{#each researchRolesByDate as role (role.id)}
				<CVEntry year={formatCVYearRange(role.startYear, role.endYear)} yearWidth="fixed">
					<span class="font-medium">{role.title}</span>, {role.institution}.
					{#if Array.isArray(role.details)}
						{#each role.details as detail (detail)}
							<p class="text-sm mt-1">{detail}</p>
						{/each}
					{:else}
						<p class="text-sm mt-1">{role.details}</p>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No research roles listed.</p>
	{/if}
</section>

<style>
	/* Fieldwork ledger row — serif place, mono years, hairline between rows. */
	.cv-fieldwork-row {
		padding: var(--space-2-5) 0;
		border-top: var(--rule-hairline) solid var(--color-border-light);
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
	}

	.cv-fieldwork-row:last-child {
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	.cv-fieldwork-place {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-emphasis);
	}

	.cv-fieldwork-years {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		letter-spacing: 0.02em;
		font-variant-numeric: tabular-nums;
		color: var(--color-text-light);
	}
</style>
