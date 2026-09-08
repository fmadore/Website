<script lang="ts">
	import { fieldworksByDate } from '$lib/data/fieldworks';
	import { researchRolesByDate } from '$lib/data/research-roles';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
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
		<div class="space-y-3 ledger ledger--tight ledger--ruled">
			{#each displayFieldworks as item (item.location)}
				<!-- The years are the key and the place is the record. Set inline
				     as "Place: years" this was the one dated list on the sheet
				     that hung nothing in the gutter. -->
				<!-- A fieldwork key lists every year on site ("2024, 2015, 2014"), which
				     the 6.5rem year gutter cannot hold on one line: on paper it wrapped a
				     year per line, three rows tall beside a one-line place. The wide key
				     column (the same one Computer Skills hangs its categories in) holds it. -->
				<CVEntry year={item.years.join(', ')} wide>
					<span class="cv-fieldwork-place">{typesetQuotes(item.location)}</span>
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No fieldwork listed.</p>
	{/if}

	<!-- Research Roles Subsection -->
	<h4>Research Roles</h4>
	{#if researchRolesByDate.length > 0}
		<div class="space-y-3 ledger ledger--tight ledger--ruled">
			{#each researchRolesByDate as role (role.id)}
				<CVEntry year={formatCVYearRange(role.startYear, role.endYear)}>
					<span class="font-medium">{typesetQuotes(role.title)}</span>, {typesetQuotes(
						role.institution
					)}.
					{#if Array.isArray(role.details)}
						{#each role.details as detail (detail)}
							<p class="text-sm mt-1">{typesetQuotes(detail)}</p>
						{/each}
					{:else}
						<p class="text-sm mt-1">{typesetQuotes(role.details)}</p>
					{/if}
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No research roles listed.</p>
	{/if}
</section>

<style>
	/* The place — DOCUMENT voice; the years hang in the key column. */
	.cv-fieldwork-place {
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-emphasis);
	}
</style>
