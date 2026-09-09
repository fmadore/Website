<script lang="ts">
	// The log entry as a record.
	//
	// This page used to be the site's last <EntityDetailLayout> consumer bar one:
	// a <PageHeader> masthead, a 330px-capped hero image in the reading column,
	// the entry's prose inside a <ContentBody> whose 24px inset started it a rule
	// short of the masthead above it, then a stack of buttons, tag pills and an
	// RSS chip trailing off the bottom. Every other record on the site — a
	// publication, a talk, a research project — is drawn by <RecordLayout>, and a
	// log entry is a record like any of them: it has a kind, a date, a plate, an
	// address and an index. It now composes the same shell, so the reader who
	// arrives here from /publications finds the apparatus where they left it.
	//
	// The masthead also stopped disagreeing with the index about what this is:
	// the badge read `panelType` ("Media", "News") while the log row beside it
	// read `type` through the shared label map ("Podcast", "News"). One record,
	// one kind, one label — the map.
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import { buildSrcset, resolveImagePath } from '$lib/utils/imageVariants';
	import RecordLayout, { type EyebrowToken } from '$lib/components/common/RecordLayout.svelte';
	import ActivityRecordRail, {
		RAIL_PLATE_SIZES
	} from '$lib/components/activities/ActivityRecordRail.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
	import type { PageData } from './$types';

	import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte';
	import {
		createActivitySEODescription,
		createActivitySEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { ACTIVITY_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';
	import { typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';
	import MetaTags from '$lib/components/activities/MetaTags.svelte';

	// Get data from the load function
	let { data }: { data: PageData } = $props();
	const activity = $derived(data.activity);
	const jsonLdString = $derived(data.jsonLdString);

	// Generate optimized SEO data for blog-style activity pages
	const seoDescription = $derived(createActivitySEODescription(activity));
	const seoKeywords = $derived(createActivitySEOKeywords(activity));

	// Define breadcrumb items - reactive to activity changes
	const breadcrumbItems = $derived([
		{ label: 'Activities', href: `${base}/activities` },
		{ label: truncateTitle(activity.title), href: `${base}/activities/${activity.id}` }
	]);

	// Breadcrumb + activity JSON-LD injection is handled by RecordLayout, under
	// the same two script ids EntityDetailLayout used.

	// The record's kind, from the map the log rows and the type facet both read.
	const kindLabel = $derived(
		activity.type ? (ACTIVITY_TYPE_BADGE_LABELS[activity.type] ?? activity.type) : 'Activity'
	);

	// Masthead: kind and dateline. Nothing else about a log entry is a fact the
	// eyebrow can carry — its destination belongs in the rail's action stack.
	const eyebrow = $derived.by((): EyebrowToken[] => {
		const tokens: EyebrowToken[] = [{ label: kindLabel }];
		if (activity.date) tokens.push({ label: activity.date });
		return tokens;
	});

	const displayTitle = $derived(typesetQuotes(activity.title));
	// The one-sentence description the log prints beside every entry. The record
	// page had been dropping it entirely — the summary was visible on the index
	// and on nothing else.
	const displayDescription = $derived(typesetQuotes(activity.description ?? ''));

	// Hero image preload as a string. Using {@html} instead of {#if} inside
	// <svelte:head> avoids a Svelte 5 hydration bug where falsy {#if} blocks
	// in the head leave a marker the client cannot walk (TypeError reading
	// 'nodeType' of null in if.js). Source values come from trusted .ts files
	// in src/lib/data/activities, so direct interpolation is safe here.
	//
	// imagesrcset/imagesizes are not optional decoration: the rail renders this
	// plate with a srcset of _r/ variants, so the browser fetches e.g.
	// `-800.webp` and never the full-size original. Preloading the bare href
	// downloaded a second, larger copy that nothing on the page ever used. These
	// three attributes have to mirror the rendered image for the scanner to
	// resolve the same candidate, hence the shared helpers and the `sizes`
	// string exported by the rail itself.
	const heroImagePreloadHtml = $derived.by(() => {
		const resolved = resolveImagePath(activity?.heroImage?.src ?? activity?.image, base);
		if (!resolved) return '';
		const srcset = buildSrcset(encodeURI(resolved));
		const attrs = [
			'rel="preload"',
			'as="image"',
			`href="${encodeURI(resolved)}"`,
			srcset ? `imagesrcset="${srcset}"` : '',
			srcset ? `imagesizes="${RAIL_PLATE_SIZES}"` : '',
			'fetchpriority="high"'
		].filter(Boolean);
		return `<link ${attrs.join(' ')}>`;
	});

	// --- Content Parsing Logic (Keep as is, uses activity from data) ---
	interface ContentSegment {
		type: 'html' | 'ItemReference';
		value?: string; // For html type
		id?: string; // For ItemReference type
	}
	const contentSegments = $derived(
		activity?.content
			? (() => {
					const rawContent = activity.content.replace(/href="\/([^/])/g, `href="${base}/$1`);
					const regex = /<ItemReference\s+id="([^"]+)"\s*>/g;
					const segments: ContentSegment[] = [];
					let lastIndex = 0;
					let match;

					// Each html segment is a run of the activity's own markup (links,
					// <em>, headings), so it typesets with the HTML-aware entry point:
					// `typesetQuotes` would curl the quotes around every href.
					while ((match = regex.exec(rawContent)) !== null) {
						if (match.index > lastIndex) {
							segments.push({
								type: 'html',
								value: typesetQuotesInHtml(rawContent.substring(lastIndex, match.index))
							});
						}
						segments.push({ type: 'ItemReference', id: match[1] });
						lastIndex = regex.lastIndex;
					}
					if (lastIndex < rawContent.length) {
						segments.push({
							type: 'html',
							value: typesetQuotesInHtml(rawContent.substring(lastIndex))
						});
					}
					return segments;
				})()
			: []
	);
	// --- End Content Parsing Logic ---

	const tags = $derived(activity.tags?.filter(Boolean) ?? []);
</script>

<svelte:head>
	<!-- Font preconnects are global in app.html; no per-route duplicates. -->

	<!-- Conditional preload of hero image if it exists to improve LCP. -->
	<!-- See heroImagePreloadHtml in <script> for why this uses {@html}. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html heroImagePreloadHtml}
</svelte:head>

<!-- SEO Component with blog post optimizations -->
<SEO
	title={activity.title}
	description={seoDescription}
	keywords={seoKeywords}
	type="article"
	ogImage={activity.heroImage?.src
		? `${base}/${activity.heroImage.src}`
		: `${base}/images/Profile-picture.webp`}
/>

<!-- MetaTags Component for Zotero blog post detection -->
<MetaTags {activity} />

<!-- The tag block is a grid child with its own gap, so it is passed only when it
     prints something: an empty block would read as a stray interval. -->
{#snippet deck()}
	{#if displayDescription}
		<p class="standfirst record-deck">{displayDescription}</p>
	{/if}
{/snippet}

{#snippet indexRail()}
	<div class="act-tags">
		<h2 class="rail-label">Tags</h2>
		<div class="chip-row">
			{#each tags as tag (tag)}
				<!-- Label typeset; the href keeps the raw tag the filter matches. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- tag search URL -->
				<a class="chip" rel="nofollow" href="{base}/activities?tag={encodeURIComponent(tag)}"
					>{typesetQuotes(tag)}</a
				>
			{/each}
		</div>
	</div>
{/snippet}

<RecordLayout
	section={{ label: 'Activities', href: `${base}/activities` }}
	breadcrumbCurrent={kindLabel}
	{eyebrow}
	title={displayTitle}
	{deck}
	{breadcrumbItems}
	jsonLdScriptId="activity-json-ld"
	{jsonLdString}
	railSecondary={tags.length > 0 ? indexRail : undefined}
>
	{#snippet main()}
		<!-- The entry itself, set as prose on the paper rather than inside a
		     bordered wrapper: `.prose` carries the site's reading measure, heading
		     rhythm and link idiom, and starts flush with the masthead's rule. -->
		{#if contentSegments.length > 0}
			<div class="prose">
				{#each contentSegments as segment, segmentIndex (segmentIndex)}
					{#if segment.type === 'html'}
						<!-- Safe: content is from trusted activity data files in src/lib/data/activities/ -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html segment.value}
					{:else if segment.type === 'ItemReference' && segment.id}
						<ItemReference id={segment.id} />
					{/if}
				{/each}
			</div>
		{/if}

		<!-- An associated document, embedded. The rail's "View document ↓" jumps
		     here; before, the section had no anchor and nothing linked to it. -->
		{#if activity.pdfPath}
			<section class="section act-section" id="document" aria-labelledby="act-document-head">
				<div class="section-head">
					<h2 id="act-document-head" class="section-title">
						{typesetQuotes(activity.pdfTitle) || 'Associated Document'}
					</h2>
				</div>
				<IframeRenderer
					id="activity-pdf-{activity.id}"
					src="{base}/{activity.pdfPath}"
					title="{activity.title} PDF Document"
					height="800px"
					variant="document"
					sandbox={null}
				/>
			</section>
		{/if}
	{/snippet}

	{#snippet railPrimary()}
		<ActivityRecordRail {activity} {kindLabel} hasDocument={Boolean(activity.pdfPath)} />
	{/snippet}
</RecordLayout>

<style>
	/* The description sits where a bibliographic record prints its byline, so it
	   takes the same interval above it. */
	.record-deck {
		margin: var(--space-md) 0 0;
	}

	/* Consistent rhythm between the reading column's blocks — the same step
	   /communications/[id] sets between its sections. */
	.act-section {
		margin-top: var(--space-2xl);
	}
</style>
