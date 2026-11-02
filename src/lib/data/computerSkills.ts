import type { SkillGroup } from '#lib/types/cv.ts';

/**
 * Computer skills by category, printed by `CVComputerSkills.svelte`, the
 * CV's Markdown twin and `/api/cv.json`, in this order.
 *
 * Grounded in the work the site documents, chiefly the `skills` of the
 * digital humanities projects and applications, rather than a list of every
 * dependency. No proficiency levels: the records are the evidence.
 */
export const computerSkills: SkillGroup[] = [
	{
		category: 'Software development',
		skills:
			'Python, TypeScript, Rust, Svelte and SvelteKit, Tauri (Windows desktop applications), Git/GitHub, GitHub Actions, Docker'
	},
	{
		category: 'AI & language technologies',
		skills:
			'LLM APIs (Gemini, OpenAI, Claude, Mistral), Model Context Protocol (MCP), OCR and handwritten text recognition, speech recognition (Whisper), embeddings and semantic search, prompt engineering, AI-assisted development (Claude Code)'
	},
	{
		category: 'Data analysis & visualisation',
		skills:
			'pandas, OpenRefine, DuckDB, MongoDB, ECharts, D3, MapLibre, data wrangling, topic modelling, network analysis, sentiment analysis'
	},
	{
		category: 'Digital humanities tools',
		skills:
			'Omeka S, IIIF, Wikidata, linked data (RDF, SPARQL), Tesseract OCR, web scraping, WordPress'
	},
	{
		category: 'Research & documentation',
		skills: 'Zotero, Obsidian, Microsoft Office'
	}
];
