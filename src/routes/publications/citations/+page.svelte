<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { pageTitle } from '$lib/utils/siteHelpers';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import { base, resolve } from '$app/paths';
	import { buildBreadcrumbJsonLd, createSubsectionBreadcrumbs } from '$lib/utils/breadcrumbJsonLd';
	import type { CitationPassage } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/**
	 * Quotations, not records: each row is a citing work, keyed by its year and
	 * language, holding the sentences in which it cites the publication. The
	 * quotation takes the document voice; where it sits (page, citation form,
	 * note) is apparatus and takes the data voice under it. Works read without a
	 * quotable passage stay listed below, so the page never implies that every
	 * citation was quoted.
	 */
	const sections = $derived(data.sections);

	const totals = $derived({
		entries: sections.reduce((sum, s) => sum + s.entryCount, 0),
		passages: sections.reduce((sum, s) => sum + s.passageCount, 0),
		fromPrint: sections.reduce(
			(sum, s) =>
				sum +
				s.quoted.reduce(
					(n, entry) => n + entry.passages.filter((p) => p.checkedBy === 'reader').length,
					0
				),
			0
		)
	});

	const models = $derived([...new Set(sections.map((s) => s.model))].join(', '));

	const LANGUAGE_NAMES: Record<string, string> = {
		de: 'German',
		en: 'English',
		fr: 'French',
		id: 'Indonesian'
	};

	function apparatus(passage: CitationPassage): string[] {
		return [
			passage.page ? `p. ${passage.page}` : '',
			passage.citedAs ?? '',
			passage.inNote ? 'in a note' : '',
			passage.checkedBy === 'reader' ? 'read from print' : ''
		].filter(Boolean);
	}

	const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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
	description="How other scholars use Frédérick Madore's publications: the sentences in which citing works cite them, quoted with their pages. A work in progress."
	keywords="citations, citation context, cited by, Salafism, Côte d'Ivoire, Frédérick Madore"
/>

<JsonLd id="breadcrumb-json-ld-publications-citations" json={breadcrumbJsonLd} />

