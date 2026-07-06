<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import FeaturedDHProjects from '$lib/components/digital-humanities/FeaturedDHProjects.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import { allDhProjects } from '$lib/data/digital-humanities';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Digital Humanities', '/digital-humanities');

	const PER_PAGE = 8;

	// The active skill filter is carried in the URL (?skill=…) so any filtered
	// view is bookmarkable/shareable. Only read searchParams in the browser.
	let selectedSkill = $derived(browser ? page.url.searchParams.get('skill') : null);

	// Hero apparatus — total project count and the earliest year on record.
	const projectCount = allDhProjects.length;
	const earliestYear = (() => {
		const years = allDhProjects
			.map((p) => parseInt(p.years.slice(0, 4), 10))
			.filter((y) => !Number.isNaN(y));
		return years.length > 0 ? Math.min(...years) : new Date().getFullYear();
	})();

	// Skill facet — frequency of every skill across all projects, most used
	// first. Drives the catalogue filter chips (label + count).
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

	// The primary chips shown by default; the rest hide behind "All skills ↓".
	const PRIMARY_SKILLS = 7;
	const primarySkills = skillCounts.slice(0, PRIMARY_SKILLS);
	const overflowSkills = skillCounts.slice(PRIMARY_SKILLS);

	let showAllSkills = $state(false);
	const visibleSkills = $derived(showAllSkills ? skillCounts : primarySkills);

	// Featured projects (flagged in the data). Hidden while a skill filter is
	// active so a filtered catalogue is exhaustive.
	const featuredProjects = $derived(
		allDhProjects.filter((project) => project.featured).slice(0, 2)
	);
	const shouldShowFeatured = $derived(!selectedSkill && featuredProjects.length > 0);

	// Catalogue list: when filtering by skill, every matching project (featured
	// included) so the filter is complete; otherwise the non-featured records.
	function isOngoing(years: string): boolean {
		return /[-–—]\s*$/.test(years.trim());
	}

	const catalogueProjects = $derived(
		(selectedSkill
			? allDhProjects.filter((project) => project.skills?.includes(selectedSkill))
			: allDhProjects.filter((project) => !project.featured)
		).map((project) => {
			const isExternal =
				project.linkUrl &&
				(project.linkUrl.startsWith('http://') || project.linkUrl.startsWith('https://'));
			const internalPath = `/digital-humanities/${project.id}`;
			const finalLinkUrl = isExternal
				? project.linkUrl!
				: resolve(internalPath as `/digital-humanities/${string}`);
			const linkTarget = isExternal ? '_blank' : '_self';
			const actionText = isExternal ? 'Visit site ↗' : 'Explore project →';

			return {
				...project,
				finalLinkUrl,
				linkTarget,
				actionText,
				ongoing: isOngoing(project.years)
			};
		})
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
</script>

<SEO
	title="Digital Humanities | Frédérick Madore"
	description="Digital humanities projects by Frédérick Madore including the Islam West Africa Collection (IWAC), AI-assisted workflows, and data visualization."
	keywords="digital humanities, IWAC, Islam West Africa Collection, AI, machine learning, data visualization, Frédérick Madore"
	canonical="https://www.frederickmadore.com/digital-humanities"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8 page-enter">
	<div class="max-w-6xl mx-auto dh-page">
		<!-- HERO — mono infrastructure eyebrow, Archivo masthead, serif standfirst. -->
		<header class="dh-hero scroll-reveal">
			<p class="eyebrow dh-hero-eyebrow">
				Infrastructure · {projectCount} projects · {earliestYear} —
			</p>
			<h1 class="dh-hero-title">Digital Humanities</h1>
			<p class="standfirst dh-hero-standfirst">
				Not an end in itself, but a response to a concrete problem. After years of fieldwork across
				West Africa, I had accumulated thousands of documents that exceeded what traditional methods
				could process. These projects turn that accumulation into open research infrastructure —
				digital archives, AI-assisted pipelines, interactive visualisations, and conversational
				interfaces — so that African historical sources are not only preserved but made usable.
			</p>
		</header>

		<!-- FEATURED — two per row (hidden while a skill filter is active). -->
		{#if shouldShowFeatured}
			<FeaturedDHProjects projects={featuredProjects} />
		{/if}

		<!-- CATALOGUE — 3px rule, label + skills filter, then ledger rows. -->
		<section class="catalogue" aria-labelledby="dh-catalogue-heading">
			<div class="catalogue-head">
				<span class="catalogue-label" id="dh-catalogue-heading">Catalogue</span>

				<!-- eslint-disable svelte/no-navigation-without-resolve -- skill filter URLs (base-prefixed query strings) -->
				<div class="chip-row catalogue-filter">
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
							aria-current={selectedSkill === skill ? 'true' : undefined}
						>
							{skill} <span class="chip-count">{count}</span>
						</a>
					{/each}

					{#if overflowSkills.length > 0}
						<button
							type="button"
							class="chip-more"
							aria-expanded={showAllSkills}
							onclick={() => (showAllSkills = !showAllSkills)}
						>
							{showAllSkills ? 'Fewer skills ↑' : 'All skills ↓'}
						</button>
					{/if}
				</div>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>

			{#if selectedSkill}
				<p class="filter-note">
					<span class="filter-note-label">Filtered by skill</span>
					<span class="filter-note-value">{selectedSkill}</span>
					<a href={resolve('/digital-humanities')} class="filter-note-clear">Clear ✕</a>
				</p>
			{/if}

			{#if catalogueProjects.length === 0}
				<p class="catalogue-empty">No projects match this skill.</p>
			{:else}
				<div class="catalogue-ledger grid-stagger" id="dh-catalogue">
					{#each pagedProjects as project (project.id)}
						<article class="dh-row">
							<span class="dh-row-year" class:dh-row-year--current={project.ongoing}>
								{project.years}
							</span>

							<div class="dh-row-body">
								{#if project.imageUrl}
									<img
										class="plate dh-row-thumb"
										src={project.imageUrl}
										alt=""
										loading="lazy"
										decoding="async"
										width="96"
										height="72"
									/>
								{/if}
								<div class="dh-row-text">
									<h3 class="dh-row-title">
										<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved URL -->
										<a
											href={project.finalLinkUrl}
											target={project.linkTarget}
											rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}
										>
											{project.title}
										</a>
										<!-- eslint-enable svelte/no-navigation-without-resolve -->
									</h3>
									<p class="dh-row-desc">{project.shortDescription}</p>
								</div>
							</div>

							{#if project.skills && project.skills.length > 0}
								<div class="chip-row dh-row-tech">
									{#each project.skills.slice(0, 4) as skill (skill)}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- skill filter URL -->
										<a class="chip chip--tech" href={skillHref(skill)}>{skill}</a>
									{/each}
								</div>
							{/if}
						</article>
					{/each}
				</div>

				<Pagination
					page={currentPage}
					perPage={PER_PAGE}
					total={catalogueProjects.length}
					label="projects"
					scrollTargetId="dh-catalogue"
					onchange={(p) => (currentPage = p)}
				/>
			{/if}
		</section>
	</div>
</div>

<style>
	/* ===== HERO ===== */
	.dh-hero {
		margin-bottom: var(--space-2xl);
	}

	.dh-hero-eyebrow {
		margin-bottom: var(--space-sm);
	}

	.dh-hero-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-size: var(--font-size-display);
		font-weight: 830;
		letter-spacing: -0.02em;
		line-height: 0.98;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-md);
	}

	.dh-hero-standfirst {
		max-width: 74ch;
	}

	/* ===== CATALOGUE ===== */
	.catalogue {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-sm);
	}

	/* Header row: mono label on the left, skill-filter chips filling the rest. */
	.catalogue-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-sm) var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.catalogue-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-text-emphasis);
		flex: none;
	}

	.catalogue-filter {
		flex: 1 1 auto;
	}

	/* Skill-filter note — mono label + accent value + clear affordance. */
	.filter-note {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-sm);
		margin: 0 0 var(--space-md);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.filter-note-label {
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	.filter-note-value {
		color: var(--color-accent);
		font-weight: var(--font-weight-bold);
	}

	.filter-note-clear {
		color: var(--color-text-muted);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
	}

	.filter-note-clear:hover {
		color: var(--color-accent);
	}

	.catalogue-empty {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lg);
		color: var(--color-text-light);
		margin: var(--space-lg) 0;
	}

	/* ===== LEDGER ROWS — year | title + desc | tech chips (right) ===== */
	.catalogue-ledger {
		display: block;
	}

	.dh-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2) var(--space-lg);
		padding: var(--space-md) 0;
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	.dh-row:last-child {
		border-bottom: var(--rule-hairline) solid var(--color-border);
	}

	/* Year key — accent mono for ongoing work, quiet ink for closed spans. */
	.dh-row-year {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.04em;
		color: var(--color-text-light);
		white-space: nowrap;
	}

	.dh-row-year--current {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	.dh-row-body {
		min-width: 0;
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	/* Small catalogue plate — square, hairline-framed via the .plate idiom. Gives
	 * the non-featured rows the same visual footing as the featured cards. */
	.dh-row-thumb {
		flex: none;
		width: 96px;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.dh-row-text {
		min-width: 0;
	}

	.dh-row-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-snug);
		margin: 0 0 var(--space-1);
	}

	.dh-row-title a {
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.dh-row-title a:hover {
		color: var(--color-accent);
	}

	.dh-row-title a:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.dh-row-desc {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0;
		max-width: 68ch;
	}

	.dh-row-tech {
		gap: var(--space-1-5);
		align-items: flex-start;
	}

	/* Tech chip — smaller, quieter than a filter chip. */
	.chip--tech {
		font-size: var(--font-size-2xs);
		letter-spacing: 0.08em;
		padding: var(--space-0-5) var(--space-1-5);
		color: var(--color-text-light);
	}

	/* On desktop the row becomes three columns: year | body | right-aligned tech. */
	@media (--md) {
		.dh-row {
			grid-template-columns: 96px 1fr 320px;
			gap: var(--space-lg);
			align-items: start;
		}

		.dh-row-tech {
			justify-content: flex-end;
		}
	}
</style>
