import type { SkillGroup } from '$lib/types/cv';

/**
 * Computer skills by category, printed by `CVComputerSkills.svelte` and the
 * CV's Markdown twin, in this order.
 */
export const computerSkills: SkillGroup[] = [
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
