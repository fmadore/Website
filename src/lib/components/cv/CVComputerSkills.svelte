<script lang="ts">
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

<section>
	<h3>Computer Skills</h3>
	<div class="space-y-3">
		{#each computerSkills as skill (skill.category)}
			<div class="flex gap-4 items-start">
				<div class="font-semibold w-60 text-primary">{skill.category}:</div>
				<div class="flex-1 text-light">
					{skill.skills}
				</div>
			</div>
		{/each}
	</div>
</section>
