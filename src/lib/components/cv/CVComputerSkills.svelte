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
	<div class="space-y-3 ledger">
		{#each computerSkills as skill (skill.category)}
			<!-- .w-60 is a PDF-generator hook marking the category (key) column. -->
			<div class="flex gap-4 items-baseline cv-skill-row">
				<div class="font-semibold w-60 cv-skill-category">{skill.category}</div>
				<div class="flex-1 cv-skill-list">
					{skill.skills}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	/* Ledger row: mono category key, serif skills content, hairline between. */
	.cv-skill-row {
		padding: var(--space-2-5) 0;
		border-top: var(--rule-hairline) solid var(--color-border-light);
	}

	.cv-skill-row:last-child {
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	/* Category — DATA voice: mono uppercase, letterspaced, quiet ink. */
	.cv-skill-category {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
		line-height: var(--line-height-snug);
	}

	/* Skills — DOCUMENT voice: serif body. */
	.cv-skill-list {
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
	}
</style>
