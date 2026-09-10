<script>
	import { base, resolve } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { allResearchProjects } from '$lib/data/research';
	import { buildSrcset } from '$lib/utils/imageVariants';
	import { formatProjectPeriod } from '$lib/utils/projectPeriod';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	// Helper to resolve dynamic research project paths
	const resolvePath = (/** @type {string} */ path) => resolve(/** @type {any} */ (path));

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Research', '/research');

	// Research projects, shared with the detail pages, /llms.txt and
	// /api/research.json — this page renders the records, it does not own them.
	// The card title falls back to the full title; `imageSrc` is a bare filename.
	// Both prose fields are typeset here, once, so the dossier lead and the
	// ledger rows below print the same title in the same register.
	//
	// `period` and `credit` are formatted here for the same reason: they are the
	// two apparatus values this page prints, and each project's own masthead
	// prints them from the same record. `formatProjectPeriod` is shared with that
	// masthead so "2026-" can never read one way here and another there.
	const researchProjects = allResearchProjects.map((p) => {
		const imageUrl = `${base}/images/research/${p.imageSrc}`;
		return {
			id: p.id,
			title: typesetQuotes(p.cardTitle ?? p.title),
			years: p.years,
			period: formatProjectPeriod(p.years),
			// What is funding or hosting the work — the funder when the record
			// names one, otherwise the programme. Real apparatus, from the record,
			// at no extra bundle cost.
			credit: typesetQuotes(p.funder ?? p.programme),
			current: p.current,
			shortDescription: typesetQuotes(p.shortDescription),
			imageUrl,
			imageSrcset: buildSrcset(imageUrl)
		};
	});

	// Current vs. concluded projects drive the page's two sections. The first
	// current project gets the broadsheet dossier; any further current projects
	// sit beside it as ruled ledger rows, and only genuinely concluded projects
	// fall under "Earlier projects".
	const currentProjects = researchProjects.filter((p) => p.current);
	const leadProject = currentProjects[0];
	const otherCurrentProjects = currentProjects.slice(1);
	const pastProjects = researchProjects.filter((p) => !p.current);

	// Project-period timeline (Gantt-style): one horizontal bar per project,
	// positioned and sized to its span across the full research axis — the
	// periods themselves are the ornament, not a per-year density. Current
	// projects read in pine, concluded ones in ink.
	//
	// The axis is read off the records, never hardcoded: a constant end year
	// once sat at 2027 while a project ran to 2028, and its bar overshot the
	// axis it was supposed to be drawn on. An open-ended period ("2026-") has no
	// end of its own, so it runs to the latest year any closed period names —
	// or to the present, if every closed project has already ended.
	const parseSpan = (/** @type {string} */ years) => {
		const [rawStart = '', rawEnd] = years.split('-');
		const start = parseInt(rawStart, 10);
		const end = rawEnd ? parseInt(rawEnd, 10) : Number.NaN;
		return { start, end: Number.isNaN(end) ? null : end };
	};
	const spans = researchProjects.map((p) => parseSpan(p.years));
	const CAREER_START = Math.min(...spans.map((s) => s.start));
	const CAREER_END = Math.max(
		new Date().getFullYear(),
		...spans.flatMap((s) => (s.end === null ? [] : [s.end]))
	);
	const AXIS_SPAN = Math.max(1, CAREER_END - CAREER_START);
	const timelineBars = researchProjects.map((p) => {
		const span = parseSpan(p.years);
		const start = span.start;
		const end = span.end ?? CAREER_END;
		const left = ((start - CAREER_START) / AXIS_SPAN) * 100;
		const width = Math.max(((end - start) / AXIS_SPAN) * 100, 4);
		return { title: p.title, current: !!p.current, left, width };
	});

	// The dossier plate is the reading column's own width until --md, then a
	// little over half of it; the ledger entry plates never exceed 176px.
	const DOSSIER_PLATE_SIZES = '(max-width: 768px) 100vw, 45vw';
	const ENTRY_PLATE_SIZES = '(max-width: 768px) 96px, 176px';
