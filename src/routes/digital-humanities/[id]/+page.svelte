<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import MetaTags from '$lib/components/digital-humanities/MetaTags.svelte';
	import RecordLayout, { type EyebrowToken } from '$lib/components/common/RecordLayout.svelte';
	import DhProjectRail from '$lib/components/digital-humanities/DhProjectRail.svelte';
	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';
	import { formatProjectPeriod } from '$lib/utils/projectPeriod';
	import { typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';

	import { base } from '$app/paths';
	import { plateFallback } from '$lib/actions/plateFallback';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const project = $derived(data.project);
	const jsonLdString = $derived(data.jsonLdString);

	// Breadcrumb trail — the shell prints an editorial back-link from `section`;
	// this array is what feeds the breadcrumb JSON-LD, unchanged.
	const breadcrumbItems = $derived([
		{ label: 'Digital Humanities', href: `${base}/digital-humanities` },
		{ label: project.title, href: `${base}/digital-humanities/${project.id}` }
	]);

	/**
	 * Masthead eyebrow: the project's period, formatted — so an open-ended
	 * record reads "Since 2023" here as it does in the catalogue, rather than
	 * printing its raw `2023-` with the hyphen left dangling, which is what the
	 * page header did before.
	 */
	const eyebrow = $derived.by((): EyebrowToken[] => [
		{ label: formatProjectPeriod(project.years) }
	]);

	const displayTitle = $derived(typesetQuotes(project.title));

	const embeds = $derived(project.embeddableContent ?? []);
	const reviews = $derived(project.reviews ?? []);
	const skills = $derived(project.skills ?? []);

	// Does this record have a document at all? Every project on file carries a
	// narrative, but the column is passed conditionally like every other grid
	// child so a record without one prints its rail rather than an empty
	// reading interval.
	const hasDocument = $derived(
		Boolean(project.description?.trim()) ||
			embeds.length > 0 ||
			Boolean(project.award) ||
			Boolean(project.publication) ||
			reviews.length > 0
	);
</script>

<SEO
	title={project.seoTitle || `${project.title} | Digital Humanities | Frédérick Madore`}
	schemaName={project.title}
	description={project.seoDescription || project.shortDescription}
	keywords={project.seoKeywords?.join(', ') ||
		[project.title, 'Digital Humanities', 'Frédérick Madore', ...(project.skills || [])].join(', ')}
	ogImage={project.heroImageUrl ? `${base}${project.heroImageUrl}` : `${base}${project.imageUrl}`}
/>

<!-- Zotero/COinS metadata — mirrors the other detail routes' MetaTags. -->
<MetaTags {project} />

{#snippet railPrimary()}
	<DhProjectRail {project} />
{/snippet}

<!-- The record's own methods, in the block that falls *past* the narrative in a
     single column: an index belongs after the thing it indexes. Chips rather
     than an apparatus run, because here each term is a control — it filters the
     catalogue — which is the distinction the two idioms draw. -->
{#snippet railSecondary()}
	<div>
		<h2 class="rail-label">Methods</h2>
		<div class="chip-row">
			{#each skills as skill (skill)}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- skill filter URL -->
				<a
					class="chip"
					rel="nofollow"
					href="{base}/digital-humanities?skill={encodeURIComponent(skill)}"
					>{typesetQuotes(skill)}</a
				>
			{/each}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	</div>
{/snippet}

{#snippet documentColumn()}
	<!-- ═══ NARRATIVE ═══
	     Authored markup from the record, cast into ruled sections by the
	     `.record-prose` idiom and opened by a drop cap. Markup-bearing prose,
	     so typesetQuotesInHtml, never typesetQuotes. -->
	<!-- Safe: project.description is trusted data in src/lib/data/digital-humanities/ -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="record-prose drop-cap">{@html typesetQuotesInHtml(project.description)}</div>

	<!-- ═══ EMBEDDED WORK ═══
	     The project shown rather than described: a live visualisation, a
	     timeline, a scan. Each item keeps its own id, so the embed markup and
	     the sandboxing are exactly what <IframeRenderer> shipped before. -->
	{#if embeds.length > 0}
		<div class="embeds">
			{#each embeds as item, index (item.id)}
				{@const figure = `Fig. ${index + 1}`}
				<figure class="embed">
					{#if item.type === 'iframe'}
						<IframeRenderer {...item} />
					{:else if item.type === 'image'}
						{#if item.linkUrl}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
							<a href={item.linkUrl} target="_blank" rel="noopener noreferrer" class="embed-link">
								<img
									src={item.src}
									alt={item.alt}
									class="plate"
									width="800"
									height="600"
									loading="lazy"
									decoding="async"
									use:plateFallback
								/>
								<span class="sr-only"> (opens in new tab)</span></a
							>
						{:else}
							<img
								src={item.src}
								alt={item.alt}
								class="plate"
								width="800"
								height="600"
								loading="lazy"
								decoding="async"
								use:plateFallback
							/>
						{/if}
					{/if}

					<!-- Title and description sit *under* the embed, as a plate's
					     caption does: the figure is the primary source and the words
					     annotate it. The stamp numbers the figures of this record,
					     which is real information rather than a fabricated caption —
					     eight of them on the longest page. -->
					<figcaption class="embed-caption">
						<p class="embed-title">
							{#if item.showTitle && item.title}
								{figure} — {typesetQuotes(item.title)}
							{:else}
								{figure}
							{/if}
						</p>
						{#if item.description}
							<!-- Safe: item.description is trusted project data -->
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<div class="embed-desc">{@html typesetQuotesInHtml(item.description)}</div>
						{/if}
					</figcaption>
				</figure>
			{/each}
		</div>
	{/if}

	<!-- ═══ APPARATUS ═══ what the project earned, cited and was reviewed in.
	     Each block prints only when the record carries it. -->
	{#if project.award}
		<section class="section">
			<div class="section-head">
				<h2 class="section-title">Award</h2>
			</div>
			<!-- Safe: project.award is trusted project data -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<p class="apparatus-text">{@html typesetQuotesInHtml(project.award)}</p>
		</section>
	{/if}

	{#if project.publication}
		<section class="section">
			<div class="section-head">
				<h2 class="section-title">Related publication</h2>
			</div>
			<p class="apparatus-text">
				<!-- Safe: project.publication.text is trusted project data -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
				<!-- eslint-disable svelte/no-at-html-tags -->
				<a href={project.publication.url} target="_blank" rel="noopener noreferrer"
					>{@html typesetQuotesInHtml(project.publication.text)}<span class="sr-only">
						(opens in new tab)</span
					></a
				>
				<!-- eslint-enable svelte/no-at-html-tags -->
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</p>
		</section>
	{/if}

	{#if reviews.length > 0}
		<section class="section">
			<div class="section-head">
				<h2 class="section-title">Reviews</h2>
			</div>
			<!-- A review is a dated record of somebody else's judgement, so it is
			     set as a ledger entry: the reference, then the passage quoted. -->
			<div class="ledger ledger--ruled">
				{#each reviews as review (review.url)}
					<article class="ledger-row review-row">
						<div class="ledger-content">
							<p class="apparatus-text">
								<!-- Safe: review.text is trusted project data -->
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
								<!-- eslint-disable svelte/no-at-html-tags -->
								<a href={review.url} target="_blank" rel="noopener noreferrer"
									>{@html typesetQuotesInHtml(review.text)}<span class="sr-only">
										(opens in new tab)</span
									></a
								>
								<!-- eslint-enable svelte/no-at-html-tags -->
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</p>
							{#if review.quote}
								<blockquote class="review-quote">{typesetQuotes(review.quote)}</blockquote>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/if}
{/snippet}

<RecordLayout
	section={{ label: 'Digital Humanities', href: `${base}/digital-humanities` }}
	{eyebrow}
	title={displayTitle}
	{breadcrumbItems}
	jsonLdScriptId="dh-project-json-ld"
	{jsonLdString}
	main={hasDocument ? documentColumn : undefined}
	{railPrimary}
	railSecondary={skills.length > 0 ? railSecondary : undefined}
></RecordLayout>

<style>
	/* ═══ EMBEDDED WORK ═══
	 * A run of plates and live embeds inside the reading column. The section
	 * rules above and below it come from `.record-prose`'s heads and the
	 * apparatus sections, so the run needs only its own interval. */
	.embeds {
		margin-top: var(--space-2xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
	}

	.embed {
		margin: 0;
	}

	/* <IframeRenderer> closes its frame with 32px of its own, which was the
	 * interval between one embed and the next when the words sat above the
	 * frame. They sit below it now, so the figure's gap does that job and the
	 * frame must close on its caption. Three classes deep deliberately: the
	 * component's own rule is also (0,2,0), so a two-class selector here would
	 * be decided by bundle order rather than by specificity. */
	.embeds .embed :global(.iframe-frame) {
		margin-block-end: 0;
	}

	.embed-link {
		display: block;
	}

	/* Caption under the figure — the plate caption idiom, with the embed's own
	 * title set first in the same serif italic and one weight up. */
	.embed-caption {
		margin-top: var(--space-2);
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-caption);
		color: var(--color-text-light);
		max-width: var(--measure-note);
	}

	.embed-title {
		margin: 0;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-soft);
	}

	.embed-desc :global(p) {
		margin: var(--space-1) 0 0;
	}

	/* ═══ APPARATUS ═══ serif prose under a section rule; no tile, no glass. */
	.apparatus-text {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0;
		max-width: var(--measure-prose);
	}

	/* A review row hangs no key — the reference is the record — so it collapses
	 * to the single content column the narrow-measure ledger already uses. */
	.review-row {
		grid-template-columns: minmax(0, 1fr);
	}

	/* The quoted passage — indented serif italic. The hanging quotation mark is
	 * a printer's mark, not a signal, so it takes ink rather than the accent. */
	.review-quote {
		margin: var(--space-sm) 0 0 var(--space-md);
		padding-left: var(--space-md);
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-light);
		max-width: var(--measure-note);
		position: relative;
	}

	.review-quote::before {
		content: '\201C';
		position: absolute;
		left: calc(-1 * var(--space-xs));
		top: calc(-1 * var(--space-2xs));
		font-family: var(--font-family-serif);
		font-size: var(--font-size-2xl);
		line-height: 1;
		color: var(--color-text-muted);
	}
</style>
