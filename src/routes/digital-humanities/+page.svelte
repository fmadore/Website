<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base, resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import FacetCombobox from '$lib/components/entity-index/FacetCombobox.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import { allDhProjects } from '$lib/data/digital-humanities';
	import { buildSrcset } from '$lib/utils/imageVariants';
	import { formatProjectPeriod } from '$lib/utils/projectPeriod';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Digital Humanities', '/digital-humanities');

	const PER_PAGE = 8;

	/**
	 * The dossier plate is the reading column's own width until --md, then a
	 * little over half of it; the catalogue entry plates never exceed 176px.
	 * Every source here is 1280px wide with 400/800 variants committed, which
	 * nothing on this page was using.
	 */
	const DOSSIER_PLATE_SIZES = '(max-width: 768px) 100vw, 45vw';
	const ENTRY_PLATE_SIZES = '(max-width: 768px) 96px, 176px';

	// The active skill filter is carried in the URL (?skill=…) so any filtered
	// view is bookmarkable/shareable. Only read searchParams in the browser.
	let selectedSkill = $derived(browser ? page.url.searchParams.get('skill') : null);

	// Hero apparatus — total project count and the span the record covers. The
	// span is printed by the same formatter the entries and the project masthead
	// use, so the page states a period in one voice rather than three.
	const projectCount = allDhProjects.length;
	const corpusPeriod = (() => {
		const years = allDhProjects
			.map((p) => parseInt(p.years.slice(0, 4), 10))
			.filter((y) => !Number.isNaN(y));
		const earliest = years.length > 0 ? Math.min(...years) : new Date().getFullYear();
		return formatProjectPeriod(`${earliest}-`);
	})();

	/**
	 * The hero's period strip: one Gantt bar per record across one shared axis.
	 *
	 * The axis is read off the records, never hardcoded — a constant end year is
	 * how a bar ends up overshooting the axis it is drawn on. A record's `years`
	 * is one of three shapes: a point (`2026`), a closed range (`2018-2023`) or
	 * an open one (`2026-`), and only the last is running work, which is what
	 * takes the accent. A record whose `years` parses to nothing simply draws no
	 * bar; the strip states what the catalogue records and invents no span.
	 *
	 * Sorted by start year so the strip reads as a chronology rather than as the
	 * catalogue's own order, which is a relevance ranking.
	 */
	const parseSpan = (years: string) => {
		const [rawStart = '', rawEnd] = years.split('-');
		const start = parseInt(rawStart, 10);
		if (Number.isNaN(start)) return null;
		// `2026-` splits to ['2026', ''] — open-ended, still running.
		const open = rawEnd !== undefined && rawEnd.trim() === '';
		const end = rawEnd ? parseInt(rawEnd, 10) : start;
		return { start, end: Number.isNaN(end) ? start : end, open };
	};
	const spans = allDhProjects
		.map((project) => ({ id: project.id, span: parseSpan(project.years) }))
		.filter((row): row is { id: string; span: NonNullable<ReturnType<typeof parseSpan>> } =>
			Boolean(row.span)
		);
	const AXIS_START = spans.length > 0 ? Math.min(...spans.map((row) => row.span.start)) : 0;
	const AXIS_END = Math.max(
		new Date().getFullYear(),
		...spans.map((row) => (row.span.open ? 0 : row.span.end))
	);
	const AXIS_SPAN = Math.max(1, AXIS_END - AXIS_START);
	const periodBars = spans
		.slice()
		.sort((a, b) => a.span.start - b.span.start || a.span.end - b.span.end)
		.map(({ id, span }) => {
			const end = span.open ? AXIS_END : span.end;
			return {
				id,
				current: span.open,
				left: ((span.start - AXIS_START) / AXIS_SPAN) * 100,
				// A single year is a point on the axis; the floor keeps it visible.
				width: Math.max(((end - span.start) / AXIS_SPAN) * 100, 3)
			};
		});

	/**
	 * Every project, in the display register, prepared once for both modules.
	 *
	 * `period` is formatted by the shared `formatProjectPeriod`, the same
	 * function the project masthead calls: the page used to print `2026-` raw
	 * here, `2026 —` in the featured module and `2026-` again on the record, so
	 * one field read three ways across two modules of one page.
	 *
	 * Every entry addresses its own record page. A project's live site is a
	 * destination the record states, and states with a label; an index that
	 * sometimes leaves the site instead is the inconsistency the memory note
	 * about IWAC's two entry points already warns about.
	 */
	const projects = allDhProjects.map((project) => {
		const imageUrl = `${base}${project.imageUrl.startsWith('/') ? project.imageUrl : `/${project.imageUrl}`}`;
		return {
			id: project.id,
			href: resolve(`/digital-humanities/${project.id}` as `/digital-humanities/${string}`),
			// Prose fields take the display register; the skill keys stay raw,
			// because they are the values the filter matches.
			title: typesetQuotes(project.title),
			shortDescription: typesetQuotes(project.shortDescription),
			period: formatProjectPeriod(project.years),
			skills: project.skills ?? [],
			featured: Boolean(project.featured),
			imageUrl,
			imageSrcset: buildSrcset(imageUrl)
		};
	});

	// Skill facet — frequency of every method across all projects, most used
	// first. Drives the catalogue's chips and the combobox behind them.
	const skillCounts = (() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- build-time tally, not reactive state
		const freq = new Map<string, number>();
		for (const project of allDhProjects) {
			for (const skill of project.skills ?? []) {
				freq.set(skill, (freq.get(skill) ?? 0) + 1);
			}
		}
		return Array.from(freq.entries()).sort((a, b) =>
			b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
		);
	})();

	const skillOptions = skillCounts.map(([skill]) => skill);
	const skillCountMap: Record<string, number> = Object.fromEntries(skillCounts);

	/**
	 * The printed head of the facet: the seven most-used methods, frequency
	 * ranked, as real data. The tail — sixty more values, half of them used
	 * once — is reached by typing rather than by unfolding ten rows of chips
	 * over the catalogue (the 2.2 finding, same shape).
	 *
	 * A value the cut hides is merged back in whenever it is the active filter,
	 * so a `?skill=Rust` deep link always renders a chip that can switch it off
	 * in place rather than only through the note below.
	 */
	const PRIMARY_SKILLS = 7;
	const visibleSkills = $derived.by(() => {
		const head = skillCounts.slice(0, PRIMARY_SKILLS);
		if (!selectedSkill || head.some(([skill]) => skill === selectedSkill)) return head;
		return [...head, [selectedSkill, skillCountMap[selectedSkill] ?? 0] as [string, number]];
	});

	// Featured projects (flagged in the data), hidden while a skill filter is
	// active so a filtered catalogue is exhaustive. The first is the flagship
	// and takes the broadsheet dossier; any others are ledger entries inside
	// the same section, exactly as on /research.
	const featuredProjects = projects.filter((project) => project.featured);
	const leadProject = featuredProjects[0];
	const otherFeatured = featuredProjects.slice(1);
	const shouldShowFeatured = $derived(!selectedSkill && Boolean(leadProject));

	// Catalogue list: when filtering by skill, every matching project (featured
	// included) so the filter is complete; otherwise the non-featured records.
	const catalogueProjects = $derived(
		selectedSkill
			? projects.filter((project) => project.skills.includes(selectedSkill))
			: projects.filter((project) => !project.featured)
	);

	// The catalogue's own tally. Half the methods on record are used by a single
	// project, so a filtered catalogue really does reach one — and "1 projects"
	// on the page that exists to look precise is not a rounding error.
	const catalogueCount = $derived(
		selectedSkill
			? `${catalogueProjects.length} ${catalogueProjects.length === 1 ? 'entry' : 'entries'}`
			: `${catalogueProjects.length} of ${projectCount} entries`
	);

	// Client-side pagination over the catalogue. Reset to page 1 whenever the
	// filter changes (which changes the list length/identity).
	let currentPage = $state(1);
	$effect(() => {
		// Re-run when the skill filter changes.
		void selectedSkill;
		currentPage = 1;
	});

	const pagedProjects = $derived(
		catalogueProjects.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
	);

	function skillHref(skill: string): string {
		return `${base}/digital-humanities?skill=${encodeURIComponent(skill)}`;
	}

	/** Picking the active value again clears the filter — the chips do the same. */
	function toggleSkill(skill: string) {
		const href = skill === selectedSkill ? `${base}/digital-humanities` : skillHref(skill);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed query string
		void goto(href, { keepFocus: true, noScroll: true });
	}

	/** The filter note's way out — the same action the three sibling indexes fire. */
	function clearSkill() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed path
		void goto(`${base}/digital-humanities`, { keepFocus: true, noScroll: true });
	}
