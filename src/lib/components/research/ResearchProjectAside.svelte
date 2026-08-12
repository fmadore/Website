<script module lang="ts">
	/** A call-to-action button in the aside. */
	export interface ProjectCta {
		/** Button label (rendered in mono caps). */
		label: string;
		/** Destination URL. */
		href: string;
		/** External link — opens in a new tab and appends a ↗ glyph. */
		external?: boolean;
		/** Primary CTA — solid pine fill (at most one per project). */
		primary?: boolean;
	}
</script>

<script lang="ts">
	// The apparatus rail of a research-project dossier: Fig. 1 plate, metadata
	// ledger, source-language chips and CTA buttons. Split out of
	// ResearchProjectLayout.svelte, which owns the grid placement (the
	// `.project-aside` grid cell) and derives the grant-record values.
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	interface Props {
		/** Fully-resolved plate image src. */
		plateSrc: string;
		plateAlt: string;
		plateCaption: string;
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
		ctas?: ProjectCta[];
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

	// Whether the aside has a metadata ledger worth rendering. Funding-derived
	// rows only count when they're not being deferred to the Funding panel.
	const hasLedger = $derived(
		Boolean(
			years || programme || (showFunding && (directors.length > 0 || funderLabel || grantAmount))
		) || (regions?.length ?? 0) > 0
	);

	// Ledger and chip copy in the display register: co-director names carry
	// apostrophes, funders and regions carry both ("Côte d'Ivoire").
	const displayPlateAlt = $derived(typesetQuotes(plateAlt));
	const displayPlateCaption = $derived(typesetQuotes(plateCaption));
	const displayDirectors = $derived(typesetQuotes(directors.join(' · ')));
	const displayFunder = $derived(typesetQuotes(funderLabel));
	const displayProgramme = $derived(typesetQuotes(programme));
	const displayRegions = $derived(typesetQuotes((regions ?? []).join(' · ')));
</script>

<div class="aside-inner">
	<figure class="aside-figure">
		<img
			class="plate aside-plate"
			src={plateSrc}
			alt={displayPlateAlt}
			width="380"
			height="285"
			loading="lazy"
			decoding="async"
		/>
		<figcaption class="plate-caption">{displayPlateCaption}</figcaption>
	</figure>

	{#if hasLedger}
		<dl class="stat-ledger aside-ledger">
			{#if years}
				<div class="stat-row">
					<dt>Period</dt>
					<dd class="stat-value">{years}</dd>
				</div>
			{/if}
			{#if showFunding && directors.length > 0}
				<div class="stat-row">
					<dt>{directors.length > 1 ? 'Co-directors' : 'Co-director'}</dt>
					<dd class="stat-value">{displayDirectors}</dd>
				</div>
			{/if}
			{#if showFunding && funderLabel}
				<div class="stat-row">
					<dt>Funder</dt>
					<dd class="stat-value">{displayFunder}</dd>
				</div>
			{/if}
			{#if programme}
				<div class="stat-row">
					<dt>Programme</dt>
					<dd class="stat-value">{displayProgramme}</dd>
				</div>
			{/if}
			{#if showFunding && grantAmount}
				<div class="stat-row">
					<dt>{grantCount > 1 ? 'Grants' : 'Grant'}</dt>
					<dd class="stat-value stat-value--accent">
						<span>{grantAmount}</span>
						{#if grantStatus}<span class="grant-status">· {grantStatus}</span>{/if}
					</dd>
				</div>
			{/if}
			{#if regions && regions.length > 0}
				<div class="stat-row">
					<dt>Regions</dt>
					<dd class="stat-value">{displayRegions}</dd>
				</div>
			{/if}
		</dl>
	{/if}

	{#if sourceLanguages && sourceLanguages.length > 0}
		<div class="aside-block">
			<p class="aside-block-label">Source languages</p>
			<div class="chip-row">
				{#each sourceLanguages as lang (lang)}
					<span class="chip">{typesetQuotes(lang)}</span>
				{/each}
			</div>
		</div>
	{/if}

	{#if ctas && ctas.length > 0}
		<div class="aside-ctas">
			<!-- eslint-disable svelte/no-navigation-without-resolve -- CTA hrefs are external / pre-built absolute project URLs -->
			{#each ctas as cta (cta.href)}
				<a
					class="cta"
					class:cta--primary={cta.primary}
					href={cta.href}
					target={cta.external ? '_blank' : undefined}
					rel={cta.external ? 'noopener noreferrer' : undefined}
				>
					<span>{typesetQuotes(cta.label)}</span>
					{#if cta.external}<span class="cta-glyph" aria-hidden="true">↗</span>{/if}
				</a>
			{/each}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	{/if}
</div>

<style>
	@media (--lg) {
		.aside-inner {
			position: sticky;
			top: var(--space-xl);
		}
	}

	.aside-figure {
		margin: 0 0 var(--space-lg);
	}

	.aside-plate {
		aspect-ratio: 4 / 3;
	}

	.aside-ledger {
		padding-top: var(--space-md);
		border-top: var(--rule-hairline) solid var(--color-border);
		margin: 0 0 var(--space-lg);
	}

	/* Hanging-key ledger rather than a two-sided balance: the keys hang in a
	 * fixed mono column and every value sets flush left under the one above.
	 * Right-aligned values only looked balanced while they fit on one line — a
	 * funder name or a run of grant figures wrapped into a ragged left edge. */
	.aside-ledger .stat-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-1) var(--space-md);
		padding: var(--space-2) 0;
		border-bottom: var(--rule-hairline) solid var(--color-border);
		align-items: baseline;
	}

	/* The key column only earns its keep once there is measure to spare: on a
	 * phone it would eat a third of the line, so there the key stacks above. */
	@media (--sm) {
		.aside-ledger .stat-row {
			grid-template-columns: 6.5rem minmax(0, 1fr);
		}
	}

	/* Keys in the same quiet register as the "Source languages" label below. */
	.aside-ledger dt {
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-light);
	}

	.aside-ledger dd {
		margin: 0;
	}

	/* Keep "· Awarded" whole so the separator never strands at a line end. */
	.grant-status {
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
	}

	/* Source-languages block. */
	.aside-block {
		margin: 0 0 var(--space-lg);
	}

	.aside-block-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-light);
		margin: 0 0 var(--space-sm);
	}

	/* ==========================================================================
	 * CTA BUTTONS — mono caps, square. Primary = solid pine fill.
	 * ======================================================================== */
	.aside-ctas {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.cta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width-thin) solid var(--color-border-dark);
		background: transparent;
		color: var(--color-text-emphasis);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.cta:hover {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 6%, transparent);
	}

	.cta:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.cta--primary {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-text-inverted);
	}

	.cta--primary:hover {
		background: var(--color-accent-dark);
		border-color: var(--color-accent-dark);
		color: var(--color-text-inverted);
	}

	.cta-glyph {
		flex-shrink: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.cta {
			transition: none;
		}
	}
</style>
