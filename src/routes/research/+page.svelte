<script>
	import { base, resolve } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';

	// Helper to resolve dynamic research project paths
	const resolvePath = (/** @type {string} */ path) => resolve(/** @type {any} */ (path));

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Research', '/research');

	// Research projects data
	const researchProjects = [
		{
			id: 'islams-peripheries-dh-ai-west-africa-central-asia',
			title: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
			years: '2026-2027',
			current: true,
			shortDescription:
				'Applying AI and computational methods to compare Islamic discourse and responses to modernity in the multilingual archives of West Africa and Central Asia.',
			imageUrl: `${base}/images/research/islams-peripheries.webp`
		},
		{
			id: 'dh-ai-african-studies',
			title: 'Digital Humanities and AI in African Studies',
			years: '2025-',
			current: true,
			shortDescription:
				'Exploring how DH and AI can transform knowledge production in African studies through ethical, sustainable, and Africa-centred digital infrastructures.',
			imageUrl: `${base}/images/research/IWAC.webp`
		},
		{
			id: 'religious-activism-campuses-togo-benin',
			title: 'Religious Activism on Campuses in Togo and Benin',
			years: '2021-2024',
			shortDescription:
				"Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
			imageUrl: `${base}/images/research/campus-activism.webp`
		},
		{
			id: 'muslim-minorities-southern-cities-benin-togo',
			title: 'Muslim Minorities in Southern Cities of Benin and Togo',
			years: '2018-2020',
			shortDescription:
				'Investigating the experiences and integration of Muslim minority communities in southern urban areas of Benin and Togo.',
			imageUrl: `${base}/images/research/muslim-minorities.webp`
		},
		{
			id: 'youth-womens-islamic-activism-cote-divoire-burkina-faso',
			title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
			years: '2013-2018',
			shortDescription:
				"Analyzing the evolving roles of youth and women in Islamic movements and organizations in Côte d'Ivoire and Burkina Faso.",
			imageUrl: `${base}/images/research/youth-women-activism.webp`
		}
	];

	// Current vs. concluded projects drive the page's two sections. The first
	// current project gets the broadsheet dossier; any further current projects
	// sit beside it as ruled ledger rows, and only genuinely concluded projects
	// fall under "Earlier projects".
	const currentProjects = researchProjects.filter((p) => p.current);
	const pastProjects = researchProjects.filter((p) => !p.current);

	// Project-period timeline (Gantt-style): one horizontal bar per project,
	// positioned and sized to its span across the full research axis — the
	// periods themselves are the ornament, not a per-year density. Current
	// projects read in pine, concluded ones in ink.
	const CAREER_START = 2013;
	const CAREER_END = 2027;
	const AXIS_SPAN = CAREER_END - CAREER_START;
	const parseSpan = (/** @type {string} */ years) => {
		const [rawStart, rawEnd] = years.split('-');
		const start = parseInt(rawStart, 10);
		const end = rawEnd ? parseInt(rawEnd, 10) : CAREER_END;
		return { start, end: Number.isNaN(end) ? CAREER_END : end };
	};
	const timelineBars = researchProjects.map((p) => {
		const { start, end } = parseSpan(p.years);
		const left = ((start - CAREER_START) / AXIS_SPAN) * 100;
		const width = Math.max(((end - start) / AXIS_SPAN) * 100, 4);
		return { title: p.title, current: !!p.current, left, width };
	});

	// Present a span nicely: "2026 – 2027", or "Since 2025" for open-ended work.
	const formatPeriod = (/** @type {string} */ years) =>
		years.endsWith('-') ? `Since ${years.slice(0, -1)}` : years.replace('-', ' – ');
</script>

