<!--
ActivityRecordRail — block one of a log entry's metadata rail.

The mirror of <CommunicationRecordRail>: event plate, the "Record" ledger, and
the access stack. Rendered into <RecordLayout>'s `railPrimary` snippet, so below
--lg it sits with the masthead, ahead of the document.

Thinner than its siblings by the record's own nature — an activity carries a
kind and a date, and nothing that resembles a venue or an identifier. The year's
archive is reachable from every record, but as an action rather than a ledger
row: the date already prints the year, the eyebrow prints kind and date again,
and a row whose value is a link to somewhere else is a destination wearing a
catalogue entry's clothes.

No BibTeX and no cite block. A log entry is a note about work, not a
bibliographic record; `generateBibtex` is the publication export format and is
shared verbatim with the MCP server, and widening it here would be the wrong
place to decide that.
-->
<script module lang="ts">
	/**
	 * The rail is 380px wide from --lg up; below that the plate spans the single
	 * column. Exported because the route preloads this image for LCP, and the
	 * preload scanner only resolves the same candidate as the rendered <img> if
	 * its `imagesizes` matches this string exactly — a mismatch downloads a
	 * second, differently sized copy that nothing on the page ever uses.
	 */
	export const RAIL_PLATE_SIZES = '(max-width: 1024px) 100vw, 380px';
</script>

<script lang="ts">
	import { base } from '$app/paths';
	import type { Activity } from '$lib/types/activity';
	import RecordLedger, { type MetaRow } from '$lib/components/molecules/RecordLedger.svelte';
	import { buildSrcset, imageDimensions, resolveImagePath } from '$lib/utils/imageVariants';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { plateFallback } from '$lib/actions/plateFallback';

	interface Props {
		activity: Activity;
		/** Human-readable kind label (e.g. 'Workshop'), shared with the masthead. */
		kindLabel: string;
		/** True when a PDF is embedded in the reading column, adding a jump link. */
		hasDocument?: boolean;
	}

	let { activity, kindLabel, hasDocument = false }: Props = $props();

	// Event plate. Prefer the dedicated hero; fall back to the list image.
	const plateSrc = $derived(resolveImagePath(activity.heroImage?.src ?? activity.image, base));
	const plateSrcset = $derived(buildSrcset(plateSrc));
	const plateSize = $derived(imageDimensions(plateSrc));
	const plateAlt = $derived(typesetQuotes(activity.heroImage?.alt ?? activity.title));

	// Only an authored caption is printed. Nothing here records where or by whom
	// these photographs were taken, and a caption that restates the title is not
	// a caption. Any trailing stop is dropped before the idiom's own is appended.
	const plateCaption = $derived.by(() => {
		const source = activity.heroImage?.caption;
		if (!source) return undefined;
		return typesetQuotes(source.trim().replace(/\.$/, ''));
	});

	const yearHref = $derived(`${base}/activities/year/${activity.year}`);

	// ── Metadata ledger rows — render only fields present in the data. ──────────
	const metadataRows = $derived.by((): MetaRow[] => {
		const rows: MetaRow[] = [];
		const push = (key: string, value: string | undefined | null, extra: Partial<MetaRow> = {}) => {
			if (value != null && String(value).trim() !== '') {
				rows.push({ key, value: typesetQuotes(String(value)), ...extra });
			}
		};

		push('Type', kindLabel);
		push('Date', activity.date);
		// No Year row: the date above it already prints the year, and the eyebrow
		// prints both again. The archive it used to reach is a destination, not a
		// fact about the record, so it is an action in the stack below.

		return rows;
	});

	const additionalUrls = $derived(
		activity.additionalUrls?.filter((link) => link.url && link.label) ?? []
	);

	// The primary action's label follows the record: a published piece names
	// itself, everything else opens the source it was filed from, unless the data
	// names the destination itself.
	const primaryLabel = $derived(
		activity.urlLabel ?? (activity.type === 'publication' ? 'Open publication' : 'Open the source')
	);

	// Plate caption — "Fig. 1." is the figure's number, so the stop belongs to it
	// and the caption follows as its own sentence. Authored captions that already
	// end in punctuation keep theirs rather than collecting a second full stop.
	const plateFigCaption = $derived(
		plateCaption
			? `Fig. 1. ${plateCaption}${/[.!?…]$/.test(plateCaption.trim()) ? '' : '.'}`
			: undefined
	);
</script>

{#if plateSrc}
	<figure class="rail-plate">
		<img
			class="plate"
			src={plateSrc}
			srcset={plateSrcset}
			sizes={plateSrcset ? RAIL_PLATE_SIZES : undefined}
			width={plateSize?.width}
			height={plateSize?.height}
			alt={plateAlt}
			fetchpriority="high"
			decoding="async"
			use:plateFallback
		/>
		{#if plateFigCaption}
			<figcaption class="plate-caption">{plateFigCaption}</figcaption>
		{/if}
	</figure>
{/if}

<RecordLedger rows={metadataRows} />

<!-- CTAs — the one pine fill is the record's own destination; the document jump,
     the year archive and every mirror below them are outlines. -->
{#if activity.url || additionalUrls.length > 0 || hasDocument || activity.year != null}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- external activity links, plus an in-page anchor -->
	<div class="rail-cta">
		{#if activity.url}
			<a
				href={activity.url}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-accent btn-block"
			>
				{primaryLabel}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
					(opens in new tab)</span
				>
			</a>
		{/if}
		{#if hasDocument}
			<a href="#document" class="btn btn-outline-primary btn-block"
				>View document<span aria-hidden="true">&nbsp;↓</span></a
			>
		{/if}
		{#each additionalUrls as link (link.url)}
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-outline-secondary btn-block"
			>
				{link.label}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
					(opens in new tab)</span
				>
			</a>
		{/each}
		{#if activity.year != null}
			<!-- The year's own archive: the one place this record goes that is not
			     the work itself. It was a ledger row until the ledger stopped
			     restating the eyebrow; as a destination it belongs in the stack. -->
			<a href={yearHref} class="btn btn-outline-secondary btn-block"
				>View the {activity.year} log<span aria-hidden="true">&nbsp;→</span></a
			>
		{/if}
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
