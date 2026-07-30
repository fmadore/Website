<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import type { ComponentType } from 'svelte';
	import type { PageData } from './$types';
	import MetaTags from '$lib/components/publications/MetaTags.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	import CitedBy from '$lib/components/publications/CitedBy.svelte';
	import Reviews from '$lib/components/publications/Reviews.svelte';
	import PublicationAside from '$lib/components/publications/PublicationAside.svelte';
	import PublicationToc from '$lib/components/publications/PublicationToc.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import { allPublications } from '$lib/data/publications/index';
	import {
		createPublicationSEODescription,
		createPublicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { getPublicationTypeBadge } from '$lib/utils/publicationTypeLabels';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let publication = $derived(data.publication as Publication);
	let jsonLdString = $derived(data.jsonLdString);

	// Generate optimized SEO content
	const seoDescription = $derived(createPublicationSEODescription(publication));
	const seoKeywords = $derived(createPublicationSEOKeywords(publication));

	// Define breadcrumb items (used for JSON-LD structured data)
	let breadcrumbItems = $derived([
		{ label: 'Publications', href: `${base}/publications` },
		{ label: truncateTitle(publication.title), href: `${base}/publications/${publication.id}` }
	]);

	// JSON-LD injection using reusable utilities
	useBreadcrumbJsonLd(() => breadcrumbItems);
	useJsonLdScript('publication-json-ld', () => jsonLdString);

	const typeLabel = $derived(getPublicationTypeBadge(publication.type));

	// Open-access marker: any publication that exposes a DOI/URL we can send the
	// reader to is treated as freely accessible here (the site only lists the
	// author's own open work). Shown as the third eyebrow token when present.
	const isOpenAccess = $derived(Boolean(publication.doi || publication.url));

	// Project URL mappings — internal research pages.
	let projectMappings = $derived<Record<string, string>>({
		'Religious Activism on Campuses in Togo and Benin': `${base}/research/religious-activism-campuses-togo-benin`,
		"Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso": `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`,
		'Muslim Minorities in Southern Cities of Benin and Togo': `${base}/research/muslim-minorities-southern-cities-benin-togo`,
		'Digital Humanities and AI in African Studies': `${base}/research/dh-ai-african-studies`
	});
	const projectUrl = $derived(
		publication.project ? projectMappings[publication.project] : undefined
	);

	// Byline — "by A, B and C".
	function formatNameList(names: string[] | undefined): string {
		if (!names || names.length === 0) return '';
		if (names.length === 1) return names[0] ?? '';
		if (names.length === 2) return `${names[0]} and ${names[1]}`;
		return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
	}
	const byline = $derived(formatNameList(publication.authors));

	// Abstract → paragraphs (mirrors AbstractSection's splitter).
	const abstractParagraphs = $derived(
		(publication.abstract ?? '')
			.split(/\n\s*\n|\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
	);

	const reviews = $derived(publication.reviewedBy ?? []);
	const citedBy = $derived(publication.citedBy ?? []);

	// Related publications in the same project (excluding the current one).
	const relatedInProject = $derived(
		publication.project
			? allPublications.filter((p) => p.id !== publication.id && p.project === publication.project)
			: []
	);
</script>

<SEO
	title={truncateTitle(publication.title) + ' | Frédérick Madore'}
	description={seoDescription}
	keywords={seoKeywords}
	ogImage={publication.image ? `${base}/${publication.image}` : undefined}
	includeCitationAuthor={false}
/>

<MetaTags {publication} />

<div class="container py-8 page-enter">
	<div class="pub-shell">
		<!-- Breadcrumb — mono, muted. Deliberate editorial variant of the shared
		     <Breadcrumb> molecule: a back-link ("← Publications / Type") instead
		     of the Home/Section/Title trail, so it reads as document chrome on
		     the bibliographic record. Breadcrumb JSON-LD still ships via
		     useBreadcrumbJsonLd like every other detail page. -->
		<nav class="pub-breadcrumb" aria-label="Breadcrumb">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed path -->
			<a href="{base}/publications" class="pub-breadcrumb-link">← Publications</a>
			<span class="pub-breadcrumb-sep" aria-hidden="true">/</span>
			<span class="pub-breadcrumb-current">{typeLabel}</span>
		</nav>

		<!-- The whole record is one article: masthead, body column and metadata
		     rail. The masthead is a grid child of its own (rather than the first
		     block of the body column) so that below the two-column breakpoint the
		     rail's blocks can order themselves against it — cover and Record next
		     to the title, ahead of the document. -->
		<article class="pub-grid">
			<!-- ═══ MASTHEAD ═══ -->
			<header class="pub-header">
				<p class="eyebrow pub-eyebrow">
					<span>{typeLabel}</span>
					<span class="pub-eyebrow-sep" aria-hidden="true">·</span>
					<span>{publication.date}</span>
					{#if isOpenAccess}
						<span class="pub-eyebrow-sep" aria-hidden="true">·</span>
						<span>Open Access</span>
					{/if}
				</p>

				<h1 class="pub-title">{publication.title}</h1>

				{#if byline}
					<p class="pub-byline">
						{#if publication.prefacedBy}by {byline}. Preface by {publication.prefacedBy}{:else}by
							{byline}{/if}
					</p>
				{/if}
			</header>

			<!-- ═══ MAIN COLUMN ═══ -->
			<div class="pub-main">
				<!-- Abstract -->
				{#if abstractParagraphs.length > 0}
					<section class="section pub-section scroll-reveal" aria-labelledby="pub-abstract-head">
						<div class="section-head">
							<h2 id="pub-abstract-head" class="section-title">Abstract</h2>
						</div>
						<div class="pub-abstract">
							{#each abstractParagraphs as paragraph, index (index)}
								<p class="pub-abstract-p" class:drop-cap={index === 0}>{paragraph}</p>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Table of contents -->
				<PublicationToc {publication} />

				<!-- Reviews -->
				<Reviews reviewedBy={reviews} />

				<!-- Cited by -->
				<CitedBy {citedBy} />

				<!-- More in this project -->
				{#if relatedInProject.length > 0}
					<div class="pub-section">
						<RelatedItemsList
							allItems={allPublications}
							currentItemId={publication.id}
							filterKey="project"
							filterValue={publication.project}
							title="More in this Project"
							itemComponent={RelatedItemCard as unknown as ComponentType}
							baseItemUrl="/publications/"
							viewAllUrl="{base}/publications"
							maxItems={3}
							sectionClass="pub-related section"
							titleClass="pub-related-title section-title"
						/>
					</div>
				{/if}
			</div>

			<!-- ═══ ASIDE — THE METADATA ═══ -->
			<PublicationAside {publication} {typeLabel} {projectUrl} />
		</article>
	</div>
</div>

<style>
	/* Shell caps the whole record at a comfortable reading width. */
	.pub-shell {
		max-width: var(--container-lg);
		margin: 0 auto;
	}

	/* ── Breadcrumb ────────────────────────────────────────────────────────── */
	.pub-breadcrumb {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-xl);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.pub-breadcrumb-link {
		color: var(--color-text-light);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.pub-breadcrumb-link:hover {
		color: var(--color-accent);
	}

	.pub-breadcrumb-sep {
		color: var(--color-text-muted);
	}

	.pub-breadcrumb-current {
		color: var(--color-text-muted);
	}

	/* ── Two-column grid: masthead + main + 380px metadata rail ───────────── */
	.pub-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
	}

	/* Both column-one blocks opt out of the automatic min-content floor, so a
	   long title or a long metadata value can never widen the grid track. */
	.pub-header,
	.pub-main {
		min-width: 0;
	}

	/* The grid row gap sets the rhythm below the masthead, so the body's first
	   section must not stack its own top margin on top of it. */
	.pub-main > :global(:first-child) {
		margin-top: 0;
	}

	/* Consistent rhythm between the numbered sections. */
	.pub-section {
		margin-top: var(--space-2xl);
	}

	/* Single column: the rail dissolves (see PublicationAside) and its blocks
	   place themselves around the body — cover + Record + access at order 1,
	   the document at order 2, tags + key terms at order 3. */
	@media (--lg-down) {
		.pub-main {
			order: 2;
		}
	}

	@media (--lg) {
		.pub-grid {
			grid-template-columns: minmax(0, 1fr) 380px;
			column-gap: var(--space-3xl);
			align-items: start;
		}

		/* Masthead over the body in column one; the rail spans both rows so it
		   still starts level with the eyebrow. */
		.pub-header {
			grid-column: 1;
			grid-row: 1;
		}

		.pub-main {
			grid-column: 1;
			grid-row: 2;
		}
	}

	/* ── Masthead ──────────────────────────────────────────────────────────── */
	.pub-eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2);
		margin-bottom: var(--space-sm);
	}

	.pub-eyebrow-sep {
		color: var(--color-text-muted);
	}

	.pub-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-size: var(--font-size-4xl);
		font-weight: 820;
		letter-spacing: -0.015em;
		line-height: 1.02;
		color: var(--color-text-emphasis);
		margin: 0;
		text-wrap: balance;
	}

	/* --font-size-4xl barely scales down (clamp floor ~47px), which a long
	   bibliographic title turns into a screen and a half of headline before the
	   cover. One step down in the narrow column; no further, since the section
	   heads sit at --font-size-2xl and the masthead must stay above them. */
	@media (--md-down) {
		.pub-title {
			font-size: var(--font-size-3xl);
		}
	}

	/* Byline — the document voice, serif italic. */
	.pub-byline {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-xl);
		line-height: var(--line-height-normal);
		color: var(--color-text-soft);
		margin: var(--space-md) 0 0;
		max-width: 52ch;
	}

	/* ── Abstract ──────────────────────────────────────────────────────────── */
	.pub-abstract {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: 68ch;
	}

	.pub-abstract-p {
		margin: 0;
	}

	.pub-abstract-p + .pub-abstract-p {
		margin-top: var(--space-md);
	}

	@media (prefers-reduced-motion: reduce) {
		.pub-breadcrumb-link {
			transition: none;
		}
	}
</style>