<SEO
	title="Research | Frédérick Madore"
	description="Research at the intersection of African history, Islamic studies, and digital humanities. Exploring Islam and Muslim societies in Francophone West Africa, with focus on youth, women, religious minorities, and computational methodologies."
	keywords="African history, Islamic studies, digital humanities, West Africa, Muslim societies, youth activism, women, religious minorities, Benin, Togo, Côte d'Ivoire, Burkina Faso, computational methods, Islamic discourse, Muslim politics, Frédérick Madore"
	canonical="https://www.frederickmadore.com/research"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8 page-enter">
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Research" />

		<PageIntro>
			My research lies at the intersection of African history, Islamic Studies, and Digital
			Humanities. I explore the contemporary history of Islam and Muslim societies in francophone
			West Africa. I focus on how youth, women, and religious minorities have engaged with religious
			activism, the media and political life from the 1960s to the present day. By combining
			extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso with
			computational methodologies, I examine the evolving landscape of Islamic discourse and Muslim
			politics.
		</PageIntro>

		<!-- Project-period timeline — one Gantt bar per project across the years. -->
		<section class="periods" aria-hidden="true">
			<p class="eyebrow eyebrow--ink periods-label">
				Project periods · {CAREER_START}–{CAREER_END}
			</p>
			<div class="period-bars">
				{#each timelineBars as bar (bar.title)}
					<div class="period-track">
						<span
							class="period-bar {bar.current ? 'period-bar--current' : ''}"
							style="left: {bar.left}%; width: {bar.width}%"
						></span>
					</div>
				{/each}
			</div>
			<div class="period-legend">
				<span>{CAREER_START}</span>
				<span>Project periods</span>
				<span>{CAREER_END}</span>
			</div>
		</section>

		<!-- CURRENT PROJECTS — broadsheet dossier for the flagship, ruled ledger
		     rows for any other still-running projects. -->
		<section class="section section--flush lead-dossier scroll-reveal">
			<div class="section-head">
				<span class="section-no">№ 01</span>
				<h2 class="section-title">
					{currentProjects.length > 1 ? 'Current projects' : 'Current project'}
				</h2>
			</div>

			<div class="dossier-stack grid-stagger">
				{#each currentProjects as project, i (project.id)}
					<article class="dossier {i === 0 ? 'dossier--lead' : ''}">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
						<a class="dossier-plate-link" href={resolvePath(`/research/${project.id}`)}>
							<img class="plate dossier-plate" src={project.imageUrl} alt={project.title} />
						</a>

						<div class="dossier-body">
							<p class="eyebrow dossier-dateline">
								{formatPeriod(project.years)}{project.years.endsWith('-') ? '' : ' · Ongoing'}
							</p>
							<h3 class="dossier-title">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
								<a href={resolvePath(`/research/${project.id}`)}>{project.title}</a>
							</h3>
							<p class="dossier-desc">{project.shortDescription}</p>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
							<a class="dossier-action" href={resolvePath(`/research/${project.id}`)}>
								Explore project →
							</a>
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- CATALOGUE — concluded projects as ruled ledger entries. -->
		{#if pastProjects.length > 0}
			<section class="section catalogue scroll-reveal">
				<div class="section-head">
					<span class="section-no">№ 02</span>
					<h2 class="section-title">Earlier projects</h2>
				</div>

				<div class="ledger ledger--ruled grid-stagger">
					{#each pastProjects as project (project.id)}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
						<a
							class="ledger-row ledger-entry"
							href={resolvePath(`/research/${project.id}`)}
							style="--ledger-key-w: 8rem"
						>
							<span class="ledger-key">{formatPeriod(project.years)}</span>
							<span class="ledger-content">
								<span class="ledger-title">{project.title}</span>
								<span class="ledger-desc">{project.shortDescription}</span>
								<span class="ledger-action">Read more →</span>
							</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	/* Project-period timeline — Gantt bars, one per project, under the intro.
	 * The periods themselves are the ornament: each bar spans its project's
	 * years across a shared 2013–2027 axis, current work in pine. */
	.periods {
		margin: var(--space-xl) 0 var(--space-2xl);
	}

	.periods-label {
		margin-bottom: var(--space-sm);
	}

	.period-bars {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.period-track {
		position: relative;
		height: 12px;
	}

	.period-bar {
		position: absolute;
		top: 2px;
		bottom: 2px;
		min-width: 4px;
		background: var(--color-primary);
	}

	.period-bar--current {
		background: var(--color-accent);
	}

	.period-legend {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: var(--rule-hairline) solid var(--color-border);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* ---- Current-project dossiers — plate + headline, one per running project ---- */
	.dossier-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
	}

	.dossier {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		align-items: start;
	}

	.dossier-plate-link {
		display: block;
	}

	.dossier-plate {
		aspect-ratio: 16 / 9;
		height: auto;
	}

	.dossier-dateline {
		margin-bottom: var(--space-sm);
	}

	.dossier-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-3xl);
		font-weight: 780;
		letter-spacing: -0.015em;
		line-height: 1.03;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm);
		text-wrap: balance;
	}

	.dossier-title a {
		color: inherit;
		text-decoration: none;
	}

	.dossier-title a:hover {
		color: var(--color-accent);
	}

	.dossier-desc {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0 0 var(--space-md);
		max-width: 60ch;
	}

	.dossier-action {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--color-accent);
		text-decoration: none;
	}

	.dossier-action:hover {
		color: var(--color-accent-dark);
	}

	/* ---- Ledger entries (earlier projects) ---- */
	.catalogue {
		margin-top: var(--space-2xl);
	}

	.ledger-entry {
		text-decoration: none;
		color: inherit;
		transition: background var(--duration-fast) var(--ease-out);
	}

	.ledger-entry:hover {
		background: var(--color-surface-alt);
	}

	.ledger-entry:hover .ledger-title {
		color: var(--color-accent);
	}

	.ledger-entry:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: calc(-1 * var(--border-width-medium));
	}

	.ledger-action {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--color-accent);
		margin-top: var(--space-1);
	}

	@media (--md) {
		/* Broadsheet: plate left, headline column right. */
		.dossier {
			grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
			gap: var(--space-2xl);
			align-items: center;
		}

		/* The flagship reads one step louder than the other running projects. */
		.dossier--lead .dossier-title {
			font-size: var(--font-size-4xl);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ledger-entry {
			transition: none;
		}
	}
</style>
