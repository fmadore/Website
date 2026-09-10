<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import type { ComponentType } from 'svelte';
	import type { PageData } from './$types';
	import MetaTags from '$lib/components/publications/MetaTags.svelte';
	import RecordLayout, { type EyebrowToken } from '$lib/components/common/RecordLayout.svelte';

	import CitedBy from '$lib/components/publications/CitedBy.svelte';
	import Reviews from '$lib/components/publications/Reviews.svelte';
	import PublicationRecordRail from '$lib/components/publications/PublicationRecordRail.svelte';
	import PublicationIndexRail, {
		hasIndexApparatus
	} from '$lib/components/publications/PublicationIndexRail.svelte';
	import PublicationToc from '$lib/components/publications/PublicationToc.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import { allPublications } from '$lib/data/publications/index';
	import { researchProjectPath } from '$lib/data/research';
	import {
		createPublicationSEODescription,
		createPublicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { getPublicationTypeBadge } from '$lib/utils/publicationTypeLabels';
	import { formatByline } from '$lib/utils/byline';
	import { typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';

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

	// "Master's Thesis" carries an apostrophe, and this label prints in the
	// breadcrumb and the masthead eyebrow as well as in the rail ledger.
	const typeLabel = $derived(typesetQuotes(getPublicationTypeBadge(publication.type)));

	// Open-access marker, shown as the third eyebrow token. An authored fact on
	// the record (`openAccess`), never inferred from having a DOI or a URL —
	// most bare URLs point at a publisher's catalogue page, which is a paywall.
	const isOpenAccess = $derived(publication.openAccess === true);

	const eyebrow = $derived.by((): EyebrowToken[] => {
		const tokens: EyebrowToken[] = [{ label: typeLabel }, { label: publication.date }];
		if (isOpenAccess) {
			tokens.push({ label: 'Open Access', icon: 'academicons:open-access' });
		}
		return tokens;
	});

	// Internal research page for this publication's project, resolved from the
	// research dataset so a new project links itself.
	const projectPath = $derived(researchProjectPath(publication.project));
	const projectUrl = $derived(projectPath ? `${base}${projectPath}` : undefined);

	// Byline — "by A, B and C", with the preface credit as its trailing clause.
	const byline = $derived(formatByline(publication.authors));
	const displayPrefacedBy = $derived(typesetQuotes(publication.prefacedBy));
	const bylineSuffix = $derived(displayPrefacedBy ? `Preface by ${displayPrefacedBy}` : undefined);

	const displayTitle = $derived(typesetQuotes(publication.title));

	// Abstract → paragraphs. Rendered via {@html} because abstracts carry inline
	// markup, so they take the HTML-aware typesetter — `typesetQuotes` would curl
	// quotes inside any attribute.
	const abstractParagraphs = $derived(
		(publication.abstract ?? '')
			.split(/\n\s*\n|\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
			.map(typesetQuotesInHtml)
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

<!-- Both rail blocks and the sibling-work block are grid children with their own
     gap, so each is passed only when it prints something: an empty block would
     read as a stray interval in the column. -->
{#snippet indexRail()}
	<PublicationIndexRail {publication} />
{/snippet}

{#snippet relatedBlock()}
	<RelatedItemsList
		allItems={allPublications}
		currentItemId={publication.id}
		filterKey="project"
		filterValue={publication.project}
		title="More in this project"
		itemComponent={RelatedItemCard as unknown as ComponentType}
		baseItemUrl="/publications/"
		viewAllUrl="{base}/publications"
		maxItems={3}
		sectionClass="pub-related section section--flush"
		titleClass="pub-related-title section-title"
	/>
{/snippet}

<RecordLayout
	section={{ label: 'Publications', href: `${base}/publications` }}
	breadcrumbCurrent={typeLabel}
	{eyebrow}
	title={displayTitle}
	{byline}
	{bylineSuffix}
	{breadcrumbItems}
	jsonLdScriptId="publication-json-ld"
	{jsonLdString}
	railSecondary={hasIndexApparatus(publication) ? indexRail : undefined}
	related={relatedInProject.length > 0 ? relatedBlock : undefined}
>
	{#snippet main()}
		<!-- Abstract -->
		{#if abstractParagraphs.length > 0}
			<section class="section pub-section" aria-labelledby="pub-abstract-head">
				<div class="section-head">
					<h2 id="pub-abstract-head" class="section-title">Abstract</h2>
				</div>
				<div class="pub-abstract">
					{#each abstractParagraphs as paragraph, index (index)}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: abstracts are trusted static data, and carry inline markup (<i> around transliterated terms). -->
						<p class="pub-abstract-p" class:drop-cap={index === 0}>{@html paragraph}</p>
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
	{/snippet}

	{#snippet railPrimary()}
		<PublicationRecordRail {publication} {typeLabel} {projectUrl} />
	{/snippet}
</RecordLayout>

<style>
	/* Consistent rhythm between the numbered sections. */
	.pub-section {
		margin-top: var(--space-2xl);
	}

	/* ── Abstract ──────────────────────────────────────────────────────────── */
	.pub-abstract {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: var(--measure-prose);
	}

	.pub-abstract-p {
		margin: 0;
	}

	.pub-abstract-p + .pub-abstract-p {
		margin-top: var(--space-md);
	}
</style>
