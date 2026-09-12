<script lang="ts">
	import { languagesByProficiency } from '$lib/data/languages';
	import CVEntry from './CVEntry.svelte';
</script>

<!--
	Proficiency is the key, the language is the record. It was drawn the other
	way round — serif name left, mono stamp pushed to the right margin — which
	is the three-column ledger's *meta* column used as a two-column row, so this
	one section hung nothing in the key gutter every other section hangs a key
	in. Read down the page the classification now aligns with the years above it.
-->
<section>
	<h3>Languages</h3>
	{#if languagesByProficiency.length > 0}
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each languagesByProficiency as language (language.id)}
				<CVEntry year={language.proficiency}>
					<span class="cv-language-name">{language.name}</span>
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No languages listed.</p>
	{/if}
</section>

<style>
	/* The language itself — DOCUMENT voice, at the ledger title step. */
	.cv-language-name {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		color: var(--color-text-emphasis);
	}
</style>
