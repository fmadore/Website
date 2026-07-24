<script lang="ts">
	import CVSection from './CVSection.svelte';

	// Future: This could be moved to a data file if more consulting entries are added
	const consulting = [
		{
			year: '2025–',
			role: 'Consultant',
			organization: 'Communitology',
			descriptions: [
				'Provide research-driven analysis and expert testimony in asylum and immigration proceedings.',
				"Prepare Country of Origin Information (COI) reports for cases on Benin, Côte d'Ivoire, and Togo."
			]
		}
	];
</script>

<CVSection
	title="Consulting and Legal Expertise"
	items={consulting}
	year={(item) => item.year}
	key={(item) => item.role}
>
	{#snippet entry(item)}
		{item.role}, {item.organization}.
		{#each item.descriptions as description (description)}
			<p class="text-sm mt-1">{description}</p>
		{/each}
	{/snippet}
</CVSection>
