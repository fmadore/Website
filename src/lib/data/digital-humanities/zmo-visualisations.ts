import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const zmoVisualisations: DigitalHumanitiesProject = {
	id: 'zmo-visualisations',
	title: 'ZMO Visualisations',
	years: '2025-2026',
	shortDescription:
		"Two web apps built from data scraped monthly from the ZMO website: a word explorer showing what each research unit writes about, and a dashboard of the institute's complete publication record since 1994.",
	description: `
		<p>An institute's website already holds a great deal of what it would want to say about itself: which themes its research units return to, what it has published and with whom. That material is spread across hundreds of pages and readable only one page at a time. These two apps read it computationally instead. Both are built for the <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in Berlin, published in English and German, and both draw on data scraped from zmo.de rather than maintained by hand.</p>

		<h2>The word explorer</h2>
		<p>The most frequent terms in each research unit's own description and project abstracts, each reduced to its dictionary form. Pick one of the three units or all of them, set how many words to show, and save the cloud as an image. Beyond the cloud, a frequency list gives exact counts, a comparison sets the units' vocabularies side by side, and selecting any term brings up the original passages it came from, with links back to the projects. Every view has its own web address, so it can be linked to or embedded.</p>
		<p>The scraper follows each unit's overview page to every linked project, including the umbrella projects described only on the listing page; missing those would quietly drop several hundred words per unit. Researcher bylines are stripped so that personal names do not become terms.</p>

		<h2>The publications dashboard</h2>
		<p>Everything in ZMO's <a href="https://www.zmo.de/en/publications/publication-search" target="_blank" rel="noopener noreferrer">publication register</a>, <strong>1,979 publications by 670 authors, 1994 to 2026</strong>, as linked views: output per year by document type, the types themselves, the most-published authors, where ZMO publishes, and who publishes with whom, over the full list underneath. Further views follow document types over time, each author's output year by year, the publications two authors share, and which chapters belong to which edited volume.</p>
		<p><strong>Every chart is also a filter.</strong> Click a column, a bar, a legend entry or an author and the whole dashboard narrows to it. Choices stack, and each chart counts against all the active filters except its own, so selecting one document type leaves the others visible to switch to. Rankings page through every entry rather than stopping at a top ten, since a top ten would hide most of the 670 authors and 530 journals. Any view can be shared by link, the filtered list downloads as CSV, and the charts as SVG or PNG.</p>

		<h2>Decisions the data forced</h2>
		<p>The year chart stacks publications by document type, and eight colours is about the most a reader, including a colourblind one, can tell apart. So the seven largest types get their own colour, the rest are grouped, and every series is named in the legend rather than left to colour alone.</p>
		<p>"Where ZMO publishes" ranks journals and publishers, and deliberately leaves out the register's <em>series</em> field: it is filled on only 193 of 1,979 records, with 180 different values among them, so ranking it produced a list of ones. The field still names the venue on a working paper in the list below, and is still searched. A field can be worth keeping without being worth charting.</p>

		<h2>How it's built</h2>
		<p>Neither app has a build step: plain ES modules loaded straight by the browser and drawn with <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer">D3</a>, with no bundler and nothing to install. Python pipelines fetch from zmo.de and write the data each app reads, and GitHub Actions rerun them monthly, check the result and publish it, so both refresh without anyone touching them. The raw scrape is committed too, so each refresh leaves a readable record of exactly what changed on the website. The scrapers also fail loudly when a page comes back empty, so that a redesign of zmo.de surfaces as a visible error rather than as a quietly shrinking word cloud.</p>
	`,
	imageUrl: '/images/digital-humanities/zmo-visualisations.webp',
	order: 6,
	links: [
		{ url: 'https://zmo-berlin.github.io/visualisations/en/' },
		{
			url: 'https://zmo-berlin.github.io/visualisations/units_wordcloud/en/',
			label: 'Word cloud'
		},
		{
			url: 'https://zmo-berlin.github.io/visualisations/publications_dashboard/en/',
			label: 'Publications dashboard'
		},
		{
			url: 'https://github.com/ZMO-Berlin/visualisations',
			label: 'ZMO-Berlin/visualisations',
			type: 'code'
		}
	],
	skills: [
		'Python',
		'Web scraping',
		'NLP',
		'NLTK',
		'D3.js',
		'Data Visualisation',
		'Network graphs',
		'JSON',
		'GitHub Actions'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'zmo-units-wordcloud-embed',
			src: 'https://zmo-berlin.github.io/visualisations/units_wordcloud/en/',
			title: 'Word cloud',
			description:
				"<p>The most frequent terms across ZMO's three research units. Pick a unit or view them combined, adjust how many words are shown, or switch to the frequency list, the unit comparison or a term's source passages.</p>",
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'zmo-publications-dashboard-embed',
			src: 'https://zmo-berlin.github.io/visualisations/publications_dashboard/en/',
			title: 'Publications dashboard',
			description:
				'<p>1,979 publications across linked views. Click any column, bar, legend entry or author to filter the whole dashboard; the choices stack.</p>',
			showTitle: true,
			variant: 'responsive'
		}
	],
	seoKeywords: [
		'ZMO',
		'Leibniz-Zentrum Moderner Orient',
		'data visualisation',
		'word cloud',
		'text analysis',
		'publications dashboard',
		'bibliometrics',
		'co-authorship network',
		'web scraping',
		'D3',
		'digital humanities'
	]
};
