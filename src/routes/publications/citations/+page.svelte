<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { pageTitle } from '$lib/utils/siteHelpers';
	import '$styles/components/entity-index.css';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import EntityFilterBar from '$lib/components/entity-index/EntityFilterBar.svelte';
	import EntityFacetGrid from '$lib/components/entity-index/EntityFacetGrid.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import {
		EntityFilterSystem,
		type EntityArrayDimension
	} from '$lib/utils/entityFilterSystem.svelte';
	import {
		matchesSearchTerms,
		summariseYears,
		truncateSearchTerm
	} from '$lib/utils/entityFilterCore';
	import { byFrequencyThenAlpha, countOccurrences } from '$lib/utils/facetOrdering';
	import { CITING_WORK_KIND_LABELS, type CitingWorkRow } from '$lib/utils/citationContexts';
	import { base, resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { usePagination } from '$lib/utils/pagination.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import { buildBreadcrumbJsonLd, createSubsectionBreadcrumbs } from '$lib/utils/breadcrumbJsonLd';
	import type { CitationPassage } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/**
	 * Citing works, browsed. Each row is one work that cites my publications,
	 * keyed by its year and language, holding the sentences in which it cites
	 * them, grouped by the publication cited. The quotation takes the document
	 * voice; where it sits (page, citation form, note) is apparatus and takes
	 * the data voice under it. The facets are the index pages' own: the kind of
	 * work in the type row, its language, the cited publication (filed under
	 * `projects`), the citing authors and the years. Works read without a
	 * quotable passage, and those not read yet, are counted in the coverage
	 * table, so the page never implies that every citation was quoted.
	 *
	 * The page is prerendered and its data never changes after load, so the
	 * filter system is built once from the first value.
	 */
	const works: CitingWorkRow[] = untrack(() => data.works);
	const coverage = untrack(() => data.coverage);
	const models = untrack(() => data.models).join(', ');

	const anyOf = (
		values: (work: CitingWorkRow) => string[]
	): EntityArrayDimension<CitingWorkRow> => ({
		match: (work, active) => values(work).some((value) => active.includes(value)),
		countExtractor: values
	});
	const unused: EntityArrayDimension<CitingWorkRow> = {
		match: () => true,
		countExtractor: () => []
	};
	const ranked = (lists: string[][]) => {
		const counts = countOccurrences(lists);
		return byFrequencyThenAlpha([...counts.keys()], counts);
	};

	const kindOf = (work: CitingWorkRow) => [work.kind];
	const languageOf = (work: CitingWorkRow) => [work.language];
	const citedOf = (work: CitingWorkRow) => work.groups.map((group) => group.publicationTitle);

	const filters = new EntityFilterSystem<CitingWorkRow>({
		items: works,
		dimensions: {
			types: anyOf(kindOf),
			languages: anyOf(languageOf),
			projects: anyOf(citedOf),
			authors: anyOf((work) => work.authors),
			tags: unused,
			countries: unused
		},
		matchesYearRange: (work, range) => work.year >= range.min && work.year <= range.max,
		filterOptions: {
			types: ranked(works.map(kindOf)),
			years: [...new Set(works.map((work) => work.year))].sort((a, b) => a - b),
			tags: [],
			languages: ranked(works.map(languageOf)),
			authors: ranked(works.map((work) => work.authors)),
			countries: [],
			// Coverage is ordered most quoted first; the facet keeps that order.
			projects: coverage.filter((pub) => pub.quoted > 0).map((pub) => pub.title)
		}
	});
	const af = filters.activeFilters;

	let searchTerm = $state('');
	const search = {
		get value() {
			return searchTerm;
		},
		set value(next: string) {
			searchTerm = next;
		}
	};
	let activeSort = $state<'date' | 'title'>('date');
	let facetsOpen = $state(false);

	function clearAllNarrowing() {
		filters.clearAllFilters();
		searchTerm = '';
	}

	function searchFields(work: CitingWorkRow): string[] {
		return [
			work.title,
			work.source ?? '',
			String(work.year),
			...work.authors,
			...work.groups.flatMap((group) => [
				group.publicationTitle,
				...group.passages.map((passage) => passage.text)
			])
		];
	}

	const searched = $derived(
		filters.filteredItems.filter((work) => matchesSearchTerms(searchFields(work), searchTerm))
	);
	const sorted = $derived(
		activeSort === 'title' ? [...searched].sort((a, b) => a.title.localeCompare(b.title)) : searched
	);
	/** A row shows the passages for the publications the facet selects, else all of them. */
	const visibleRows = $derived(
		sorted.map((work) => ({
			work,
			groups:
				af.projects.length > 0
					? work.groups.filter((group) => af.projects.includes(group.publicationTitle))
					: work.groups
		}))
	);

	const matchCount = $derived(sorted.length);

	/* A row can carry seven passages, so a page holds fewer rows than the
	 * publications index's twelve. */
	const PER_PAGE = 8;
	const pagination = usePagination(() => visibleRows, PER_PAGE);
	const anyNarrowing = $derived(filters.activeFilterCount > 0 || searchTerm.trim().length > 0);
	const searchOnlyNarrowing = $derived(
		searchTerm.trim().length > 0 && filters.activeFilterCount === 0
	);
	const activeFilterCount = $derived(filters.activeFilterCount + (searchTerm.trim() ? 1 : 0));

	const totalEntries = works.length;
	const totalPassages = works.reduce((sum, work) => sum + work.passageCount, 0);
	const { minYear, maxYear, bars: yearBars } = summariseYears(works.map((work) => work.year));
	const fromPrint = works.reduce(
		(sum, work) =>
			sum +
			work.groups.reduce(
				(n, group) => n + group.passages.filter((p) => p.checkedBy === 'reader').length,
				0
			),
		0
	);

	const typeLabels: Record<string, string> = CITING_WORK_KIND_LABELS;

	function apparatus(passage: CitationPassage): string[] {
		return [
			passage.page ? `p. ${passage.page}` : '',
			passage.citedAs ?? '',
			passage.inNote ? 'in a note' : '',
			passage.checkedBy === 'reader' ? 'read from print' : ''
		].filter(Boolean);
	}

	const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
	const names = (list: { authors: string[]; year: number }[]) =>
		list.map((w) => `${w.authors.join(', ')} (${w.year})`).join('; ');

	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Publications',
		'/publications',
		'Citations in Context',
		'/publications/citations'
	);
	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
