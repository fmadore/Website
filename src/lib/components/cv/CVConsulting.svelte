<script lang="ts">
	import CVEntry from './CVEntry.svelte';

	// Future: This could be moved to a data file if more consulting entries are added
	const consulting = [
		{
			year: '2025',
			role: 'Consultant',
			organization: 'Communitology',
			description: 'Provide research-driven analysis and expert testimony in asylum and immigration proceedings. Prepare Country of Origin Information (COI) reports for cases on Benin, Togo, and Côte d\'Ivoire.'
		}
	];
</script>

<section>
	<h3>Consulting and Legal Expertise</h3>
	<div class="space-y-3">
		{#each consulting as item}
			<CVEntry year={item.year}>
				{item.role}, {item.organization}.
				<p class="text-sm mt-1">
					Provide research-driven analysis and expert testimony in asylum and immigration proceedings.
				</p>
				<p class="text-sm mt-1">
					Prepare Country of Origin Information (COI) reports for cases on Benin, Togo, and Côte d'Ivoire.
				</p>
			</CVEntry>
		{/each}
	</div>
</section>
