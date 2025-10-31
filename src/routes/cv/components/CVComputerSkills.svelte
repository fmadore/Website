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
			skills: 'Svelte, Git/GitHub, Docker, Cursor, prompt engineering, RAG implementation'
		},
		{
			category: 'Research & documentation',
			skills: 'Zotero, Microsoft Office'
		}
	];
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-light pb-1">Computer Skills</h3>
	<div class="space-y-3">
		{#each computerSkills as skill}
			<div class="flex gap-4">
				<div class="font-semibold" style="min-width: 12rem;">{skill.category}:</div>
				<div class="flex-1">
					{skill.skills}
				</div>
			</div>
		{/each}
	</div>
</section>
