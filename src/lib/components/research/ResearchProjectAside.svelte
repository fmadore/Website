<script lang="ts">
	// The apparatus rail of a research-project dossier: the Fig. 1 plate, the
	// project's catalogue entry, its source-language chips and its actions.
	//
	// Built entirely from the shared rail idioms — `.rail-plate` / `.plate` /
	// `.plate-caption`, <RecordLedger> over `.meta-ledger`, `.rail-label` +
	// `.chip-row`, and `.rail-cta` + `.btn` — so this rail and the ones on
	// /publications/[id] and /communications/[id] cannot drift apart again. It
	// previously re-implemented all four under `aside-*` names, which is how it
	// came to draw its ledger with a 6.5rem key at one size step and its buttons
	// with a hand-rolled border while the record rails used the system's.
	//
	// <ResearchProjectLayout> owns the grid placement (RecordLayout's
	// `railPrimary` slot) and derives every value below from the grant record.
	import RecordLedger, { type MetaRow } from '$lib/components/molecules/RecordLedger.svelte';
	import type { ProjectCtaLink } from '$lib/types/research';
	import { buildSrcset } from '$lib/utils/imageVariants';
	import { formatProjectPeriod } from '$lib/utils/projectPeriod';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { plateFallback } from '$lib/actions/plateFallback';

	// The rail is 380px wide from --lg up; below that the plate spans the single
	// column. Same contract as the record rails.
	const PLATE_SIZES = '(max-width: 1024px) 100vw, 380px';

	interface Props {
		/** Fully-resolved plate image src. */
		plateSrc: string;
		plateAlt: string;
		/**
		 * The authored caption for the plate, without the `Fig. 1.` stamp.
		 * Omitted when the record carries none: the plate then prints no caption
		 * at all rather than restating the headline, which is what the old
		 * `Fig. 1. {imageAlt}` fallback did on four of the six projects.
		 */
		plateCaption?: string;
		years?: string;
		/** Co-directors / co-investigators (already resolved from props/grant). */
		directors?: string[];
		funderLabel?: string;
		programme?: string;
		/** Formatted grant figure(s) (e.g., "€317,690", "€53,670 + €60,410"). */
		grantAmount?: string;
		grantStatus?: string;
		/** How many awards the figure covers — pluralises the ledger key. */
		grantCount?: number;
		regions?: string[];
		sourceLanguages?: string[];
		ctas?: ProjectCtaLink[];
		/** When false, the funder / co-director / grant rows are omitted. */
		showFunding?: boolean;
	}

	let {
		plateSrc,
		plateAlt,
		plateCaption,
		years,
		directors = [],
		funderLabel,
		programme,
		grantAmount,
		grantStatus,
		grantCount = 1,
		regions,
		sourceLanguages,
		ctas,
		showFunding = true
	}: Props = $props();

	const plateSrcset = $derived(buildSrcset(plateSrc));
	const displayPlateAlt = $derived(typesetQuotes(plateAlt));

	// Plate caption — "Fig. 1." is the figure's number, so the stop belongs to it
	// and the caption follows as its own sentence. Same form as the publication,
	// communication and activity rails; this one printed `Fig. 1 — ` and was the
	// only plate on the site punctuated differently. Authored captions that
	// already end in punctuation keep theirs rather than collecting a second
	// full stop.
	const plateFigCaption = $derived.by(() => {
		const caption = typesetQuotes(plateCaption);
		if (!caption) return undefined;
		return `Fig. 1. ${caption}${/[.!?…]$/.test(caption.trim()) ? '' : '.'}`;
	});

	/**
	 * The project's catalogue entry. Every value is a string a database could
	 * hold — a period, a funder, a programme, a figure, a list of regions — so
	 * the block is a meta-ledger rather than a ledger, exactly as on a
	 * bibliographic record. Rows render only when their value exists.
	 *
	 * The grant figure is deliberately NOT accented: in this idiom pine marks
	 * the row that leaves the record (a DOI, a live project page), and the one
	 * accent in this rail is the project's own primary destination below.
	 */
	const metadataRows = $derived.by((): MetaRow[] => {
		const rows: MetaRow[] = [];
		const push = (key: string, value: string | undefined) => {
			if (value != null && value.trim() !== '') {
				rows.push({ key, value: typesetQuotes(value) });
			}
		};

		push('Period', years ? formatProjectPeriod(years) : undefined);
		if (showFunding && directors.length > 0) {
			push(directors.length > 1 ? 'Co-directors' : 'Co-director', directors.join(' · '));
		}
		if (showFunding) push('Funder', funderLabel);
		push('Programme', programme);
		if (showFunding && grantAmount) {
			push(
				grantCount > 1 ? 'Grants' : 'Grant',
				grantStatus ? `${grantAmount} · ${grantStatus}` : grantAmount
			);
		}
		if (regions && regions.length > 0) push('Regions', regions.join(' · '));

		return rows;
	});
</script>

{#if plateSrc}
	<figure class="rail-plate">
		<img
			class="plate project-plate"
			src={plateSrc}
			srcset={plateSrcset}
			sizes={plateSrcset ? PLATE_SIZES : undefined}
			width="380"
			height="285"
			alt={displayPlateAlt}
			loading="lazy"
			decoding="async"
			use:plateFallback
		/>
		{#if plateFigCaption}
			<figcaption class="plate-caption">{plateFigCaption}</figcaption>
		{/if}
	</figure>
{/if}

<RecordLedger rows={metadataRows} label="Project" />

{#if sourceLanguages && sourceLanguages.length > 0}
	<div>
		<h2 class="rail-label">Source languages</h2>
		<div class="chip-row">
			{#each sourceLanguages as lang (lang)}
				<span class="chip">{typesetQuotes(lang)}</span>
			{/each}
		</div>
	</div>
{/if}

{#if ctas && ctas.length > 0}
	<!-- The one pine fill is the project's own destination; every mirror below it
	     is an outline (Scarcity Rule). -->
	<div class="rail-cta">
		<!-- eslint-disable svelte/no-navigation-without-resolve -- CTA hrefs are external / pre-built absolute project URLs -->
		{#each ctas as cta (cta.href)}
			<a
				class="btn btn-block {cta.primary ? 'btn-accent' : 'btn-outline-secondary'}"
				href={cta.href}
				target={cta.external ? '_blank' : undefined}
				rel={cta.external ? 'noopener noreferrer' : undefined}
			>
				{typesetQuotes(cta.label)}{cta.external ? ' ↗' : ''}
			</a>
		{/each}
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/if}

<style>
	/* The research plates are variously shaped (16:9, 4:3, square, 2:1) and the
	 * records carry no per-image dimensions, so the rail crops them all to one
	 * ratio rather than letting the rail's height jump between projects. */
	.project-plate {
		aspect-ratio: 4 / 3;
		height: auto;
	}
</style>
