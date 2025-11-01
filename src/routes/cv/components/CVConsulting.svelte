<script lang="ts">
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
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Consulting and Legal Expertise</h3>
	<div class="space-y-3">
		{#each consulting as item}
			<div class="flex gap-4">
				<div class="font-semibold text-nowrap">{item.year}</div>
				<div class="flex-1">
					{item.role}, {item.organization}.
					<p class="text-sm mt-1">
						Provide research-driven analysis and expert testimony in asylum and immigration proceedings.
					</p>
					<p class="text-sm mt-1">
						Prepare Country of Origin Information (COI) reports for cases on Benin, Togo, and Côte d'Ivoire.
					</p>
				</div>
			</div>
		{/each}
	</div>
</section>
