<script lang="ts">
	import { languagesByProficiency } from '$lib/data/languages';
</script>

<section>
	<h3>Languages</h3>
	{#if languagesByProficiency.length > 0}
		<div class="space-y-3">
			{#each languagesByProficiency as language (language.id)}
				<div class="flex gap-4 items-center">
					<div class="font-medium flex-1 text-emphasis">{language.name}</div>
					<div class="language-badge">
						{language.proficiency}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No languages listed.</p>
	{/if}
</section>

<style>
	.language-badge {
		font-size: var(--font-size-sm);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--border-radius-full);
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
		color: var(--color-text);
		white-space: nowrap;
	}
</style>
