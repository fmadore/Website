<script lang="ts">
	import { computerSkills } from '$lib/data/computerSkills';
	import CVEntry from './CVEntry.svelte';
</script>

<!--
	A classified ledger rather than a dated one: the key is a category, so the
	row takes the wide key column. `cv-entry--wide` is a PDF-generator hook —
	the exporter widens its own gutter to match.
-->
<section>
	<h3>Computer Skills</h3>
	<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
		{#each computerSkills as skill (skill.category)}
			<CVEntry year={skill.category} wide>
				<span class="cv-skill-list">{skill.skills}</span>
			</CVEntry>
		{/each}
	</div>
</section>

<style>
	/* Skills — DOCUMENT voice: serif body. */
	.cv-skill-list {
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
	}
</style>
