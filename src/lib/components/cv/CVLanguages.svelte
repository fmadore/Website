<script lang="ts">
	import { languagesByProficiency } from '$lib/data/languages';
</script>

<section>
	<h3>Languages</h3>
	{#if languagesByProficiency.length > 0}
		<div class="space-y-3 ledger">
			{#each languagesByProficiency as language (language.id)}
				<!-- .flex.gap-4 + .flex-1 + .language-badge are PDF-generator hooks. -->
				<div class="flex gap-4 items-baseline cv-language-row">
					<div class="font-medium flex-1 text-emphasis cv-language-name">{language.name}</div>
					<div class="language-badge">
						{language.proficiency}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No languages listed.</p>
	{/if}
</section>

<style>
	/* Ledger row: serif language name left, mono proficiency stamp right. */
	.cv-language-row {
		padding: var(--space-2-5) 0;
		border-top: var(--rule-hairline) solid var(--color-border-light);
	}

	.cv-language-row:last-child {
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	.cv-language-name {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
	}

	/* Proficiency — DATA voice: mono uppercase status, no pill, no fill. */
	.language-badge {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		padding: 0;
		border-radius: 0;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
</style>
