<!--
PublicationRecordRail — block one of the publication metadata rail.

What identifies and opens the record: the cover plate, the "Record" ledger, and
the access stack. Rendered into <RecordLayout>'s `railPrimary` snippet, so below
--lg it sits with the masthead, ahead of the document.

The other half of the old <PublicationAside> — tags and key terms — is
<PublicationIndexRail>, which belongs *after* the document it indexes.
-->
<script lang="ts">
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import RecordLedger, { type MetaRow } from '$lib/components/molecules/RecordLedger.svelte';
	import { generateBibtex } from '$lib/utils/bibtexGenerator';
	import { formatReferenceText } from '$lib/utils/citationFormatter';
	import { copyText } from '$lib/utils/clipboard';
	import { buildSrcset, imageDimensions, resolveImagePath } from '$lib/utils/imageVariants';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	// The rail is 380px wide from --lg up; below that the cover spans the
	// single column. The intrinsic size reserves the plate's box before the
	// lazily loaded bytes arrive, so the record never shifts around it.
	const COVER_SIZES = '(max-width: 1024px) 100vw, 380px';

	interface Props {
		publication: Publication;
		/** Human-readable type badge (e.g. 'Journal Article'). */
		typeLabel: string;
		/** Internal research-project URL for the Project ledger row, when mapped. */
		projectUrl?: string;
	}

	let { publication, typeLabel, projectUrl }: Props = $props();

	// Cover image (aside plate). Prefer the dedicated cover; fall back to hero.
	const coverSrc = $derived(
		resolveImagePath(publication.image ?? publication.heroImage?.src, base)
	);
	const coverSrcset = $derived(buildSrcset(coverSrc));
	const coverSize = $derived(imageDimensions(coverSrc));
	const coverAlt = $derived(
		typesetQuotes(publication.heroImage?.alt ?? `Cover of ${publication.title}`)
	);

	// ── Metadata ledger rows — render only fields present in the data. ──────────
	const metadataRows = $derived.by((): MetaRow[] => {
		const rows: MetaRow[] = [];
		// Ledger values are journal / publisher / university / advisor fields —
		// prose, not identifiers — so they take the display register. The DOI row
		// passes its raw value through as the href and only the printed copy is
		// typeset (a curled apostrophe in a DOI would break the link).
		const push = (key: string, value: string | undefined | null, extra: Partial<MetaRow> = {}) => {
			if (value != null && String(value).trim() !== '') {
				rows.push({ key, value: typesetQuotes(String(value)), ...extra });
			}
		};

		push('Type', typeLabel);

		// A working paper's series plays the role a journal plays elsewhere, so it
		// leads the volume/issue rows below rather than sitting with the imprint.
		const isWorkingPaper = publication.type === 'working-paper';
		if (isWorkingPaper) {
			push('Series', publication.series);
		}

		// Journal-family fields.
		if (
			['article', 'special-issue', 'bulletin-article', 'working-paper'].includes(publication.type)
		) {
			push('Journal', publication.journal);
			push('Volume', publication.volume);
			push('Issue', publication.issue);
		}

		// Book / chapter host fields.
		if (publication.type === 'chapter') {
			push('In', publication.book);
			push(
				'Editors',
				Array.isArray(publication.editors) ? publication.editors.join(', ') : publication.editors
			);
		}
		if (publication.type === 'encyclopedia') {
			push('Encyclopedia', publication.encyclopediaTitle);
		}

		push('Publisher', publication.publisher);
		push('Place', publication.placeOfPublication);
		if (!isWorkingPaper) push('Series', publication.series);

		// Thesis fields.
		if (['masters-thesis', 'phd-dissertation'].includes(publication.type)) {
			push('University', publication.university);
			push('Department', publication.department);
			push('Advisors', (publication.advisors ?? []).join(', '));
		}

		push('Date', publication.date);
		push('Pages', String(publication.pages || publication.pageCount || ''));
		push('Language', publication.language);
		push('ISBN', publication.isbn);
		push('ISSN', publication.issn);

		if (publication.doi) {
			push('DOI', publication.doi, {
				href: `https://doi.org/${publication.doi}`,
				external: true,
				accent: true,
				icon: 'academicons:doi'
			});
		}

		push('Countries', (publication.country ?? []).join(' · '));

		if (publication.project) {
			push('Project', publication.project, {
				href: projectUrl,
				accent: true
			});
		}

		return rows;
	});

	// ── Access ─────────────────────────────────────────────────────────────────
	// The curated address first: a `url` points at the version the author chose
	// (a PDF, a repository copy). Failing that the DOI is the access route, not
	// merely an identifier — three records carry one with no `url` beside it,
	// and they used to print no access control at all.
	const accessHref = $derived(
		publication.url ?? (publication.doi ? `https://doi.org/${publication.doi}` : undefined)
	);
	const extraLinks = $derived(
		(publication.additionalUrls ?? []).filter((link) => link.url && link.label)
	);

	// ── Cite ───────────────────────────────────────────────────────────────────
	// The record page held every field of the citation and never printed the
	// citation: a peer had to reassemble it from the ledger by hand, or take the
	// BibTeX and read it. The reference is set here as real text — selectable,
	// and the fallback if the clipboard is ever denied — with the copy control
	// beside the export that was already here.
	const reference = $derived(formatReferenceText(publication, { doi: true }));

	let copyState = $state<'idle' | 'copied' | 'failed'>('idle');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	const COPY_LABELS = {
		idle: 'Copy reference',
		copied: 'Reference copied',
		failed: 'Copy failed. Select the text above.'
	} as const;

	async function copyReference() {
		copyState = (await copyText(reference)) ? 'copied' : 'failed';
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => (copyState = 'idle'), 2400);
	}

	$effect(() => () => clearTimeout(resetTimer));

	function downloadBibtex() {
		if (!publication) return;
		const bibtexString = generateBibtex(publication);
		const blob = new Blob([bibtexString], { type: 'application/x-bibtex;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${publication.id}.bib`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

{#if coverSrc}
	<figure class="rail-plate">
		<img
			class="plate"
			src={coverSrc}
			srcset={coverSrcset}
			sizes={coverSrcset ? COVER_SIZES : undefined}
			width={coverSize?.width}
			height={coverSize?.height}
			alt={coverAlt}
			loading="lazy"
			decoding="async"
		/>
		<figcaption class="plate-caption">Fig. 1. Cover.</figcaption>
	</figure>
{/if}

<RecordLedger rows={metadataRows} />

<!-- CTAs. The block is only printed when it has a control: the rail is a flex
     column with its own gap, so an empty stack reads as a stray interval. -->
{#if accessHref || extraLinks.length > 0}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- external publication links -->
	<div class="rail-cta">
		{#if accessHref}
			<a
				href={accessHref}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-accent btn-block"
			>
				Open publication<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
					(opens in new tab)</span
				>
			</a>
		{/if}
		{#each extraLinks as link (link.url)}
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
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}

<!-- ═══ CITE ═══
     The record's own citation, printed and exportable. Separated from the
     access stack above because "open it" and "cite it" are two errands, and the
     second is the one this site exists to serve. -->
<div class="cite-block">
	<h2 class="rail-label">Cite</h2>
	<p class="cite-reference">{reference}</p>
	<div class="cite-actions">
		<button
			type="button"
			onclick={copyReference}
			aria-live="polite"
			class="btn btn-outline-primary btn-block cursor-pointer"
		>
			{COPY_LABELS[copyState]}
		</button>
		<button
			type="button"
			onclick={downloadBibtex}
			class="btn btn-outline-secondary btn-block cursor-pointer"
		>
			Download BibTeX
		</button>
	</div>
</div>
