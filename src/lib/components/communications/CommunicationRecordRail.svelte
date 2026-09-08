<!--
CommunicationRecordRail — block one of the talk's metadata rail.

The mirror of <PublicationRecordRail>: venue plate, the "Record" ledger, and the
access stack. Rendered into <RecordLayout>'s `railPrimary` snippet, so below --lg
it sits with the masthead, ahead of the document.

No BibTeX here. `generateBibtex` is the publication export format and is shared
verbatim with the MCP server; a talk is not a bibliographic record it knows how
to emit, and widening it for one button would be the wrong place to decide that.
-->
<script lang="ts">
	import { base } from '$app/paths';
	import type { Communication } from '$lib/types/communication';
	import RecordLedger, { type MetaRow } from '$lib/components/molecules/RecordLedger.svelte';
	import { buildSrcset, imageDimensions, resolveImagePath } from '$lib/utils/imageVariants';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	// The rail is 380px wide from --lg up; below that the plate spans the single
	// column. The intrinsic size reserves the plate's box before the lazily
	// loaded bytes arrive, so the record never shifts around it.
	const PLATE_SIZES = '(max-width: 1024px) 100vw, 380px';

	interface Props {
		communication: Communication;
		/** Human-readable type badge (e.g. 'Conference Paper'). */
		typeLabel: string;
		/** Internal research-project URL for the Project ledger row, when mapped. */
		projectUrl?: string;
		/** True when a deck is embedded in the reading column, adding a jump link. */
		hasSlides?: boolean;
	}

	let { communication, typeLabel, projectUrl, hasSlides = false }: Props = $props();

	// Venue plate. Prefer the dedicated hero; fall back to the list image.
	const plateSrc = $derived(
		resolveImagePath(communication.heroImage?.src ?? communication.image, base)
	);
	const plateSrcset = $derived(buildSrcset(plateSrc));
	const plateSize = $derived(imageDimensions(plateSrc));
	const plateAlt = $derived(typesetQuotes(communication.heroImage?.alt ?? communication.title));

	// Plate caption: the authored caption when there is one, otherwise the venue,
	// which is the one fact a photograph of a talk always carries. Any trailing
	// stop is dropped before the idiom's own is appended.
	const plateCaption = $derived.by(() => {
		const source = communication.heroImage?.caption ?? communication.location;
		if (!source) return undefined;
		return typesetQuotes(source.trim().replace(/\.$/, ''));
	});

	// ── Metadata ledger rows — render only fields present in the data. ──────────
	const metadataRows = $derived.by((): MetaRow[] => {
		const rows: MetaRow[] = [];
		// Ledger values are event / venue / project fields — prose, not
		// identifiers — so they take the display register. The DOI row passes its
		// raw value through as the href and only the printed copy is typeset (a
		// curled apostrophe in a DOI would break the link).
		const push = (key: string, value: string | undefined | null, extra: Partial<MetaRow> = {}) => {
			if (value != null && String(value).trim() !== '') {
				rows.push({ key, value: typesetQuotes(String(value)), ...extra });
			}
		};

		push('Type', typeLabel);
		push('Event', communication.conference);
		// A conference paper sits inside a panel; everything else — a seminar, a
		// lecture, a podcast — sits inside a series.
		push(communication.type === 'conference' ? 'Panel' : 'Series', communication.panelTitle);
		push('Episode', communication.episode != null ? String(communication.episode) : undefined);
		push('Location', communication.location);
		push('Country', communication.country);
		push('Date', communication.date);
		push(
			'Language',
			Array.isArray(communication.language)
				? communication.language.join(' · ')
				: communication.language
		);

		if (communication.doi) {
			push('DOI', communication.doi, {
				href: `https://doi.org/${communication.doi}`,
				external: true,
				accent: true,
				icon: 'academicons:doi'
			});
		}

		if (communication.project) {
			push('Project', communication.project, {
				href: projectUrl,
				accent: true
			});
		}

		return rows;
	});

	const additionalUrls = $derived(
		communication.additionalUrls?.filter((link) => link.url && link.label) ?? []
	);
</script>

{#if plateSrc}
	<figure class="rail-plate">
		<img
			class="plate"
			src={plateSrc}
			srcset={plateSrcset}
			sizes={plateSrcset ? PLATE_SIZES : undefined}
			width={plateSize?.width}
			height={plateSize?.height}
			alt={plateAlt}
			loading="lazy"
			decoding="async"
		/>
		{#if plateCaption}
			<figcaption class="plate-caption">Fig. 1 — {plateCaption}.</figcaption>
		{/if}
	</figure>
{/if}

<RecordLedger rows={metadataRows} />

<!-- CTAs — the one pine fill is the record's own destination; the deck jump and
     every mirror below it are outlines. -->
{#if communication.url || additionalUrls.length > 0 || hasSlides}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- external talk links, plus an in-page anchor -->
	<div class="rail-cta">
		{#if communication.url}
			<a
				href={communication.url}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-accent btn-block"
			>
				{communication.urlLabel ?? 'Access Presentation'} ↗
			</a>
		{/if}
		{#if hasSlides}
			<a href="#slides" class="btn btn-outline-primary btn-block">View slides ↓</a>
		{/if}
		{#each additionalUrls as link (link.url)}
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-outline-secondary btn-block"
			>
				{link.label} ↗
			</a>
		{/each}
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
