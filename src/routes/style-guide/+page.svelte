<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { allPublications, publicationsByYear, allTags } from '$lib/data/publications/index';
	import { allCommunications } from '$lib/data/communications/index';
	import { activitiesByDate } from '$lib/data/activities';

	const breadcrumbs = createSectionBreadcrumbs('Style Guide', '/style-guide');

	/* ===== Colour tokens — the guide reads the live values off :root, so a
	 * token edit in variables.css (or dark.css) re-documents itself here. ===== */
	const colourGroups = [
		{
			label: 'Grounds & surfaces',
			tokens: [
				'--color-background',
				'--color-surface',
				'--color-background-muted',
				'--color-surface-elevated'
			]
		},
		{
			label: 'Inks',
			tokens: ['--color-primary', '--color-text-soft', '--color-text-light']
		},
		{
			label: 'Accent — pine',
			tokens: ['--color-accent', '--color-accent-dark']
		},
		{
			label: 'Borders & hairlines',
			tokens: ['--color-border', '--color-border-light', '--color-border-dark']
		},
		{
			label: 'Functional',
			tokens: ['--color-danger', '--color-success']
		},
		{
			label: 'Visualisation palette (OKLCH, derived from ink + pine)',
			tokens: [
				'--sys-viz-1',
				'--sys-viz-2',
				'--sys-viz-3',
				'--sys-viz-4',
				'--sys-viz-5',
				'--sys-viz-6',
				'--sys-viz-7'
			]
		}
	];

	const durationTokens = [
		'--duration-instant',
		'--duration-fast',
		'--duration-normal',
		'--duration-moderate',
		'--duration-slow'
	];

	const allResolvableTokens = [...colourGroups.flatMap((g) => g.tokens), ...durationTokens];

	// Resolved values, read client-side and re-read when the theme class flips —
	// so the printed hex is always the value actually painting the swatch.
	let resolved = $state<Record<string, string>>({});

	$effect(() => {
		const read = () => {
			const styles = getComputedStyle(document.documentElement);
			const next: Record<string, string> = {};
			for (const token of allResolvableTokens) {
				next[token] = styles.getPropertyValue(token).trim();
			}
			resolved = next;
		};
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	/* ===== Type scale — forked ratios: body tier (minor third) set in
	 * Newsreader, display tier (major third) set in Archivo. ===== */
	const bodyScale = [
		'--font-size-2xs',
		'--font-size-xs',
		'--font-size-sm',
		'--font-size-base',
		'--font-size-lg'
	];
	const displayScale = [
		'--font-size-xl',
		'--font-size-2xl',
		'--font-size-3xl',
		'--font-size-4xl',
		'--font-size-5xl'
	];

	/* ===== Rules ===== */
	const ruleSpecs = [
		{ class: 'rule-nameplate', token: '--rule-nameplate · 5px', use: 'the nameplate' },
		{ class: 'rule-masthead', token: '--rule-masthead · 4px', use: 'mastheads, the footer' },
		{ class: 'rule-section', token: '--rule-section · 3px', use: 'section openings' },
		{ class: 'rule-hairline', token: '--rule-hairline · 1px', use: 'ledger rows, entry separators' }
	];

	/* ===== Real data — the only ornament this page is allowed. ===== */
	const tagCounts: Record<string, number> = {};
	for (const pub of allPublications) {
		for (const tag of pub.tags ?? []) {
			tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
		}
	}
	const topTags = Object.entries(tagCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);

	const pubYears = Object.keys(publicationsByYear)
		.map(Number)
		.sort((a, b) => a - b);
	const firstYear = pubYears[0] ?? 0;
	const lastYear = pubYears[pubYears.length - 1] ?? 0;
	const yearRange =
		pubYears.length > 0
			? Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i)
			: [];
	const yearCounts = yearRange.map((year) => publicationsByYear[year]?.length ?? 0);
	const maxYearCount = Math.max(...yearCounts);

	const stats = [
		{ label: 'Publications', value: allPublications.length, accent: true },
		{ label: 'Communications', value: allCommunications.length },
		{ label: 'Activities', value: activitiesByDate.length },
		{ label: 'Tags in the corpus', value: allTags.length },
		{ label: 'Colour tokens on this page', value: colourGroups.flatMap((g) => g.tokens).length }
	];
</script>

<SEO
	title="Style Guide | Frédérick Madore"
	description="The living style guide for the Ink + Signal design system: colour tokens, the two typographic voices, the rule hierarchy, and the ledger, chip and plate idioms — rendered from the site's live design tokens."
	keywords="style guide, design system, Ink + Signal, design tokens, typography, Frédérick Madore"
	canonical="https://www.frederickmadore.com/style-guide"
	{breadcrumbs}
	pageType="WebPage"
/>

<div class="container py-8">
	<div class="max-w-6xl mx-auto">
		<PageHeader title="Style Guide" typeBadgeText="Ink + Signal" />

		<PageIntro>
			The design system, demonstrated on itself. Every swatch, rule and specimen on this page is
			rendered from the site's live design tokens and data — the guide cannot drift from the
			implementation, because it <em>is</em> the implementation. Daylight and midnight are both first-class:
			toggle the theme to read this page as a microfilm negative.
		</PageIntro>

		<!-- ================================================================
		     § 1 · COLOUR
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 1</span>
				<h2 class="section-title">Colour — two inks on two grounds, one accent</h2>
			</div>
			<p class="guide-note">
				Grounds and ink stay warm in both themes; pine is the one cooler note and marks
				<em>the current thing</em>. Applied by weight: ground ≫ ink ≫ accent. The value printed
				under each swatch is read from the page's computed styles.
			</p>

			{#each colourGroups as group (group.label)}
				<h3 class="eyebrow eyebrow--ink guide-subhead">{group.label}</h3>
				<ul class="swatch-grid">
					{#each group.tokens as token (token)}
						<li class="swatch">
							<div class="swatch-chip" style="background: var({token})" aria-hidden="true"></div>
							<span class="swatch-token">{token}</span>
							<span class="swatch-value">{resolved[token] ?? ''}</span>
						</li>
					{/each}
				</ul>
			{/each}
		</section>

		<!-- ================================================================
		     § 2 · TYPOGRAPHY
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 2</span>
				<h2 class="section-title">Typography — two voices, strictly cast</h2>
			</div>
			<p class="guide-note">
				The document voice is what the scholar writes; the data voice is what the machine indexes.
				Every string on the site belongs to exactly one. Blurring them is the system's only
				unforgivable error: no mono headlines, no serif metadata.
			</p>

			<div class="voice-grid">
				<div class="voice-specimen">
					<h3 class="eyebrow eyebrow--ink">Archivo — display</h3>
					<p class="nameplate voice-nameplate">Ink + Signal</p>
					<p class="guide-caption">
						Nameplate, h1–h3, section heads, big data numbers. Wide, heavy cuts via the
						<span class="data-voice">wdth</span> axis — a compressed-broadsheet feel.
					</p>
				</div>

				<div class="voice-specimen">
					<h3 class="eyebrow eyebrow--ink">Newsreader — prose</h3>
					<p class="voice-serif">
						All prose, h4–h6, subtitles, captions and quotes are set in a news serif with optical
						sizing and full Latin Extended — the reading default for a working archive.
					</p>
					<p class="standfirst">And the standfirst beneath a title is its italic register.</p>
				</div>

				<div class="voice-specimen">
					<h3 class="eyebrow eyebrow--ink">Spline Sans Mono — data</h3>
					<p class="eyebrow voice-eyebrow-demo">Dossiers · 5 projects · 2013—2027</p>
					<p class="dateline">17 Jun · Conference · Berlin</p>
					<p class="guide-caption">
						Metadata only, never body copy: eyebrows, datelines, counts, nav, filters, chips, DOIs,
						pagination — anything that could be a database column.
					</p>
				</div>
			</div>

			<h3 class="eyebrow eyebrow--ink guide-subhead">Type scale — forked ratios</h3>
			<div class="scale-ladder">
				{#each bodyScale as token (token)}
					<div class="scale-row">
						<span class="scale-token">{token}</span>
						<span class="scale-sample scale-sample--serif" style="font-size: var({token})">
							The archive, read closely — minor third (1.2)
						</span>
					</div>
				{/each}
				{#each displayScale as token (token)}
					<div class="scale-row">
						<span class="scale-token">{token}</span>
						<span class="scale-sample scale-sample--display" style="font-size: var({token})">
							Signal — major third (1.25)
						</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     § 3 · RULES
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 3</span>
				<h2 class="section-title">Rules — hierarchy is drawn, not floated</h2>
			</div>
			<p class="guide-note">
				Reach for the rule system before size or colour: the page should be navigable if all type
				were one size. Rules are ink-coloured, never gray. Corners are square; shadows and glass do
				not exist — depth comes from ink density and rule weight.
			</p>

			<div class="rule-specs">
				{#each ruleSpecs as spec (spec.token)}
					<div class="rule-spec">
						<div class={spec.class}></div>
						<span class="rule-spec-label">{spec.token} — {spec.use}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ================================================================
		     § 4 · THE LEDGER
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 4</span>
				<h2 class="section-title">The ledger — the universal record</h2>
			</div>
			<p class="guide-note">
				Any dated or keyed record renders as a hanging-column ledger row, not a card: mono key left,
				serif content right, a hairline above each row.
			</p>

			<div class="ledger ledger--ruled" style="--ledger-key-w: 9rem">
				<div class="ledger-row">
					<span class="ledger-key">
						2026
						<span class="ledger-status">Specimen</span>
					</span>
					<span class="ledger-content">
						<span class="ledger-title">A two-column ledger row</span>
						<span class="ledger-desc">
							The key column carries the machine voice — a year, a term, an identifier — while the
							content column carries the document voice: a serif title and, beneath it, a
							description at reading measure.
						</span>
					</span>
				</div>
				<div class="ledger-row ledger-row--meta">
					<span class="ledger-key">
						2013—2026
						<span class="ledger-status">Idiom</span>
					</span>
					<span class="ledger-content">
						<span class="ledger-title">A three-column row adds a meta column</span>
						<span class="ledger-desc">
							Publications, CV entries, activities and facets all render this way — the same idiom,
							tuned per instance with <span class="data-voice">--ledger-key-w</span>.
						</span>
					</span>
					<span class="ledger-meta">Meta →</span>
				</div>
			</div>
		</section>

		<!-- ================================================================
		     § 5 · CHIPS, PAGINATION, BUTTONS
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 5</span>
				<h2 class="section-title">Chips, pagination &amp; buttons</h2>
			</div>
			<p class="guide-note">
				Flat, square, mono caps, count appended; selected means a solid ink fill. The counts below
				are real — the three most frequent tags in the publications corpus.
			</p>

			<h3 class="eyebrow eyebrow--ink guide-subhead">Chips</h3>
			<div class="chip-row">
				{#each topTags as [tag, count], i (tag)}
					<span class="chip" class:chip--selected={i === 0}>
						{tag}
						<span class="chip-count">{count}</span>
					</span>
				{/each}
				<span class="chip-more">All {allTags.length} tags ↓</span>
			</div>

			<h3 class="eyebrow eyebrow--ink guide-subhead">Pagination</h3>
			<div class="pager">
				<span class="pager-item pager-item--current">1</span>
				<span class="pager-item">2</span>
				<span class="pager-item">3</span>
				<span class="pager-item">Next →</span>
			</div>

			<h3 class="eyebrow eyebrow--ink guide-subhead">Buttons</h3>
			<div class="button-row">
				<Button variant="primary" label="The one primary CTA" />
				<Button variant="outline-primary" label="Outline" />
				<Button variant="ghost" label="Ghost" />
			</div>
			<p class="guide-caption">
				The accent never fills large areas except the single primary button per screen.
			</p>
		</section>

		<!-- ================================================================
		     § 6 · DATA AS ORNAMENT
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 6</span>
				<h2 class="section-title">Data as ornament</h2>
			</div>
			<p class="guide-note">
				The only decoration permitted is real data made visible. These bars are the actual
				publications-per-year distribution, {firstYear}–{lastYear}; the newest year carries the
				accent. If a flourish doesn't encode something true, it goes.
			</p>

			<div class="ornament-grid">
				<div>
					<div class="year-bars">
						{#each yearRange as year, i (year)}
							<div
								class="year-bar"
								class:year-bar--current={year === lastYear}
								style="height: {maxYearCount > 0
									? Math.max(
											((yearCounts[i] ?? 0) / maxYearCount) * 100,
											(yearCounts[i] ?? 0) > 0 ? 6 : 0
										)
									: 0}%"
								title="{year}: {yearCounts[i] ?? 0}"
							></div>
						{/each}
					</div>
					<div class="year-bars-legend">
						<span>{firstYear}</span>
						<span>{lastYear}</span>
					</div>
				</div>

				<div class="stat-ledger">
					{#each stats as stat (stat.label)}
						<div class="stat-row">
							<span>{stat.label}</span>
							<span class="stat-value" class:stat-value--accent={stat.accent}>{stat.value}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- ================================================================
		     § 7 · PLATES
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 7</span>
				<h2 class="section-title">Plates</h2>
			</div>
			<p class="guide-note">
				Photographs, covers and scans are plates: square corners, a one-pixel border, and a
				serif-italic caption below.
			</p>

			<figure class="plate-demo">
				<img
					src="{base}/images/Profile-picture.webp"
					alt="Portrait of Frédérick Madore, set as a plate"
					class="plate"
					width="280"
					height="280"
					loading="lazy"
				/>
				<figcaption class="plate-caption">
					Fig. 1 — Every image is a plate; the caption is set in the serif italic.
				</figcaption>
			</figure>
		</section>

		<!-- ================================================================
		     § 8 · SPACING & MOTION
		     ================================================================ -->
		<section class="section">
			<div class="section-head">
				<span class="section-no">§ 8</span>
				<h2 class="section-title">Spacing &amp; motion</h2>
			</div>
			<p class="guide-note">
				An 8-point rhythm carries the density scholars expect — structured information over
				whitespace. Motion is near-zero by design: instant state changes, at most a short fade on
				page enter. The register is print, not app.
			</p>

			<h3 class="eyebrow eyebrow--ink guide-subhead">Semantic spacing</h3>
			<div class="space-specs">
				{#each ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl', '--space-2xl', '--space-3xl'] as token (token)}
					<div class="space-spec">
						<span class="space-token">{token}</span>
						<div class="space-bar" style="width: var({token})"></div>
					</div>
				{/each}
			</div>

			<h3 class="eyebrow eyebrow--ink guide-subhead">Durations</h3>
			<div class="stat-ledger duration-ledger">
				{#each durationTokens as token (token)}
					<div class="stat-row">
						<span>{token}</span>
						<span class="stat-value">{resolved[token] ?? ''}</span>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	/* Section prose note — serif, reading measure, under each section head. */
	.guide-note {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		max-width: var(--text-max-width-reading);
		margin: 0 0 var(--space-lg);
	}

	.guide-caption {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-caption);
		color: var(--color-text-light);
		max-width: 55ch;
		margin: var(--space-sm) 0 0;
	}

	.guide-subhead {
		margin-top: var(--space-xl);
	}

	/* ===== Colour swatches ===== */
	.swatch-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
		gap: var(--space-md);
	}

	.swatch {
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
		min-width: 0;
	}

	.swatch-chip {
		height: var(--space-12);
		border: var(--border-width-thin) solid var(--color-border);
	}

	.swatch-token {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.02em;
		color: var(--color-text-emphasis);
		overflow-wrap: anywhere;
	}

	.swatch-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		color: var(--color-text-light);
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
		/* Reserve the line so the grid doesn't reflow when values resolve client-side. */
		min-height: 1.2em;
	}

	/* ===== Typography specimens ===== */
	.voice-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		margin-bottom: var(--space-lg);
	}

	@media (--md) {
		.voice-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-lg);
		}
	}

	.voice-specimen {
		border-top: var(--rule-hairline) solid var(--color-border);
		padding-top: var(--space-sm);
		min-width: 0;
	}

	/* Tame the nameplate specimen so it sits inside a grid column. */
	.voice-nameplate {
		font-size: var(--font-size-2xl);
	}

	.voice-serif {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		margin: 0 0 var(--space-sm);
	}

	.voice-specimen .standfirst {
		font-size: var(--font-size-base);
	}

	.voice-eyebrow-demo {
		margin-bottom: var(--space-2);
	}

	/* ===== Type scale ladder ===== */
	.scale-ladder {
		display: flex;
		flex-direction: column;
	}

	.scale-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-1) var(--space-lg);
		align-items: baseline;
		padding: var(--space-sm) 0;
		border-top: var(--rule-hairline) solid var(--color-border-light);
	}

	@media (--md) {
		.scale-row {
			grid-template-columns: 11rem 1fr;
		}
	}

	.scale-token {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.02em;
		color: var(--color-text-light);
	}

	.scale-sample--serif {
		font-family: var(--font-family-serif);
		color: var(--color-text);
		line-height: var(--line-height-snug);
	}

	.scale-sample--display {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-weight: 750;
		letter-spacing: -0.01em;
		color: var(--color-text-emphasis);
		line-height: var(--line-height-tight);
		overflow-wrap: anywhere;
	}

	/* ===== Rule specimens ===== */
	.rule-specs {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.rule-spec-label {
		display: block;
		margin-top: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.04em;
		color: var(--color-text-light);
	}

	/* ===== Buttons row ===== */
	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
	}

	/* ===== Data as ornament ===== */
	.ornament-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		align-items: end;
	}

	@media (--md) {
		.ornament-grid {
			grid-template-columns: 2fr 1fr;
			gap: var(--space-2xl);
		}
	}

	/* ===== Plate ===== */
	.plate-demo {
		margin: 0;
		max-width: 17.5rem;
	}

	.plate-demo .plate {
		aspect-ratio: 1;
	}

	/* ===== Spacing specimens ===== */
	.space-specs {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.space-spec {
		display: grid;
		grid-template-columns: 7rem auto;
		gap: var(--space-lg);
		align-items: center;
	}

	.space-token {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.02em;
		color: var(--color-text-light);
	}

	.space-bar {
		height: var(--space-2-5);
		background: var(--color-primary);
	}

	.duration-ledger {
		max-width: 20rem;
	}
</style>
