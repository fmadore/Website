<script lang="ts">
	const computerSkills = [
		{
			category: 'Data analysis & visualisation',
			skills: 'Python, OpenRefine, data wrangling, topic modelling, network analysis, sentiment analysis'
		},
		{
			category: 'Digital humanities tools',
			skills: 'Omeka S, IIIF, Wikidata, Tesseract OCR, web scraping, WordPress'
		},
		{
			category: 'Development & infrastructure',
			skills: 'Svelte, Git/GitHub, Docker, Claude Code, prompt engineering, RAG implementation'
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
		{#each computerSkills as skill}
			<div class="flex gap-4 items-start">
				<div class="font-semibold w-60 text-primary">{skill.category}:</div>
				<div class="flex-1 text-light">
					{skill.skills}
				</div>
			</div>
		{/each}
	</div>
</section>