</script>

<SEO
	title="Research | Frédérick Madore"
	description="Research projects by Frédérick Madore: Islam in francophone West Africa since the 1960s, AI and digital humanities, and African research infrastructure."
	keywords="African history, Islamic studies, digital humanities, artificial intelligence, West Africa, Muslim societies, Muslim youth, Muslim women, religious minorities, religious activism, Benin, Burkina Faso, Côte d'Ivoire, Togo, Niger, Nigeria, Central Asia, Islam West Africa Collection, IWAC, Africa Multiple, research data infrastructure, computational methods, Islamic discourse, Muslim politics, Frédérick Madore"
	canonical="https://www.frederickmadore.com/research"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8">
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Research" />

		<PageIntro>
			Islam and Muslim societies in francophone West Africa since the 1960s: how youth, women, and
			religious minorities have shaped activism, the media, and political life. I build the
			collections I study, analyse them with digital humanities methods, and experiment with AI.
			That work now reaches Central Asian collections, the research infrastructure of the Africa
			Multiple Cluster, and the question of what these methods do to African studies.
		</PageIntro>

		<!-- Project-period timeline — one Gantt bar per project across the years.
		     Ornamental rather than navigational: every span it draws is printed as
		     a date in the ledger below, which is why it is hidden from assistive
		     technology instead of being given labels that would repeat the list. -->
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
				<span>{CAREER_END}</span>
			</div>
		</section>

		<!-- CURRENT PROJECTS — a broadsheet dossier for the flagship, ruled ledger
		     rows for the rest. The section head is what says this work is running,
		     so no row repeats it as a status stamp. -->
		{#if leadProject}
			<section class="section section--flush">
				<div class="section-head">
					<h2 class="section-title">
						{currentProjects.length > 1 ? 'Current projects' : 'Current project'}
					</h2>
				</div>

				<article class="dossier">
					<!-- The plate is a second route to a page the headline and the
					     action below already link. It stays clickable for the mouse
					     and is taken out of the accessibility tree and the tab order,
					     so the destination is announced once, not three times. -->
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
					<a
						class="dossier-plate-link"
						href={resolvePath(`/research/${leadProject.id}`)}
						tabindex="-1"
						aria-hidden="true"
					>
						<img
							class="plate dossier-plate"
							src={leadProject.imageUrl}
							srcset={leadProject.imageSrcset}
							sizes={leadProject.imageSrcset ? DOSSIER_PLATE_SIZES : undefined}
							alt=""
							width="1280"
							height="720"
							loading="lazy"
							decoding="async"
						/>
					</a>

					<div class="dossier-body">
						<p class="eyebrow dossier-dateline">
							<span>{leadProject.period}</span>
							{#if leadProject.credit}<span class="eyebrow-sep" aria-hidden="true">·</span><span
									>{leadProject.credit}</span
								>{/if}
						</p>
						<h3 class="dossier-title">
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
							<a class="link-animated" href={resolvePath(`/research/${leadProject.id}`)}
								>{leadProject.title}</a
							>
						</h3>
						<p class="dossier-desc">{leadProject.shortDescription}</p>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
						<a class="dossier-action" href={resolvePath(`/research/${leadProject.id}`)}>
							View project<span aria-hidden="true">&nbsp;→</span>
						</a>
					</div>
				</article>

				{#if otherCurrentProjects.length > 0}
					<div class="ledger ledger--ruled catalogue">
						{#each otherCurrentProjects as project (project.id)}
							{@render entry(project)}
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		<!-- CATALOGUE — concluded projects as ruled ledger entries. -->
		{#if pastProjects.length > 0}
			<section class="section">
				<div class="section-head">
					<h2 class="section-title">Earlier projects</h2>
				</div>

				<div class="ledger ledger--ruled">
					{#each pastProjects as project (project.id)}
						{@render entry(project)}
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<!-- One ledger entry, used by both sections so a running project and a concluded
     one are set identically — the section head above is the only thing that
     distinguishes them. The whole row is the link; the period hangs in the key
     column and the funder or programme closes the entry in the data voice. -->
{#snippet entry(/** @type {(typeof researchProjects)[number]} */ project)}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolvePath -->
	<a
		class="ledger-row ledger-entry"
		href={resolvePath(`/research/${project.id}`)}
		style="--ledger-key-w: 8rem"
	>
		<span class="ledger-key">{project.period}</span>
		<span class="entry-body">
			<img
				class="plate entry-plate"
				src={project.imageUrl}
				srcset={project.imageSrcset}
				sizes={project.imageSrcset ? ENTRY_PLATE_SIZES : undefined}
				alt=""
				width="176"
				height="99"
				loading="lazy"
				decoding="async"
			/>
			<span class="ledger-content">
				<span class="ledger-title">{project.title}</span>
				<span class="ledger-desc">{project.shortDescription}</span>
				{#if project.credit}<span class="dateline entry-credit">{project.credit}</span>{/if}
			</span>
		</span>
	</a>
{/snippet}

<style>
	/* Project-period timeline — Gantt bars, one per project, under the intro.
	 * The periods themselves are the ornament: each bar spans its project's
	 * years across one axis read off the records, current work in pine. */
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
		border-top: var(--rule-hairline) solid var(--color-hairline);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* ---- The lead dossier — plate + headline for the flagship project ---- */
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
		width: 100%;
		aspect-ratio: 16 / 9;
		height: auto;
		/* Sources aren't all 16:9 (one is square) — crop instead of stretching. */
		object-fit: cover;
	}

	/* Same shape as the masthead eyebrow on the project's own page: period,
	   then what funds or hosts the work, separated by a mono interpunct. */
	.dossier-dateline {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		margin-bottom: var(--space-sm);
	}

	.eyebrow-sep {
		color: var(--color-text-muted);
	}

	.dossier-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-3xl);
		font-weight: 780;
		letter-spacing: var(--tracking-display);
		line-height: 1.03;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm);
		text-wrap: balance;
	}

	.dossier-desc {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0 0 var(--space-md);
		max-width: var(--measure-prose);
	}

	/* The page's single accent action. Every other route into a project is the
	   ledger row itself, so pine still means "the current thing". */
	.dossier-action {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-accent);
		text-decoration: none;
	}

	.dossier-action:hover {
		color: var(--color-accent-dark);
	}

	/* ---- Ledger entries ---- */
	/* The rows under the dossier open a second block inside the same section, so
	   they need the interval the section rule gives the dossier above them. */
	.catalogue {
		margin-top: var(--space-2xl);
	}

	.ledger-entry {
		text-decoration: none;
		color: inherit;
		/* The plate makes the row tall, so top-align the date key instead of
		   baseline-aligning it against a replaced element. */
		align-items: start;
		transition: background var(--duration-fast) var(--ease-out);
	}

	/* Plate + text share the ledger's content column, so the entries carry the
	   same image as the lead dossier at catalogue scale. */
	.entry-body {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
		min-width: 0;
	}

	.entry-plate {
		flex: none;
		width: 96px;
		/* Echo the dossier plate; sources aren't all 16:9, so crop. */
		aspect-ratio: 16 / 9;
		height: auto;
		object-fit: cover;
	}

	/* What funds or hosts the project, closing the entry in the data voice. */
	.entry-credit {
		margin-top: var(--space-1);
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

	@media (--md) {
		/* Broadsheet: plate left, headline column right. */
		.dossier {
			grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
			gap: var(--space-2xl);
			align-items: center;
		}

		.dossier-title {
			font-size: var(--font-size-4xl);
		}

		.entry-plate {
			width: 176px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ledger-entry {
			transition: none;
		}
	}
</style>
