import type { ResearchProject } from '$lib/types/research';

/**
 * The infrastructure strand of the research programme, distinct from
 * `dh-ai-african-studies`: that project convenes the field (workshops, the
 * edited volume, the position paper), this one builds and studies the data
 * systems themselves. `projectName` is the string the data templates have
 * carried since the Bayreuth appointment — keep it byte-identical.
 */
export const digitalResearchEnvironment: ResearchProject = {
	id: 'digital-research-environment',
	title: 'Digital Research Environment',
	shortTitle: 'Digital Research Environment',
	cardTitle: 'Digital Research Environment (Africa Multiple)',
	years: '2026-',
	current: true,
	order: 3,
	shortDescription:
		'Building and studying the data infrastructure that connects the Africa Multiple Cluster of Excellence, its four African research centres, and their partners.',
	imageSrc: 'dre.webp',
	imageAlt: 'Masthead of the Africa Multiple Interactive Research Atlas (AMIRA)',
	figCaption: 'Fig. 1 — AMIRA, the public metadata layer built by the DRE',
	subtitle:
		'The digital infrastructure unit of the Africa Multiple Cluster of Excellence at the University of Bayreuth, and a research programme on how African research data is described, modelled, and made findable.',
	projectName: 'Digital Research Environment (University of Bayreuth)',
	funder: 'Deutsche Forschungsgemeinschaft (EXC 2052)',
	programme: 'Africa Multiple 2.0 · 2026–2032',
	regions: ['Germany', 'Burkina Faso', 'Nigeria', 'Kenya', 'South Africa', 'Brazil'],
	ctas: [
		{
			label: 'AMIRA',
			href: 'https://data.africamultiple.uni-bayreuth.de/s/amira',
			external: true,
			primary: true
		},
		{
			label: 'Digital Research Environment',
			href: 'https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html',
			external: true
		},
		{
			label: 'DRE on GitHub',
			href: 'https://github.com/AM-Digital-Research-Environment',
			external: true
		}
	],
	seoDescription:
		'Research data management, knowledge-graph development, AI-assisted processing, and agentic access at the Digital Research Environment of the Africa Multiple Cluster of Excellence, University of Bayreuth.',
	seoKeywords:
		'Digital Research Environment, DRE, Africa Multiple, AMIRA, University of Bayreuth, research data management, FAIR, CARE, knowledge graph, Wikidata, Omeka S, metadata, ontologies, AI-assisted cataloguing, African studies'
};

export default digitalResearchEnvironment;