</script>

<SEO
	title={pageTitle('Citations in context')}
	description="How other scholars use Frédérick Madore's publications: the sentences in which citing works cite them, quoted with their pages. Experimental: the passages were located by a language model and checked word for word."
	keywords="citations, citation context, cited by, Islam, West Africa, Côte d'Ivoire, Burkina Faso, Frédérick Madore"
/>

<JsonLd id="breadcrumb-json-ld-publications-citations" json={breadcrumbJsonLd} />

<div class="entity-index" use:urlFilterSync={{ filters: af, setters: filters.setters, search }}>
	<Breadcrumb items={breadcrumbItems} />

	<header class="index-hero index-masthead">
		<div class="index-hero-lede">
			<p class="eyebrow index-eyebrow">
				Experimental · {totalEntries} entries · {plural(totalPassages, 'passage', 'passages')}
			</p>
			<h1 class="index-title">Citations in context</h1>
			<p class="standfirst">
				How other scholars use my work, in their own words: the sentences in which citing works cite
				my publications, with the page they appear on.
			</p>
		</div>

		<div class="index-hero-bars" aria-hidden="true">
			<div class="year-bars" style="--year-bars-h: 88px;">
				{#each yearBars as bar (bar.year)}
					<span
						class="year-bar"
						class:year-bar--current={bar.year === maxYear}
						style="height: {bar.pct}%"
						title="{bar.year}: {bar.count} {bar.count === 1 ? 'entry' : 'entries'}"
					></span>
				{/each}
			</div>
			<div class="year-bars-legend">
				<span>Entries by year</span>
			</div>
		</div>
	</header>

	<aside class="citations-about" aria-labelledby="citations-about-title">
		<h2 id="citations-about-title" class="eyebrow eyebrow--ink">About this experiment</h2>
		<p>
			This page is an experiment, and a work in progress. It tests whether a language model can
			recover, from the full texts of the works that cite mine, the sentences in which they do so.
			The pilot read every work that cites one article, <cite
				>The New Vitality of Salafism in Côte d’Ivoire</cite
			> (2016), and recorded each of my publications those works cite. Works citing only my other publications
			are still to be read; the coverage table at the foot of the page says how far each publication has
			got.
		</p>
		<p>
			{models}, a language model made by Anthropic, located each passage in the full text of the
			citing work, and a script then checked it word for word against that text.
			{#if fromPrint > 0}
				{fromPrint === 1 ? 'One passage was' : `${fromPrint} passages were`} read from a printed copy
				instead, and {fromPrint === 1 ? 'is' : 'are'} marked as such.
			{/if}
			The check confirms that each quotation is exact, not that it is attached to the right publication,
			so errors remain possible. Note numbers are removed. The quotations remain the work of their authors,
			and each entry links to its source.
		</p>
	</aside>

	<EntityFilterBar
		{filters}
		{typeLabels}
		typeChipLabels={typeLabels}
		ariaLabel="Filter citations"
		searchPlaceholder="Word, author, title, year…"
		searchAriaLabel="Filter citations"
		sortAriaLabel="Sort citations"
		bind:searchTerm
		bind:facetsOpen
		bind:activeSort
	/>

	<EntityFacetGrid
		{filters}
		open={facetsOpen}
		{minYear}
		{maxYear}
		{totalEntries}
		{matchCount}
		{activeFilterCount}
		{anyNarrowing}
		{typeLabels}
		labels={{ projects: 'Cited publication', authors: 'Citing authors' }}
		onclearall={clearAllNarrowing}
	/>

	<section class="rule-section citations-list" id="citations" aria-labelledby="citations-head">
		<h2 class="sr-only" id="citations-head">Citations</h2>

		{#if visibleRows.length > 0}
			<div class="ledger ledger--ruled citations-ledger">
				{#each pagination.items as { work, groups } (work.key)}
					<article class="ledger-row ledger-row--meta citation-entry">
						<span class="ledger-key">
							<span>{work.year}</span>
							<span class="ledger-status">
								<span aria-hidden="true">{work.lang}</span>
								<span class="sr-only">{work.language}</span>
							</span>
						</span>

						<div class="ledger-content">
							<h3 class="citation-work">
								<span class="citation-authors">{work.authors.join(', ')}</span>
								<cite class="citation-title">{work.title}</cite>
							</h3>
							{#if work.source}
								<p class="citation-source">{work.source}</p>
							{/if}

							{#each groups as group (group.publicationId)}
								<p class="citation-cites">
									Cites <a
										href={resolve('/publications/[id]', { id: group.publicationId })}
										data-sveltekit-preload-code="tap"><cite>{group.publicationTitle}</cite></a
									>
								</p>
								{#each group.passages as passage, i (i)}
									<figure class="citation-passage">
										<blockquote class="citation-quote" lang={work.lang}>
											<p>{passage.text}</p>
										</blockquote>
										{#if apparatus(passage).length > 0}
											<figcaption class="apparatus-line">
												{apparatus(passage).join(' · ')}
											</figcaption>
										{/if}
									</figure>
								{/each}
							{/each}
						</div>

						<span class="ledger-meta citation-meta">
							<span class="citation-kind">{typeLabels[work.kind]}</span>
							{#if work.url}
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external citing work -->
								<a
									class="ledger-action"
									href={work.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Open work: {work.title} (opens in new tab)"
								>
									Open work<span class="sr-only"> (opens in new tab)</span><span aria-hidden="true"
										>&nbsp;↗</span
									>
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							{/if}
						</span>
					</article>
				{/each}
			</div>

			<Pagination
				page={pagination.page}
				perPage={PER_PAGE}
				total={matchCount}
				onchange={(p) => (pagination.page = p)}
				scrollTargetId="citations"
			/>
		{:else}
			<div class="bib-empty">
				<p class="bib-empty-line">
					{#if searchTerm.trim()}
						No entries match &ldquo;{truncateSearchTerm(searchTerm)}&rdquo;.
					{:else}
						No entries match.
					{/if}
				</p>
				<p class="dateline bib-empty-note">
					The index holds {totalEntries} entries, {minYear}–{maxYear}.
				</p>
				{#if anyNarrowing}
					<button type="button" class="mono-action" onclick={clearAllNarrowing}>
						{searchOnlyNarrowing ? 'Clear search' : 'Clear all'}
						<span aria-hidden="true">✕</span>
					</button>
				{/if}
			</div>
		{/if}
	</section>

	<section class="section citations-coverage" aria-labelledby="coverage-title">
		<div class="section-head">
			<h2 class="section-title" id="coverage-title">Coverage</h2>
		</div>
		<p class="section-note">
			How far the works citing each publication have been read. A work is quoted when it cites the
			publication in its text; some list it in their bibliography only, and some could not be read
			because no full text was available.
		</p>
		<div class="ledger ledger--ruled ledger--tight coverage-ledger">
			{#each coverage as pub (pub.id)}
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">{pub.year}</span>
					<div class="ledger-content">
						<p class="coverage-title">
							<a
								class="link-animated"
								href={resolve('/publications/[id]', { id: pub.id })}
								data-sveltekit-preload-code="tap"><cite>{pub.title}</cite></a
							>
						</p>
						{#if pub.bibliographyOnly.length > 0}
							<p class="coverage-note">Bibliography only: {names(pub.bibliographyOnly)}</p>
						{/if}
						{#if pub.unread.length > 0}
							<p class="coverage-note">No full text: {names(pub.unread)}</p>
						{/if}
					</div>
					<span class="ledger-meta coverage-figures">
						<span>{pub.quoted} quoted</span>
						{#if pub.bibliographyOnly.length > 0}
							<span>{pub.bibliographyOnly.length} bibliography only</span>
						{/if}
						{#if pub.unread.length > 0}<span>{pub.unread.length} no full text</span>{/if}
						{#if pub.pending > 0}<span>{pub.pending} to read</span>{/if}
					</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	/* The method note: prose, at reading measure, between the masthead and the
	 * filter bar. */
	.citations-about {
		max-width: var(--measure-prose);
		margin: var(--space-lg) 0 var(--space-xl);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
	}

	.citations-about p {
		margin: 0 0 var(--space-sm);
	}

	.citations-ledger {
		--ledger-key-w: 5rem;
		--ledger-meta-w: 9rem;
	}

	.citation-entry {
		align-items: start;
	}

	/* The citing work: byline then title, in the document voice, one size under
	 * the quotations it introduces. */
	.citation-work {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-snug);
		letter-spacing: normal;
		font-variation-settings: normal;
		color: var(--color-text-emphasis);
	}

	.citation-authors::after {
		content: ', ';
	}

	.citation-title {
		font-style: italic;
	}

	.citation-source {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		font-style: italic;
		color: var(--color-text-light);
	}

	/* Which of my publications the passages below cite: a serif line, the
	 * title a link to its record. */
	.citation-cites {
		margin: var(--space-md) 0 0;
		max-width: var(--measure-prose);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.citation-cites a {
		color: var(--color-text-emphasis);
		text-decoration: underline;
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 0.2em;
	}

	.citation-cites a:hover {
		color: var(--color-accent);
	}

	.citation-passage {
		margin: var(--space-xs) 0 0;
		max-width: var(--measure-prose);
	}

	/* The quotation keeps the base blockquote's serif italic, without its
	 * indent (the ledger column already sets it apart) and at body size, since
	 * a row can carry several. */
	.citation-quote {
		margin: 0 0 var(--space-1);
		font-size: var(--font-size-base);
		color: var(--color-text);
	}

	.citation-quote p {
		margin: 0;
	}

	.citation-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.citation-kind {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
	}

	.citations-coverage {
		margin-top: var(--space-3xl);
	}

	.coverage-ledger {
		--ledger-key-w: 5rem;
		--ledger-meta-w: 11rem;
	}

	.coverage-title {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
	}

	.coverage-title cite {
		font-style: italic;
	}

	.coverage-note {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.coverage-figures {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	@media (--sm) {
		.citation-meta,
		.coverage-figures {
			align-items: flex-end;
			text-align: right;
		}
	}
</style>
