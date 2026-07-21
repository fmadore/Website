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
		/** Formatted grant figure (e.g., "€317,690"). */
		grantAmount?: string;
		grantStatus?: string;
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
</script>

<div class="aside-inner">
	<figure class="aside-figure">
		<img
			class="plate aside-plate"
			src={plateSrc}
			alt={plateAlt}
			width="380"
			height="285"
			loading="lazy"
			decoding="async"
		/>
		<figcaption class="plate-caption">{plateCaption}</figcaption>
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
					<dd class="stat-value">{directors.join(' · ')}</dd>
				</div>
			{/if}
			{#if showFunding && funderLabel}
				<div class="stat-row">
					<dt>Funder</dt>
					<dd class="stat-value">{funderLabel}</dd>
				</div>
			{/if}
			{#if programme}
				<div class="stat-row">
					<dt>Programme</dt>
					<dd class="stat-value">{programme}</dd>
				</div>
			{/if}
			{#if showFunding && grantAmount}
				<div class="stat-row">
					<dt>Grant</dt>
					<dd class="stat-value stat-value--accent">
						{grantAmount}{#if grantStatus}
							<span class="grant-status"> · {grantStatus}</span>{/if}
					</dd>
				</div>
			{/if}
			{#if regions && regions.length > 0}
				<div class="stat-row">
					<dt>Regions</dt>
					<dd class="stat-value">{regions.join(' · ')}</dd>
				</div>
			{/if}
		</dl>
	{/if}

	{#if sourceLanguages && sourceLanguages.length > 0}
		<div class="aside-block">
			<p class="aside-block-label">Source languages</p>
			<div class="chip-row">
				{#each sourceLanguages as lang (lang)}
					<span class="chip">{lang}</span>
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
					<span>{cta.label}</span>
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

	.aside-ledger .stat-row {
		gap: var(--space-md);
		padding: var(--space-2) 0;
		border-bottom: var(--rule-hairline) solid var(--color-border);
		align-items: baseline;
	}

	.aside-ledger dt {
		flex-shrink: 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	.aside-ledger dd {
		margin: 0;
		text-align: right;
	}

	.grant-status {
		font-weight: var(--font-weight-semibold);
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
