<!--
ResearchProjectLayout — the shell for a research-project dossier.

A research project is a record like any other, so this is a *composition* over
`<RecordLayout>` rather than a second implementation of it. The shell supplies
the breadcrumb, the mono-eyebrow/Archivo masthead, the `minmax(0,1fr) 380px`
grid with its sticky rail and its single-column order choreography, and the
JSON-LD apparatus. What is left here is what only a research project has:

  - the masthead deck (a `.standfirst`, where a bibliographic record has a
    byline) passed through RecordLayout's `deck` snippet;
  - the narrative slot — prose authored as markup in each route page, cast here
    into ruled `<h2>` sections with a drop-capped opening paragraph;
  - the derivation of the apparatus rail's values from the project's real grant
    record (`allGrants`, filtered by `projectName`), rendered by
    `<ResearchProjectAside>` into the rail;
  - the podcast player and the related-work panels that close the page.

Every rail row renders only when its value exists — projects with no
co-director, programme or grant simply drop those rows.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import SEO from '$lib/SEO.svelte';
	import RecordLayout, { type EyebrowToken } from '$lib/components/common/RecordLayout.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import MediaPlayer from '$lib/components/media/MediaPlayer.svelte';
	import ResearchProjectAside from '$lib/components/research/ResearchProjectAside.svelte';
	import { GRANTS_SCRIPT_ID, buildGrantsJsonLd } from '$lib/utils/grantsJsonLd.svelte';
	import { allGrants } from '$lib/data/grants/index';
	import { allPublicationSummaries as allPublications } from '$lib/data/publications/summaries';
	import { allCommunications } from '$lib/data/communications/index';
	import type { Grant, ResearchProject } from '$lib/types';
	import { website } from '$lib/utils/siteHelpers';
	import { base } from '$app/paths';
	import { formatProjectPeriod } from '$lib/utils/projectPeriod';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	/**
	 * Every project record in `$lib/data/research` is spread straight into this
	 * layout, so the props *are* the record — plus the narrative snippet, which
	 * stays in the route page because it embeds components.
	 */
	interface Props extends ResearchProject {
		/** Content snippet for the main body */
		children: Snippet;
	}

	let {
		title,
		shortTitle,
		cardTitle,
		id,
		years,
		imageSrc,
		imageAlt,
		seoDescription,
		seoKeywords,
		audioSrc,
		projectName,
		subtitle,
		figCaption,
		coDirectors,
		funder,
		programme,
		regions,
		sourceLanguages,
		ctas,
		showFunding = true,
		children
	}: Props = $props();

	// Breadcrumb trail — the shell prints an editorial back-link from `section`;
	// this array is what feeds the breadcrumb JSON-LD, unchanged.
	const breadcrumbItems = $derived([
		{ label: 'Research', href: `${base}/research` },
		{ label: shortTitle, href: `${base}/research/${id}` }
	]);

	const grantsJsonLd = $derived(buildGrantsJsonLd(projectName, `${website.url}/research/${id}`));

	/** Every grant attached to this project, most recently started first. */
	const projectGrants = $derived<Grant[]>(
		allGrants
			.filter((grant) => grant.project === projectName)
			.sort((a, b) => new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime())
	);

	/**
	 * The project's headline grant record — the most recently started grant
	 * associated with this project. Supplies funder and co-applicants for the
	 * metadata ledger without duplicating data on the page.
	 */
	const primaryGrant = $derived<Grant | undefined>(projectGrants[0]);

	/**
	 * The figures the ledger reports: every awarded grant carrying an amount,
	 * oldest first, so a project carried by several awards states all of its
	 * support (€53,670 + €60,410) rather than only the newest line. Listing
	 * rather than summing keeps awards in different currencies honest and matches
	 * the itemised Funding panel. A project with no award yet falls back to its
	 * headline grant, so a submitted or turned-down record still reads with its
	 * own status.
	 */
	const ledgerGrants = $derived.by((): Grant[] => {
		const awarded = projectGrants.filter((grant) => grant.status === 'Awarded' && grant.amount);
		if (awarded.length > 0) return awarded.reverse();
		return primaryGrant?.amount ? [primaryGrant] : [];
	});

	// Funder: explicit prop wins, else the headline grant's funder.
	const funderLabel = $derived(funder ?? primaryGrant?.funder);

	// Co-directors: explicit prop wins, else the headline grant's co-applicants.
	const directors = $derived<string[]>(
		coDirectors && coDirectors.length > 0 ? coDirectors : (primaryGrant?.coApplicants ?? [])
	);

	function formatGrantAmount(grant: Grant): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: grant.currency || 'EUR',
			maximumFractionDigits: 0
		}).format(grant.amount ?? 0);
	}

	// Formatted grant figures (e.g., "€317,690", "€53,670 + €60,410") — omitted
	// when no grant on the project carries an amount.
	const grantAmount = $derived(
		ledgerGrants.length > 0 ? ledgerGrants.map(formatGrantAmount).join(' + ') : undefined
	);

	/**
	 * Masthead eyebrow: the project period, formatted — so an open-ended record
	 * reads "Since 2026" here exactly as it does in the research index, instead
	 * of printing its raw `2026-` with the hyphen left dangling.
	 *
	 * The funder deliberately stays out of it and prints in the rail's Funder
	 * row. It is the one masthead fact whose value can run to a full sentence
	 * ("Social Sciences and Humanities Research Council of Canada (SSHRC)"), and
	 * an eyebrow token is `white-space: nowrap` so that a short one — a type
	 * label, a date — never breaks across two lines; a funder set there would
	 * simply overrun a 375px viewport.
	 */
	const eyebrow = $derived.by((): EyebrowToken[] => [{ label: formatProjectPeriod(years) }]);

	// Masthead prose. The narrative body arrives through the `children` snippet
	// as literal markup authored in each route, so it is typeset at its source
	// rather than here — there is no string to run through the typesetter.
	const displayTitle = $derived(typesetQuotes(title));
	const displaySubtitle = $derived(typesetQuotes(subtitle));

	/**
	 * Whether each related-items panel has anything to list. A project whose
	 * outputs are still in progress would otherwise print "No publications found
	 * for this project" under a section rule, which reads as a fault rather than
	 * as a project that hasn't published yet. Both datasets are already pulled in
	 * by the panels themselves, so testing them here costs no extra bundle.
	 */
	const hasPublications = $derived(
		allPublications.some((publication) => publication.project === projectName)
	);
	const hasCommunications = $derived(
		allCommunications.some((communication) => communication.project === projectName)
	);
