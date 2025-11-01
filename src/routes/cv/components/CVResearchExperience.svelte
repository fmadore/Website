<script lang="ts">
	import { fieldworksByDate } from '$lib/data/fieldworks';
	import { researchRolesByDate } from '$lib/data/research-roles';

	// Format year range for display (e.g., "2016-17" or "2024")
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

	// Group fieldworks by location
	const groupedFieldworks = $derived(
		fieldworksByDate.reduce(
			(acc, fw) => {
				const location = `${fw.city}, ${fw.country}`;
				if (!acc[location]) {
					acc[location] = new Set<number>();
				}
				acc[location].add(fw.year);
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

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Research Experience</h3>

	<!-- Fieldwork Subsection -->
	<h4 class="text-lg font-semibold mt-4 mb-2">Fieldwork</h4>
	{#if displayFieldworks.length > 0}
		<div class="space-y-3">
			{#each displayFieldworks as item (item.location)}
				<div>
					<span class="font-medium">{item.location}</span>: {item.years.join(', ')}.
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No fieldwork listed.</p>
	{/if}

	<!-- Research Roles Subsection -->
	<h4 class="text-lg font-semibold mt-4 mb-2">Research Roles</h4>
	{#if researchRolesByDate.length > 0}
		<div class="space-y-3">
			{#each researchRolesByDate as role (role.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap w-20">
						{formatYearRange(role.startYear, role.endYear)}
					</div>
					<div class="flex-1">
						<span class="font-medium">{role.title}</span>, {role.institution}.
						{#if Array.isArray(role.details)}
							{#each role.details as detail}
								<p class="text-sm mt-1">{detail}</p>
							{/each}
						{:else}
							<p class="text-sm mt-1">{role.details}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No research roles listed.</p>
	{/if}
</section>
