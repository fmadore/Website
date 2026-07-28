import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const zmoVisualisations: DigitalHumanitiesProject = {
	id: 'zmo-visualisations',
	title: 'ZMO Visualisations',
	years: '2025',
	shortDescription:
		"Two static web apps built from data scraped monthly off the ZMO website: a word cloud of what each research unit writes about, and a dashboard over the institute's full publication register — 1,962 publications, 656 authors, 1994-2026 — in which every chart is also a filter.",
	description: `
		<p>An institute's website already holds a great deal of what it would want to say about itself: which themes its research units return to, what it has published and with whom. That material is spread across hundreds of pages and readable only one page at a time. These two apps read it computationally instead. Both are built for the <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in Berlin, published in English and German, and both draw on data scraped from zmo.de rather than maintained by hand.</p>

		<h3>The word cloud</h3>
		<p>The most frequent terms in each research unit's own description and project abstracts. Pick one of the three units or view them combined, set how many words to show, hover a word for its frequency, and export the result as a PNG. Both language pages accept URL parameters, so a specific unit and word count can be linked to or embedded directly.</p>
		<p>The scraper follows each unit's overview page to every linked project, and also picks up the umbrella projects whose descriptions are printed on the listing page rather than linked. Missing those would quietly drop several hundred words per unit. Researcher bylines are stripped so that personal names do not become terms.</p>

		<h3>The publications dashboard</h3>
		<p>Everything in ZMO's <a href="https://www.zmo.de/en/publications/publication-search" target="_blank" rel="noopener noreferrer">publication register</a> — <strong>1,962 publications, 656 authors, 1994 to 2026</strong> — as five linked views: output per year stacked by document type, the document types themselves, the most-published authors, where ZMO publishes, and who publishes with whom, over the full list underneath.</p>
		<p><strong>Every chart is also a filter.</strong> Click a column, a bar, a legend entry or an author node and the whole dashboard narrows to it. Choices stack, each appearing as a chip that can be removed. Every chart counts against all the active filters except its own, so selecting one document type leaves the others visible to switch to rather than collapsing the panel to a single bar.</p>
		<p>Rankings run to hundreds of entries, so the ranked charts page rather than truncating at a top-ten: there are 656 authors and 526 journals, and a top-N would hide most of them. The co-authorship network opens on the 60 most-published authors and grows on request.</p>

		<h3>Decisions the data forced</h3>
		<p>The year chart is stacked by document type, and eight is the ceiling for a categorical palette that stays distinguishable, including to a colourblind reader — so seven types are drawn as their own series and the smallest are grouped. The eight hues were checked against the page's white surface (worst adjacent pair ΔE 9.1 under protanopia) and their <em>order</em> is what makes that hold, so slots are assigned in sequence rather than shuffled. Three of the eight sit below 3:1 contrast on white, which is why every series is named in the legend instead of being left to colour alone.</p>
		<p>"Where ZMO publishes" ranks journals and publishers, and deliberately omits the register's <em>series</em> field: it is filled on 187 of 1,962 records and holds 175 distinct values among them, so ranking it produced a list of ones. The field still names the venue on a working paper in the list below, and is still searched. A field can be worth keeping without being worth charting.</p>

		<h3>How it's built</h3>
		<p>Neither app has a build step: plain ES modules loaded straight by the browser, drawn with <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer">D3</a>, no bundler and no install. Python pipelines fetch from zmo.de and write JSON into each app's data directory, and GitHub Actions rerun them monthly and commit the result, so both refresh without anyone touching them. The raw scraper output is committed too, which means a scrape produces a readable diff of exactly what changed on the website. The unit scraper fails loudly when a page yields no abstract or no projects, since the selectors it depends on come from ZMO's TYPO3 theme: a redesign should surface as a visible error rather than as a quietly shrinking word cloud.</p>
	`,
	imageUrl: '/images/digital-humanities/zmo_units_wordcloud.webp',
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
				"<p>The most frequent terms across ZMO's three research units. Pick a unit or view them combined, and adjust how many words are shown.</p>",
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		},
		{
			type: 'iframe',
			id: 'zmo-publications-dashboard-embed',
			src: 'https://zmo-berlin.github.io/visualisations/publications_dashboard/en/',
			title: 'Publications dashboard',
			description:
				'<p>1,962 publications across five linked views. Click any column, bar, legend entry or author node to filter the whole dashboard; the choices stack.</p>',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
	],
	seoKeywords: [
		'ZMO',
		'Leibniz-Zentrum Moderner Orient',
		'data visualisation',
		'word cloud',
		'publications dashboard',
		'bibliometrics',
		'co-authorship network',
		'web scraping',
		'D3',
		'digital humanities'
	]
};
