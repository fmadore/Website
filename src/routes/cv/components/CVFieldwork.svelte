<script lang="ts">
	import { fieldworksByDate } from '$lib/data/fieldworks';

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
	<h3 class="text-2xl font-semibold mb-2 border-b border-light pb-1">Fieldwork</h3>
	{#if displayFieldworks.length > 0}
		<div class="space-y-3 mt-3">
			{#each displayFieldworks as item (item.location)}
				<div>
					<span class="font-medium">{item.location}</span> ({item.years.join(', ')}).
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No fieldwork listed.</p>
	{/if}
</section>