</script>

<!-- Research pages were the one detail type shipping no `ogImage`, so a shared
     link fell back to the profile picture instead of the project plate. No
     `canonical`: SEO.svelte defaults it to the page's own address, which for
     this route is the same value. -->
<SEO
	title="{cardTitle ?? shortTitle} | Frédérick Madore"
	description={seoDescription}
	keywords={seoKeywords}
	ogImage="{base}/images/research/{imageSrc}"
	type="article"
/>

{#snippet deck()}
	{#if displaySubtitle}
		<p class="standfirst project-subtitle">{displaySubtitle}</p>
	{/if}
{/snippet}

{#snippet railPrimary()}
	<ResearchProjectAside
		plateSrc="{base}/images/research/{imageSrc}"
		plateAlt={imageAlt}
		plateCaption={figCaption}
		{years}
		{directors}
		{funderLabel}
		{programme}
		{grantAmount}
		grantStatus={ledgerGrants[0]?.status}
		grantCount={ledgerGrants.length}
		{regions}
		{sourceLanguages}
		{ctas}
		{showFunding}
	/>
{/snippet}

{#snippet related()}
	<div class="related-content">
		{#if hasPublications}
			<RelevantPublications {projectName} limit={6} />
		{/if}
		{#if hasCommunications}
			<div class="related-comms" class:related-comms--only={!hasPublications}>
				<RelevantCommunications {projectName} limit={6} />
			</div>
		{/if}
	</div>
{/snippet}

<RecordLayout
	section={{ label: 'Research', href: `${base}/research` }}
	breadcrumbCurrent="Project"
	{eyebrow}
	title={displayTitle}
	{deck}
	{breadcrumbItems}
	jsonLdScriptId={GRANTS_SCRIPT_ID}
	jsonLdString={grantsJsonLd ?? undefined}
	{railPrimary}
	related={hasPublications || hasCommunications ? related : undefined}
>
	{#snippet main()}
		<!-- Project narrative. Prose arrives through the slot; scoped styles
		     below turn its <h2> headings into ruled section heads and
		     drop-cap the opening paragraph. -->
		<div class="project-prose">
			{@render children()}
		</div>

		{#if audioSrc}
			<section class="section">
				<div class="section-head">
					<span class="section-no" aria-hidden="true">♪</span>
					<h2 class="section-title">Podcast discussion (AI-generated)</h2>
				</div>
				<MediaPlayer
					src="{base}/{audioSrc}"
					type="audio"
					title="Google NotebookLM discussion"
					surface=""
					showControls={true}
				/>
			</section>
		{/if}
	{/snippet}
</RecordLayout>

<style>
	/* ==========================================================================
	 * MASTHEAD DECK — the standfirst under the title
	 *
	 * `.standfirst` (ink-signal.css) already sets the serif italic, the soft ink
	 * and `--measure-standfirst`; these two declarations bring it to the same
	 * size and offset as the byline a bibliographic record prints in this slot.
	 * ======================================================================== */
	.project-subtitle {
		margin-top: var(--space-md);
		font-size: var(--font-size-xl);
	}

	/* ==========================================================================
	 * PROSE — the narrative slot, cast in ruled sections
	 *
	 * Each project page authors its body as paragraphs, lists and <h2> heads.
	 * Here the first paragraph gets a drop cap, and every <h2> is drawn as a
	 * ruled section head: a 3px rule and an Archivo title.
	 *
	 * Links are deliberately unstyled here: the site-wide prose-link idiom in
	 * typography.css already gives any <a> inside a <p> or <li> ink text with a
	 * pine underline, and the local rule this block used to carry only overrode
	 * the text colour — making every citation in the narrative a solid pine
	 * link, which is ~15 accent marks on the longest page.
	 * ======================================================================== */
	.project-prose {
		color: var(--color-text);
		font-family: var(--font-family-serif);
	}

	/* Direct children only. `<RelevantGrants>` is authored inside this slot on
	   five of the six projects, and a descendant selector reached into the
	   Funding panel: its grant rows were being given the prose measure, the
	   prose line-height and a stray bottom margin inside a flex column that
	   already sets its own gap. The panel is apparatus, not prose. */
	.project-prose > :global(p),
	.project-prose > :global(ul) > :global(li),
	.project-prose > :global(ol) > :global(li) {
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: var(--measure-prose);
	}

	.project-prose > :global(p) {
		margin: 0 0 var(--space-md);
	}

	/* Opening paragraph — larger ink and a pine Archivo drop cap. This restates
	   `.drop-cap` rather than using it: the prose arrives as a snippet authored
	   in the route page, so the layout has no element here to put a class on. */
	.project-prose :global(> p:first-child) {
		font-size: var(--font-size-lg);
		color: var(--color-text-emphasis);
	}

	.project-prose :global(> p:first-child::first-letter) {
		float: left;
		font-family: var(--font-family-display);
		font-variation-settings: 'wdth' 118;
		font-weight: 850;
		font-size: 4.4em;
		line-height: 0.72;
		padding: 0.06em 0.1em 0 0;
		color: var(--color-accent);
	}

	.project-prose :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	.project-prose :global(em) {
		font-style: italic;
	}

	/* <h2> → section head opened by a 3px section rule. Direct children only: a
	   descendant selector also caught the Funding panel's own `.panel-title`,
	   which then printed a second 3px rule under the panel's and swapped the
	   mono label for an Archivo headline — the one place on the site where that
	   panel did not look like itself. */
	.project-prose > :global(h2) {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--rule-gap);
		margin: var(--space-2xl) 0 var(--space-md);
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		letter-spacing: var(--tracking-display-sm);
		line-height: 1.05;
		color: var(--color-text-emphasis);
	}

	/* <h3> — quiet serif subhead inside a section. */
	.project-prose > :global(h3) {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin: var(--space-lg) 0 var(--space-sm);
	}

	/* Ordered lists — the "innovations" enumeration reads as a ledger of
	   numbered items; keep the markers but give them room. */
	.project-prose > :global(ul),
	.project-prose > :global(ol) {
		margin: 0 0 var(--space-lg);
		padding-left: var(--space-lg);
	}

	.project-prose > :global(ul) > :global(li),
	.project-prose > :global(ol) > :global(li) {
		margin-bottom: var(--space-sm);
	}

	.project-prose > :global(ul) > :global(li::marker),
	.project-prose > :global(ol) > :global(li::marker) {
		color: var(--color-text-light);
		font-family: var(--font-family-mono);
	}

	/* ==========================================================================
	 * RELATED WORK — the closing block, opened by its own section rule
	 * ======================================================================== */
	.related-content {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--rule-gap);
	}

	.related-comms {
		margin-top: var(--space-xl);
	}

	/* Sole panel in the block — the section rule above already supplies the gap. */
	.related-comms--only {
		margin-top: 0;
	}
</style>
