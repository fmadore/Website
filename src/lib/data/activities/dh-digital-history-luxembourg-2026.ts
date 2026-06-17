import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const dhDigitalHistoryLuxembourg2026: Activity = {
	id: 'dh-digital-history-luxembourg-2026',
	title: 'AI through History, History through AI',
	dateISO: '2026-06-17',
	date: formatDisplayDate('2026-06-17'),
	year: 2026,
	description:
		'Reflections on the Eighth Conference on Digital Humanities and Digital History in Luxembourg, where I presented the MCP server I built for the Islam West Africa Collection (IWAC).',
	content: `
        <p>I have just returned from the Eighth Conference on Digital Humanities and Digital History in Luxembourg, which this year had the theme "AI through History, History through AI".</p>

        <p>A big thank you to <a href="https://www.uni.lu/c2dh-en/people/sarah-oberbichler/" target="_blank" rel="noopener noreferrer">Sarah Oberbichler</a> and the <a href="https://www.uni.lu/c2dh-en/" target="_blank" rel="noopener noreferrer">Luxembourg Centre for Contemporary and Digital History (C²DH)</a> at the University of Luxembourg for organising such an inspiring event. The papers critically examined the impact of AI on history: on research and method, on memory, and on whose past gets remembered.</p>

        <p>I had the chance to present the MCP server I built for the <a href="https://islam.zmo.de/s/westafrica/page/home" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, and I learned a great deal from the other participants.</p>

        <p>Ask a commercial AI chatbot about Islam in West Africa and you will most likely get a generic, stereotypical answer: the region is thin in the training data. IWAC itself is open access, and over the past year AI bots from the US and China have repeatedly accessed its servers to scrape the entire collection. Yet for all that traffic, the chatbots barely draw on the collection and rarely cite it.</p>

        <p>The MCP server takes a different approach. You can ask for specific information in plain language, such as newspaper articles on Islam in Abidjan in the 1990s, Islamic publications on secularism in Togo and Benin, or academic references on Muslim women in Burkina Faso. Each query pulls from a different part of the collection with a different mix of filters (e.g. place, period, subject, country), and the AI determines which tools to use and how to combine them. The result is a much more grounded answer, with claims linked back to specific documents.</p>

        <p>My slides are available, and you can test the MCP server yourself from <a href="https://github.com/fmadore/iwac-mcp-server" target="_blank" rel="noopener noreferrer">my GitHub page</a>; more details and the link are in the <a href="https://slides.frederickmadore.com/talks/2026-06-15-luxembourg-beyond-keywords/" target="_blank" rel="noopener noreferrer">slides</a>.</p>
    `,
	tags: [
		'Digital Humanities',
		'Digital History',
		'AI',
		'Large Language Models',
		'IWAC',
		'MCP',
		'Islam',
		'West Africa',
		'Conference',
		'Luxembourg'
	],
	type: 'conference',
	url: 'https://www.uni.lu/c2dh-en/events/ai-through-history-history-through-ai/',
	urlLabel: 'Conference website',
	heroImage: {
		src: 'images/activities/dh-digital-history-luxembourg-2026-hero.webp',
		alt: "The University of Luxembourg's Belval campus in Esch-sur-Alzette: a dark building bearing a vertical 'Maison du Nombre' sign faces a vivid red building across a paved plaza with a reflecting pool, under a clear blue sky.",
		caption:
			"The University of Luxembourg's Belval campus in Esch-sur-Alzette, venue for the Eighth Conference on Digital Humanities and Digital History."
	},
	panelType: 'conference'
};