<div class="page-container">
	<Breadcrumb items={breadcrumbItems} />

	<PageHeader
		tier="index"
		title="Citations in context"
		typeBadgeText="Work in progress"
		date="{plural(totals.entries, 'entry', 'entries')} · {plural(
			totals.passages,
			'passage',
			'passages'
		)}"
	/>

	<PageIntro>
		How other scholars use my work, in their own words. Each entry quotes the sentences in which a
		citing work cites one of my publications, with the page they appear on.
	</PageIntro>

	<aside class="citations-about" aria-labelledby="citations-about-title">
		<h2 id="citations-about-title" class="eyebrow eyebrow--ink">About this page</h2>
		<p>
			A work in progress. This pilot covers one article; the citations of my other publications will
			be added as their citing works are read.
		</p>
		<p>
			{models}, a language model made by Anthropic, located each passage in the full text of the
			citing work, and a script then checked it word for word against that text.
			{#if totals.fromPrint > 0}
				{totals.fromPrint === 1 ? 'One passage was' : `${totals.fromPrint} passages were`} read from a
				printed copy instead, and {totals.fromPrint === 1 ? 'is' : 'are'} marked as such.
			{/if}
			Note numbers are removed. The quotations remain the work of their authors, and each entry links
			to its source.
		</p>
	</aside>

	{#each sections as section (section.id)}
		<section class="section citations-section" id={section.id} aria-labelledby="{section.id}-title">
			<div class="section-head">
				<h2 class="section-title citations-section-title" id="{section.id}-title">
					{section.title}
				</h2>
			</div>
			<p class="section-note citations-section-note">
				Quoted from {section.quoted.length} of the {plural(
					section.entryCount,
					'work that cites',
					'works that cite'
				)} this {section.year} publication.
			</p>
			<a
				class="ledger-action citations-record-link"
				href={resolve('/publications/[id]', { id: section.id })}
				>View publication<span aria-hidden="true">&nbsp;→</span></a
			>

			<div class="ledger ledger--ruled citations-ledger">
				{#each section.quoted as entry (entry.key)}
					<article class="ledger-row ledger-row--meta citation-entry">
						<span class="ledger-key">
							<span>{entry.year}</span>
							{#if entry.language}
								<span class="ledger-status">
									<span aria-hidden="true">{entry.language}</span>
									<span class="sr-only">{LANGUAGE_NAMES[entry.language] ?? entry.language}</span>
								</span>
							{/if}
						</span>

						<div class="ledger-content">
							<h3 class="citation-work">
								<span class="citation-authors">{entry.authors.join(', ')}</span>
								<cite class="citation-title">{entry.title}</cite>
							</h3>
							{#if entry.source}
								<p class="citation-source">{entry.source}</p>
							{/if}

							{#each entry.passages as passage, i (i)}
								<figure class="citation-passage">
									<blockquote class="citation-quote" lang={entry.language}>
										<p>{passage.text}</p>
									</blockquote>
									{#if apparatus(passage).length > 0}
										<figcaption class="apparatus-line">
											{apparatus(passage).join(' · ')}
										</figcaption>
									{/if}
								</figure>
							{/each}
						</div>

						<span class="ledger-meta">
							{#if entry.url}
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external citing work -->
								<a
									class="ledger-action"
									href={entry.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Open work: {entry.title} (opens in new tab)"
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

			{#if section.bibliographyOnly.length > 0}
				<h3 class="eyebrow eyebrow--ink citations-subhead">In the bibliography only</h3>
				<p class="section-note">
					Read, and listed in the references without a citation in the text.
				</p>
				<div class="ledger ledger--tight ledger--ruled">
					{#each section.bibliographyOnly as entry (entry.key)}
						<div class="ledger-row">
							<span class="ledger-key">{entry.year}</span>
							<p class="ledger-desc">
								{entry.authors.join(', ')}, <cite>{entry.title}</cite>
							</p>
						</div>
					{/each}
				</div>
			{/if}

			{#if section.unread.length > 0}
				<h3 class="eyebrow eyebrow--ink citations-subhead">Not yet read</h3>
				<p class="section-note">No full text was available to read.</p>
				<div class="ledger ledger--tight ledger--ruled">
					{#each section.unread as entry (entry.key)}
						<div class="ledger-row">
							<span class="ledger-key">{entry.year}</span>
							<p class="ledger-desc">
								{entry.authors.join(', ')}, <cite>{entry.title}</cite>
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/each}
</div>

<style>
	.page-container {
		max-width: var(--content-width-6xl);
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md);
	}

	/* The method note: prose, at reading measure, under the intro. */
	.citations-about {
		max-width: var(--measure-prose);
		margin-top: var(--space-lg);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
	}

	.citations-about p {
		margin: 0 0 var(--space-sm);
	}

	/* A publication's full title is long for the display head: one step down. */
	.citations-section-title {
		font-size: var(--font-size-xl);
		max-width: var(--measure-prose);
	}

	.citations-ledger {
		--ledger-key-w: 5rem;
		--ledger-meta-w: 9rem;
	}

	.citation-entry {
		align-items: start;
	}

	/* The citing work: byline then title, in the document voice, one size under
	 * the quotation it introduces. */
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

	.citation-passage {
		margin: var(--space-sm) 0 0;
		max-width: var(--measure-prose);
	}

	/* The quotation keeps the base blockquote's serif italic, without its
	 * indent (the ledger column already sets it apart) and at body size, since
	 * a row can carry four of them. */
	.citation-quote {
		margin: 0 0 var(--space-1);
		font-size: var(--font-size-base);
		color: var(--color-text);
	}

	.citations-section-note {
		margin-bottom: 0;
	}

	.citations-record-link {
		margin-bottom: var(--space-md);
	}

	.citation-quote p {
		margin: 0;
	}

	.citations-subhead {
		margin-top: var(--space-xl);
	}

	@media (--sm) {
		.citation-entry .ledger-meta {
			text-align: right;
		}
	}

	@media (--md-down) {
		.page-container {
			padding: var(--space-md) var(--space-sm);
		}
	}
</style>
