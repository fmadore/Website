<script lang="ts">
	import { languagesByProficiency } from '$lib/data/languages';
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Languages</h3>
	{#if languagesByProficiency.length > 0}
		<div class="space-y-3">
			{#each languagesByProficiency as language (language.id)}
				<div class="flex gap-4">
					<div class="w-80">{language.name}</div>
					<div class="font-semibold">{language.proficiency}</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No languages listed.</p>
	{/if}
</section>
