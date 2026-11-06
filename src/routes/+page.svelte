<script lang="ts">
	import Icon from '@iconify/svelte';
	import ContentBody from '#lib/components/common/ContentBody.svelte';
	import ActivityFeed from '#lib/components/home/ActivityFeed.svelte';
	import OutputRecordChart from '#lib/components/home/OutputRecordChart.svelte';
	import Button from '#lib/components/atoms/Button.svelte';
	import SEO from '#lib/SEO.svelte';
	import { onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import { author, profile, website } from '#lib/data/siteConfig.ts';
	import { assetHref } from '#lib/utils/paths.ts';
	import { buildSrcset, imageDimensions } from '#lib/utils/imageVariants.ts';
	import { formatDayMonth } from '#lib/utils/homeDigest.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// The portrait spans the column on a phone, then takes a 15rem slot at --md
	// and 18.75rem from --lg, so a 2× screen wants up to ~700 px of the 854 px
	// source.
	const portraitSrc = asset('images/Profile-picture.webp');
	const portraitSrcset = buildSrcset(portraitSrc);
	const PORTRAIT_SIZES = '(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 15rem, 300px';

	const additionalSchemas = $derived(data.personSchema ? [data.personSchema] : []);

	// "Upcoming" was fixed when the page was built. Once the page is live, check
	// the date again, so a talk that has passed since the last build is never
	// announced as next. Before hydration (and for the prerender) the build's
	// list stands as it is.
	let today = $state<string | null>(null);
	onMount(() => {
		today = new Date().toISOString().slice(0, 10);
	});
	const nextTalk = $derived(data.upcoming.find((talk) => !today || talk.dateISO >= today));

	// What the page says about each collection and app; the title, image and
	// platform line come from the record itself.
	const DH_COPY: Record<string, { blurb: string; stats?: [string, string][] }> = {
		iwac: {
			blurb:
				'Newspapers, Islamic publications, documents and audiovisual records, processed with OCR, transcription and entity recognition.',
			stats: [
				['20,944', 'Items'],
				['6', 'Countries']
			]
		},
		amira: {
			blurb:
				'The collections of research centres in Burkina Faso, Kenya, Nigeria and South Africa, searchable in one place.',
			stats: [
				['3,800', 'Items'],
				['90+', 'Projects']
			]
		},
		kalamu: {
			blurb:
				'Read scans and handwriting, transcribe interviews and analyse texts with AI, then check every result against its source.'
		},
		'live-translation': {
			blurb: 'Live captions and translations over meetings, video calls and slides.'
		}
	};

	const COVER_SIZES = '(max-width: 767px) 30vw, 10rem';
	const DH_SIZES = '(max-width: 767px) 8rem, 12rem';
</script>

<SEO
	title="{author.name} | {author.positionShort}"
	description="Frédérick Madore, historian and digital humanist at the University of Bayreuth, studies Islam in francophone West Africa and develops open digital collections and AI workflows, including IWAC and AMIRA. Data Curator at the Cluster of Excellence &quot;Africa Multiple&quot; and researcher in its Research Section Digitalities, and Co-Principal Investigator of a Volkswagen Foundation project on AI and multilingual Islamic collections."
	keywords="Frédérick Madore, Islam, West Africa, Digital Humanities, Artificial Intelligence, Volkswagen Foundation, Omeka S, Islam West Africa Collection, IWAC, AMIRA, Africa Multiple Interactive Research Atlas, data curation, University of Bayreuth, Cluster of Excellence Africa Multiple, ZMO, Leibniz-Zentrum Moderner Orient, historian"
	canonical={website.url}
	pageType="ProfilePage"
	dateModified={profile.dateModified}
	{additionalSchemas}
/>

{#snippet dhCard(card: (typeof data.collections)[number])}
	{@const copy = DH_COPY[card.id]}
	{@const src = assetHref(card.imageUrl)}
	{@const size = imageDimensions(src)}
	<li class="dh-card">
		<img
			class="plate dh-plate"
			{src}
			srcset={buildSrcset(src)}
			sizes={DH_SIZES}
			alt=""
			width={size?.width}
			height={size?.height}
			loading="lazy"
			decoding="async"
		/>
		<div class="dh-text">
			<h4 class="dh-title">
				<a href={resolve('/digital-humanities/[id]', { id: card.id })}>{card.title}</a>
			</h4>
			{#if copy}<p class="dh-blurb">{copy.blurb}</p>{/if}
			{#if copy?.stats}
				<dl class="dh-stats">
					{#each copy.stats as [value, label] (label)}
						<div>
							<dt class="dh-stat-label">{label}</dt>
							<dd class="dh-stat-value">{value}</dd>
						</div>
					{/each}
				</dl>
			{/if}
			{#if card.platform || card.store}
				<p class="dh-meta">
					{#if card.platform}<span>{card.platform}</span>{/if}
					{#if card.platform && card.store}<span aria-hidden="true">·</span>{/if}
					{#if card.store}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
						<a class="dh-store" href={card.store.url} target="_blank" rel="noopener noreferrer">
							{#if card.store.label === 'Microsoft Store'}
								<Icon icon="local:microsoft-store" width="14" height="14" aria-hidden="true" />
							{/if}
							{card.store.label}<span class="sr-only"> (opens in new tab)</span>
						</a>
					{/if}
				</p>
			{/if}
		</div>
	</li>
{/snippet}

<div class="home-shell">
	<!-- The name once, then what the work is, then what is happening now. -->
	<header class="home-lede">
		<p class="lede-dateline dateline">
			<span>{author.positionShort}</span>
			<span>University of Bayreuth</span>
		</p>
		<div class="lede-main">
			<h1 class="home-name">{author.fullName}</h1>
			<p class="home-thesis">
				I study Islam in francophone West Africa, and I build open collections, AI workflows and
				interactive dashboards that let me read sources in new ways.
			</p>
		</div>
		<figure class="home-portrait">
			<img
				class="plate"
				src={portraitSrc}
				srcset={portraitSrcset}
				sizes={portraitSrcset ? PORTRAIT_SIZES : undefined}
				alt="Frédérick Madore"
				width="854"
				height="742"
				loading="eager"
				decoding="async"
				fetchpriority="high"
			/>
		</figure>
		<dl class="now-ledger">
			{#if nextTalk}
				<div class="now-row now-row--next">
					<dt>Next talk</dt>
					<dd>
						<a href={resolve('/communications/[id]', { id: nextTalk.id })}>{nextTalk.title}</a>
					</dd>
					<dd class="now-when">
						<time datetime={nextTalk.dateISO}>{formatDayMonth(nextTalk.dateISO)}</time>
					</dd>
				</div>
			{/if}
			<!-- One key, two entries: the key hangs once, as an author does over
			     their works in a bibliography; each project keeps its own date. -->
			<div class="now-row now-row--group">
				<dt>Projects</dt>
				<dd>
					<a href={resolve('/research/islams-peripheries-dh-ai-west-africa-central-asia')}
						><em>Islam’s ‘Peripheries’</em></a
					>, Co-PI, Volkswagen Foundation
				</dd>
				<dd class="now-when">2026–2028</dd>
				<dd class="now-also">
					<a href={resolve('/research/dh-ai-african-studies')}
						><em>Digital Humanities and Artificial Intelligence in African Studies</em></a
					>, Volkswagen Foundation and DFG Point Sud
				</dd>
				<dd class="now-when now-also">2025–2027</dd>
			</div>
			<div class="now-row">
				<dt>Role</dt>
				<dd>Data Curator, Cluster of Excellence “Africa Multiple”</dd>
				<dd class="now-when">Bayreuth</dd>
			</div>
		</dl>
	</header>

	<section class="section home-about" aria-labelledby="home-about">
		<h2 class="section-title" id="home-about">About</h2>
		<ContentBody variant="default" additionalClasses="home-prose">
			<p>
				My two roles feed each other. At the <a
					href="https://www.africamultiple.uni-bayreuth.de/en/index.html"
					target="_blank"
					rel="noopener noreferrer"
					>Cluster of Excellence “Africa Multiple”<span class="sr-only">
						(opens in new tab)</span
					></a
				>, I am
				<a
					href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html"
					target="_blank"
					rel="noopener noreferrer">Data Curator<span class="sr-only"> (opens in new tab)</span></a
				>
				and a researcher in the
				<a
					href="https://www.africamultiple.uni-bayreuth.de/en/1_2-Research/Research-Sections-AM-2_0/Digitalities/index.html"
					target="_blank"
					rel="noopener noreferrer"
					>Research Section Digitalities<span class="sr-only"> (opens in new tab)</span></a
				>. As curator, I help design the systems that make research data findable and reusable under
				the FAIR and CARE principles, and I work with colleagues on the digital literacy and ethical
				standards that curation demands. As Co-Principal Investigator of
				<a
					href={resolve('/research/islams-peripheries-dh-ai-west-africa-central-asia')}
					data-sveltekit-preload-data><em>Islam’s ‘Peripheries’</em></a
				>
				(2026–2028), a Volkswagen Foundation project with Aksana Ismailbekova, I use AI to compare Islamic
				discourse in two multilingual collections, from West Africa and Central Asia. The project also
				tests new ways into them, from searching across languages to querying them in plain language through
				an AI assistant, with open-source tools that researchers in both regions can use.
			</p>
			<p>
				My <a href={resolve('/research')} data-sveltekit-preload-data>research</a> draws on fifteen
				years of work on Islam in francophone West Africa and extensive fieldwork in the region. It
				examines how Muslim communities, particularly youth and women, have engaged with politics,
				education, and the public sphere in Benin, Burkina Faso, Côte d’Ivoire, and Togo since the
				1960s. Before Bayreuth, I was a Research Fellow at
				<a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer"
					>Leibniz-Zentrum Moderner Orient (ZMO)<span class="sr-only"> (opens in new tab)</span></a
				>
				in Berlin, and before that a
				<a
					href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html"
					target="_blank"
					rel="noopener noreferrer"
					>Banting Postdoctoral Fellow<span class="sr-only"> (opens in new tab)</span></a
				>
				at the
				<a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer"
					>University of Florida<span class="sr-only"> (opens in new tab)</span></a
				>.
			</p>
			<p>
				Beyond academia, I work with <a
					href="https://communitology.co/"
					target="_blank"
					rel="noopener noreferrer">Communitology<span class="sr-only"> (opens in new tab)</span></a
				>
				to produce specialised Country of Origin Information (COI) reports for asylum and immigration
				cases involving Benin, Côte d’Ivoire, and Togo.
			</p>
		</ContentBody>
	</section>

	<!-- The two halves of the work, side by side. -->
	<div class="home-columns">
		<section class="section home-col" aria-labelledby="home-publications">
			<h2 class="section-title home-col-title" id="home-publications">Selected publications</h2>
			<ol class="covers">
				{#each data.books as book (book.id)}
					{@const src = assetHref(book.image)}
					{@const size = imageDimensions(src)}
					<li>
						<a class="cover" href={resolve('/publications/[id]', { id: book.id })}>
							<img
								class="plate cover-plate"
								{src}
								srcset={buildSrcset(src)}
								sizes={COVER_SIZES}
								alt=""
								width={size?.width}
								height={size?.height}
								loading="lazy"
								decoding="async"
							/>
							<span class="cover-year">{book.year}{book.edited ? ' · Co-edited' : ''}</span>
							<span class="cover-title">{book.title}</span>
						</a>
					</li>
				{/each}
			</ol>
			<ol
				class="ledger writing"
				class:writing--forthcoming={data.writing.some((work) => work.when !== String(work.year))}
			>
				{#each data.writing as work (work.id)}
					<li>
						<a class="ledger-row writing-row" href={resolve('/publications/[id]', { id: work.id })}>
							<span class="ledger-key">{work.when}</span>
							<span class="ledger-content">
								<span class="writing-title">{work.title}</span>
								{#if work.venue}<span class="writing-venue">{work.venue}</span>{/if}
							</span>
						</a>
					</li>
				{/each}
			</ol>
			<p class="home-cta">
				<Button href={resolve('/publications')} variant="outline-secondary" size="base">
					View all {data.record.publications} publications <span aria-hidden="true">→</span>
				</Button>
			</p>
		</section>

		<section class="section home-col" aria-labelledby="home-dh">
			<h2 class="section-title home-col-title" id="home-dh">Digital humanities and software</h2>
			<h3 class="rail-label dh-group">Collections</h3>
			<ul class="dh-list">
				{#each data.collections as card (card.id)}
					{@render dhCard(card)}
				{/each}
			</ul>
			<h3 class="rail-label dh-group">Apps</h3>
			<ul class="dh-list dh-list--apps">
				{#each data.apps as card (card.id)}
					{@render dhCard(card)}
				{/each}
			</ul>
			<p class="home-cta">
				<Button href={resolve('/digital-humanities')} variant="outline-secondary" size="base">
					View all projects and apps <span aria-hidden="true">→</span>
				</Button>
			</p>
		</section>
	</div>

	<ActivityFeed log={data.activityLog} />

	<OutputRecordChart record={data.record} />
</div>

<style>
	/* The record shell every detail route uses: `--container-lg`, centred. A
	 * cap, not a second `.container` (the One Rail Rule). */
	.home-shell {
		max-width: var(--container-lg);
		margin-inline: auto;
		padding-block: var(--space-xl) var(--space-3xl);
	}

	/* ---- Lede ---------------------------------------------------------- */

	/* A masthead in three bands: the dateline across the page, the name and
	 * thesis beside the portrait, then the Now ledger across the page again. */
	.home-lede {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas: 'dateline' 'portrait' 'main' 'now';
		row-gap: var(--space-lg);
		padding-bottom: var(--space-xl);
	}

	.lede-dateline {
		grid-area: dateline;
	}

	.lede-main {
		grid-area: main;
	}

	.now-ledger {
		grid-area: now;
	}

	/* On a phone the portrait is the lead plate under the dateline: the full
	 * width of the column, cropped to a landscape frame that never stands
	 * taller than 22rem, so it neither floats beside empty ground nor pushes
	 * the name below the fold. */
	.home-portrait {
		grid-area: portrait;
		margin: 0;
	}

	.home-portrait .plate {
		width: 100%;
		aspect-ratio: 3 / 2;
		max-height: 22rem;
		object-fit: cover;
		object-position: 50% 25%;
	}

	.lede-dateline {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-2xs) var(--space-md);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	.home-name {
		margin: 0 0 var(--space-sm);
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-nameplate);
		font-weight: 850;
		font-size: var(--font-size-xl);
		line-height: 1.05;
		text-transform: uppercase;
		color: var(--color-text-emphasis);
	}

	.home-thesis {
		margin: 0;
		max-width: 30ch;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-snug);
		letter-spacing: var(--tracking-title);
		color: var(--color-text-emphasis);
	}

	/* What is happening now, as a ledger: key, entry, date. */
	.now-ledger {
		margin: var(--space-sm) 0 0;
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.now-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-2xs) var(--space-md);
		align-items: baseline;
		padding: var(--space-sm) 0;
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	.now-row dt {
		grid-column: 1 / -1;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.now-row dd {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
	}

	.now-row .now-when {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text);
		white-space: nowrap;
	}

	/* A grouped key's later entries sit a step below the first, with no
	 * hairline between: the entries belong to one key. */
	.now-row .now-also {
		padding-top: var(--space-xs);
	}

	/* The next talk is the current thing: its key and date take the accent. */
	.now-row--next dt,
	.now-row--next .now-when {
		color: var(--color-accent);
	}

	@media (--md) {
		.home-lede {
			grid-template-columns: minmax(0, 1fr) 15rem;
			grid-template-areas: 'dateline dateline' 'main portrait' 'now now';
			column-gap: var(--space-2xl);
			padding-top: var(--space-md);
		}

		/* The portrait stands as tall as the name and thesis beside it, cropped
		 * rather than stretched, and never taller than a portrait plate. */
		.home-portrait {
			--portrait-max: 21rem;
			display: flex;
			max-height: var(--portrait-max);
		}

		.home-portrait .plate {
			height: 100%;
			max-height: none;
			aspect-ratio: auto;
		}

		.home-name {
			font-size: var(--font-size-2xl);
		}

		.now-row {
			grid-template-columns: 7.5rem minmax(0, 1fr) auto;
			column-gap: var(--space-lg);
		}

		.now-row dt {
			grid-column: auto;
		}

		/* The key hangs beside every entry it heads. */
		.now-row--group dt {
			grid-row: span 2;
		}
	}

	@media (--lg) {
		.home-lede {
			grid-template-columns: minmax(0, 1fr) 18.75rem;
			column-gap: var(--space-3xl);
		}

		.home-portrait {
			--portrait-max: 26rem;
		}

		.home-thesis {
			font-size: var(--font-size-3xl);
		}
	}

	/* ---- Publications | Digital humanities ----------------------------- */

	.home-columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.home-col-title {
		margin-bottom: var(--space-lg);
	}

	/* Side by side from --lg, a hairline down the gutter. Each column keeps the
	 * 3px rule that opens it, so the rule runs the full width across both. */
	@media (--lg) {
		.home-columns {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.home-col + .home-col {
			margin-top: 0;
			padding-left: var(--space-xl);
			border-left: var(--rule-hairline) solid var(--color-hairline);
		}

		.home-col:first-child {
			padding-right: var(--space-xl);
		}
	}

	.covers {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-md);
		list-style: none;
		margin: 0 0 var(--space-lg);
		padding: 0;
	}

	.cover {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.cover:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-offset);
	}

	.cover-plate {
		aspect-ratio: 2 / 3;
		margin-bottom: var(--space-2xs);
		border-color: var(--color-primary);
	}

	.cover-year {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.cover-title {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-caption);
	}

	.cover:hover .cover-title,
	.writing-row:hover .writing-title,
	.dh-title a:hover {
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-underline-offset: 0.2em;
	}

	/* The ledger rows here are links: no hanging key wider than a year, unless
	 * a forthcoming work is listed, when every key widens to hold the word on
	 * one line and the titles stay aligned. */
	.writing {
		--ledger-key-w: 3.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	.writing--forthcoming {
		--ledger-key-w: 6.5rem;
	}

	.writing-row {
		padding-block: var(--space-sm);
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.writing-row:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-inset);
	}

	.writing .ledger-key {
		font-size: var(--font-size-xs);
	}

	.writing-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
	}

	.writing-venue {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
	}

	.home-cta {
		margin: var(--space-lg) 0 0;
	}

	.dh-group {
		margin: 0 0 var(--space-md);
		padding-bottom: var(--space-2xs);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	.dh-list {
		display: grid;
		gap: var(--space-lg);
		list-style: none;
		margin: 0 0 var(--space-xl);
		padding: 0;
	}

	.dh-card {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: var(--space-md);
		align-items: start;
	}

	.dh-list--apps .dh-card {
		grid-template-columns: 7rem minmax(0, 1fr);
	}

	@media (--md) {
		.dh-card {
			grid-template-columns: 12rem minmax(0, 1fr);
		}

		.dh-list--apps .dh-card {
			grid-template-columns: 8rem minmax(0, 1fr);
		}
	}

	.dh-plate {
		aspect-ratio: 16 / 10;
		object-position: top left;
		border-color: var(--color-primary);
	}

	.dh-title {
		margin: 0 0 var(--space-2xs);
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-headline);
		font-weight: 750;
		font-size: var(--font-size-lg);
		line-height: 1.1;
		letter-spacing: var(--tracking-display-sm);
	}

	.dh-title a {
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.dh-blurb {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text-soft);
	}

	.dh-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs) var(--space-lg);
		margin: var(--space-sm) 0 0;
	}

	/* Value above label, as the eye reads a figure; the markup keeps dt first. */
	.dh-stats div {
		display: flex;
		flex-direction: column-reverse;
	}

	.dh-stat-value {
		margin: 0;
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-weight: 850;
		font-size: var(--font-size-xl);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		color: var(--color-text-emphasis);
	}

	.dh-stat-label,
	.dh-meta {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* Platform, then where to get it: the store is a real link, with the
	 * store's mark, because installing is what a reader does next. */
	.dh-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2xs) var(--space-xs);
		margin: var(--space-xs) 0 0;
	}

	.dh-store {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		color: var(--color-text-emphasis);
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-underline-offset: 0.25em;
		transition: color 150ms ease;
	}

	.dh-store:hover {
		color: var(--color-accent);
	}

	.dh-store:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-offset);
	}

	@media (--reduced-motion) {
		.dh-store {
			transition: none;
		}
	}

	/* ---- About ----------------------------------------------------------- */

	/* The heading sits above the prose, like every other section on the page.
	 * From --md the prose fills the rail in two columns ruled like the
	 * publications and digital-humanities columns above it; a column is never
	 * narrower than 20rem, so a rail too narrow for two sets one, full width.
	 * A paragraph never breaks across the columns. */
	.home-about .section-title {
		margin-bottom: var(--space-lg);
	}

	.home-about :global(.home-prose) {
		padding: 0;
		max-width: var(--measure-prose);
	}

	.home-about :global(.home-prose > p) {
		font-size: var(--font-size-prose);
		line-height: var(--line-height-relaxed);
	}

	@media (--md) {
		.home-about :global(.home-prose) {
			max-width: none;
			columns: 2 20rem;
			column-gap: var(--space-xl);
			column-rule: var(--rule-hairline) solid var(--color-hairline);
		}

		.home-about :global(.home-prose > p) {
			break-inside: avoid-column;
			margin-top: 0;
		}
	}

	@media (--lg) {
		.home-about :global(.home-prose) {
			column-gap: var(--space-2xl);
		}
	}

	@media print {
		.home-portrait {
			max-width: 10rem;
		}
	}
</style>
