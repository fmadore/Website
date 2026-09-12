<script lang="ts">
	import CVEntry from './CVEntry.svelte';

	const computerSkills = [
		{
			category: 'Data analysis & visualisation',
			skills:
				'Python, OpenRefine, ECharts, MapLibre, data wrangling, topic modelling, network analysis, sentiment analysis, semantic search/embeddings'
		},
		{
			category: 'Digital humanities tools',
			skills:
				'Omeka S, IIIF, Wikidata, linked data (RDF, SPARQL), Tesseract OCR, web scraping, WordPress'
		},
		{
			category: 'Development & infrastructure',
			skills: 'Svelte, Git/GitHub, Docker, MongoDB, Claude Code, AI-assisted development'
		},
		{
			category: 'Research & documentation',
			skills: 'Zotero, Microsoft Office'
		}
	];
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