</script>

<SEO
	title="Digital Humanities | Frédérick Madore"
	description="Digital humanities projects by Frédérick Madore including the Islam West Africa Collection (IWAC), AI-assisted workflows, and data visualisation."
	keywords="digital humanities, IWAC, Islam West Africa Collection, AI, machine learning, data visualisation, Frédérick Madore"
	canonical="https://www.frederickmadore.com/digital-humanities"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8">
	<div class="max-w-6xl mx-auto">
		<!-- HERO — the 4px masthead rule, a mono infrastructure eyebrow, the
		     shared Archivo `.index-title`, a serif standfirst, and the record's
		     own project periods drawn beside it. The head previously carried no
		     rule at all and sat on the wide display axis, so the one index page
		     that is entirely about structured data opened as the least-drawn
		     masthead on the site. -->
		<header class="dh-hero index-masthead">
			<div class="dh-hero-lede">
				<p class="eyebrow dh-hero-eyebrow">
					Infrastructure · {projectCount} entries · {corpusPeriod}
				</p>
				<h1 class="index-title">Digital Humanities</h1>
				<p class="standfirst">
					Not an end in itself, but a response to a concrete problem. After years of fieldwork
					across West Africa, I had accumulated thousands of documents that exceeded what
					traditional methods could process. These projects turn that accumulation into open
					research infrastructure — digital archives, AI-assisted pipelines, interactive
					visualisations, and conversational interfaces — so that African historical sources are not
					only preserved but made usable.
				</p>
			</div>

			<!-- Project-period strip — one bar per record across the axis the
			     catalogue covers, running work in pine. Same idiom as /research.
			     Every span it draws is printed as a period in the key column of
			     the entry below, so it is hidden from assistive technology rather
			     than given labels that read the catalogue back a second time. -->
			{#if periodBars.length > 0}
				<section class="periods dh-periods" aria-hidden="true">
					<p class="eyebrow eyebrow--ink periods-label">
						Project periods · {AXIS_START}–{AXIS_END}
					</p>
					<div class="period-bars">
						{#each periodBars as bar (bar.id)}
							<div class="period-track">
								<span
									class="period-bar"
									class:period-bar--current={bar.current}
									style="left: {bar.left}%; width: {bar.width}%"
								></span>
							</div>
						{/each}
					</div>
					<div class="period-legend">
						<span>{AXIS_START}</span>
						<span>{AXIS_END}</span>
					</div>
				</section>
			{/if}
		</header>

		<!-- FEATURED — one broadsheet dossier for the flagship, ledger entries for
		     any further featured project. The section head is what says this work
		     leads, so no entry carries a badge saying it. -->
		{#if shouldShowFeatured && leadProject}
			<section class="section section--flush" aria-labelledby="dh-featured-heading">
				<div class="section-head">
					<h2 class="section-title" id="dh-featured-heading">Featured</h2>
				</div>

				<article class="dossier">
					<!-- The plate is a second route to a page the headline and the
					     action below already link. It stays clickable for the mouse
					     and leaves the tab order and the accessibility tree, so the
					     destination is announced once rather than three times. -->
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved route -->
					<a class="dossier-plate-link" href={leadProject.href} tabindex="-1" aria-hidden="true">
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
						<p class="eyebrow dossier-dateline">{leadProject.period}</p>
						<h3 class="dossier-title">
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved route -->
							<a class="link-animated" href={leadProject.href}>{leadProject.title}</a>
						</h3>
						<p class="dossier-desc">{leadProject.shortDescription}</p>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved route -->
						<a class="dossier-action" href={leadProject.href}>
							View project <span aria-hidden="true">→</span>
						</a>
					</div>
				</article>

				{#if otherFeatured.length > 0}
					<div class="ledger ledger--ruled featured-rest">
						{#each otherFeatured as project (project.id)}
							{@render entry(project)}
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		<!-- CATALOGUE — 3px rule, Archivo head with a live count, the methods
		     facet, then ruled ledger entries. -->
		<section
			class="section"
			class:section--flush={!shouldShowFeatured}
			aria-labelledby="dh-catalogue-heading"
		>
			<div class="section-head">
				<h2 class="section-title" id="dh-catalogue-heading">Catalogue</h2>
				<span class="dateline catalogue-count">{catalogueCount}</span>
			</div>

			<!-- eslint-disable svelte/no-navigation-without-resolve -- skill filter URLs (base-prefixed query strings) -->
			<div class="catalogue-filter">
				<div class="chip-row">
					<!-- "ALL n" — selected (ink fill) when no skill filter is active. -->
					<a
						class="chip"
						class:chip--selected={!selectedSkill}
						href="{base}/digital-humanities"
						aria-current={!selectedSkill ? 'true' : undefined}
					>
						All <span class="chip-count">{projectCount}</span>
					</a>

					{#each visibleSkills as [skill, count] (skill)}
						<a
							class="chip"
							class:chip--selected={selectedSkill === skill}
							href={skillHref(skill)}
							rel="nofollow"
							aria-current={selectedSkill === skill ? 'true' : undefined}
						>
							{skill} <span class="chip-count">{count}</span>
						</a>
					{/each}
				</div>

				<!-- The tail of the facet — sixty more methods — is typed for rather
				     than unfolded over the catalogue. -->
				<div class="catalogue-search">
					<FacetCombobox
						options={skillOptions}
						counts={skillCountMap}
						selected={selectedSkill ? [selectedSkill] : []}
						label="methods"
						ontoggle={toggleSkill}
					/>
				</div>
			</div>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->

			{#if selectedSkill}
				<!-- The same sentence the other three indexes print: what is
				     narrowing, how much of the catalogue survives it, and the way
				     out — one control, `.mono-action`. -->
				<p class="filter-note">
					<span class="filter-note-label">Filtered by method</span>
					<span class="filter-note-value">{selectedSkill}</span>
					<span class="filter-note-count" aria-live="polite">
						{catalogueProjects.length} of {projectCount}
						{projectCount === 1 ? 'entry' : 'entries'}
					</span>
					<button type="button" class="mono-action" onclick={clearSkill}>
						Clear all <span aria-hidden="true">✕</span>
					</button>
				</p>
			{/if}

			{#if catalogueProjects.length === 0}
				<p class="catalogue-empty">No projects are filed under “{selectedSkill}”.</p>
				<p class="catalogue-empty">The catalogue holds {projectCount} entries.</p>
			{:else}
				<div class="ledger ledger--ruled" id="dh-catalogue">
					{#each pagedProjects as project (project.id)}
						{@render entry(project)}
					{/each}
				</div>

				<Pagination
					page={currentPage}
					perPage={PER_PAGE}
					total={catalogueProjects.length}
					scrollTargetId="dh-catalogue"
					onchange={(p) => (currentPage = p)}
				/>
			{/if}
		</section>
	</div>
</div>

<!--
One catalogue entry, shared by the featured block and the catalogue so a
flagship's sibling and a concluded project are set identically — the section
head above is the only thing that distinguishes them. The period hangs in the
key column, the plate and the record share the content column, and the project's
own methods close the entry as apparatus.
-->
{#snippet entry(project: (typeof projects)[number])}
	<article class="ledger-row dh-entry">
		<span class="ledger-key">{project.period}</span>
		<div class="dh-entry-body">
			{#if project.imageUrl}
				<img
					class="plate dh-entry-plate"
					src={project.imageUrl}
					srcset={project.imageSrcset}
					sizes={project.imageSrcset ? ENTRY_PLATE_SIZES : undefined}
					alt=""
					width="176"
					height="99"
					loading="lazy"
					decoding="async"
				/>
			{/if}
			<div class="ledger-content">
				<h3 class="ledger-title dh-entry-title">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved route -->
					<a class="link-animated" href={project.href}>{project.title}</a>
				</h3>
				<p class="ledger-desc">{project.shortDescription}</p>
				{#if project.skills.length > 0}
					<!-- The record's own methods, set as apparatus rather than as a row
					     of filter controls — see .apparatus-line in ink-signal.css.
					     Each term still activates the catalogue's method filter. -->
					<!-- eslint-disable svelte/no-navigation-without-resolve -- skill filter URLs -->
					<p class="apparatus-line dh-entry-methods">
						{#each project.skills as skill, i (skill)}
							{#if i > 0}
								<span class="apparatus-line-sep" aria-hidden="true">·</span>
							{/if}
							<a class="no-underline" rel="nofollow" href={skillHref(skill)}>{skill}</a>
						{/each}
					</p>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/if}
			</div>
		</div>
	</article>
{/snippet}

<style>
	/* ===== HERO =====
	 * The rule, its interval and the masthead type come from `.index-masthead`
	 * and `.index-title` in `ink-signal.css` — the same declaration every other
	 * section index takes. What is local is the two-track lede: the written half
	 * left, the counted half right, the finding-aid indexes' own shape. */
	.dh-hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	.dh-hero-lede {
		min-width: 0;
	}

	.dh-hero-eyebrow {
		margin-bottom: var(--space-sm);
	}

	/* Sixteen tracks against /research's seven, so the strip takes the idiom's
	 * tunables down a step rather than growing a hero column half a screen
	 * tall. The bars still encode the same thing at the same scale. */
	.dh-periods {
		--period-track-h: 8px;
		--period-gap: var(--space-1);
	}

	@media (--md) {
		.dh-hero {
			grid-template-columns: minmax(0, 1fr) 320px;
			gap: var(--space-2xl);
			align-items: end;
		}
	}

	/* ===== THE FLAGSHIP DOSSIER — plate + headline, one per page ===== */
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
		/* Sources run 1280×695 to 1280×826 — crop to one ratio rather than
		 * letting the lead plate's height jump with whichever record leads. */
		aspect-ratio: 16 / 9;
		height: auto;
		object-fit: cover;
	}

	.dossier-dateline {
		margin-bottom: var(--space-sm);
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
	 * entry's own title, so pine still means "the current thing". */
	.dossier-action {
		display: inline-block;
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

	.dossier-action:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* Entries under the dossier open a second block inside the same section, so
	 * they need the interval the section rule gives the dossier above them. */
	.featured-rest {
		margin-top: var(--space-2xl);
	}

	/* ===== CATALOGUE HEAD & FACET ===== */
	.catalogue-count {
		margin-left: auto;
	}

	.catalogue-filter {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: var(--space-sm) var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.catalogue-filter .chip-row {
		flex: 1 1 20rem;
	}

	.catalogue-search {
		flex: 0 1 18rem;
		min-width: 12rem;
	}

	/* Skill-filter note — the row itself only. `.filter-note-label` and
	 * `.filter-note-value` are the shared idiom (ink-signal.css) and the clear
	 * is `.mono-action`; this page used to redeclare all three, which is how its
	 * way out ended up muted, 16px tall and a link rather than a control. */
	.filter-note {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-sm);
		margin: 0 0 var(--space-md);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
	}

	/* How much of the catalogue survived the narrowing — tabular so the figure
	 * holds its column as the reader switches methods. */
	.filter-note-count {
		font-variant-numeric: tabular-nums;
		color: var(--color-text-light);
	}

	.catalogue-empty {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lg);
		color: var(--color-text-light);
		margin: var(--space-lg) 0;
	}

	/* ===== LEDGER ENTRIES =====
	 * The row, its hairline, its padding, its key column and its narrow-measure
	 * collapse all come from the .ledger-row idiom; what is local is the plate
	 * sharing the content column with the record, which is the same shape the
	 * research index uses for the same kind of thing. */
	.dh-entry {
		--ledger-key-w: 8rem;
		/* The plate makes the row tall, so top-align the period key rather than
		 * baseline-aligning it against a replaced element. */
		align-items: start;
	}

	.dh-entry-body {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
		min-width: 0;
	}

	.dh-entry-plate {
		flex: none;
		width: 96px;
		/* Echo the dossier plate; sources are not all 16:9, so crop. */
		aspect-ratio: 16 / 9;
		height: auto;
		object-fit: cover;
	}

	/* .ledger-title carries the serif cast; the two declarations here replace
	 * what the global h1–h3 rule adds on top of it (a display tracking and a
	 * width axis that belong to Archivo, not to a serif record title) with the
	 * serif title tracking. */
	.dh-entry-title {
		letter-spacing: var(--tracking-title);
		font-variation-settings: normal;
	}

	/* The content column's flex gap already separates this from the description,
	 * and the run's links carry their own block padding, so the trim keeps it
	 * reading as the entry's closing line rather than a detached second group. */
	.dh-entry-methods {
		margin-block-start: calc(-1 * var(--space-1));
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

		.dh-entry-plate {
			width: 176px;
		}
	}
</style>
