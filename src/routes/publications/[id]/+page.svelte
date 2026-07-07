<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import type { ComponentType } from 'svelte';
	import type { PageData } from './$types';
	import MetaTags from '$lib/components/publications/MetaTags.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	import CitedBy from '$lib/components/publications/CitedBy.svelte';
	import Reviews from '$lib/components/publications/Reviews.svelte';
	import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
	import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
	import { allPublications } from '$lib/data/publications/index';
	import { getAnalysis, hasAnalysis } from '$lib/data/analysis';
	import { generateBibtex } from '$lib/utils/bibtexGenerator';
	import {
		createPublicationSEODescription,
		createPublicationSEOKeywords,
		truncateTitle
	} from '$lib/utils/seoUtils';
	import { getPublicationTypeBadge } from '$lib/utils/typeUtils';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let publication = $derived(data.publication as Publication);
	let jsonLdString = $derived(data.jsonLdString);

	// Generate optimized SEO content
	const seoDescription = $derived(createPublicationSEODescription(publication));
	const seoKeywords = $derived(createPublicationSEOKeywords(publication));

	// Define breadcrumb items (used for JSON-LD structured data)
	let breadcrumbItems = $derived([
		{ label: 'Publications', href: `${base}/publications` },
		{ label: truncateTitle(publication.title), href: `${base}/publications/${publication.id}` }
	]);

	// JSON-LD injection using reusable utilities
	useBreadcrumbJsonLd(() => breadcrumbItems);
	useJsonLdScript('publication-json-ld', () => jsonLdString);

	const typeLabel = $derived(getPublicationTypeBadge(publication.type));

	// Open-access marker: any publication that exposes a DOI/URL we can send the
	// reader to is treated as freely accessible here (the site only lists the
	// author's own open work). Shown as the third eyebrow token when present.
	const isOpenAccess = $derived(Boolean(publication.doi || publication.url));

	// Project URL mappings — internal research pages.
	let projectMappings = $derived<Record<string, string>>({
		'Religious Activism on Campuses in Togo and Benin': `${base}/research/religious-activism-campuses-togo-benin`,
		"Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso": `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`,
		'Muslim Minorities in Southern Cities of Benin and Togo': `${base}/research/muslim-minorities-southern-cities-benin-togo`,
		'Digital Humanities and AI in African Studies': `${base}/research/dh-ai-african-studies`
	});
	const projectUrl = $derived(
		publication.project ? projectMappings[publication.project] : undefined
	);

	// Byline — "by A, B and C".
	function formatNameList(names: string[] | undefined): string {
		if (!names || names.length === 0) return '';
		if (names.length === 1) return names[0];
		if (names.length === 2) return `${names[0]} and ${names[1]}`;
		return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
	}
	const byline = $derived(formatNameList(publication.authors));

	// Abstract → paragraphs (mirrors AbstractSection's splitter).
	const abstractParagraphs = $derived(
		(publication.abstract ?? '')
			.split(/\n\s*\n|\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
	);

	// Table of contents — only for edited volumes / special issues that carry it.
	const tocEntries = $derived(
		(publication.type === 'book' || publication.type === 'special-issue') &&
			publication.tableOfContents &&
			publication.tableOfContents.length > 0
			? publication.tableOfContents
			: []
	);

	const reviews = $derived(publication.reviewedBy ?? []);
	const citedBy = $derived(publication.citedBy ?? []);

	// Related publications in the same project (excluding the current one).
	const relatedInProject = $derived(
		publication.project
			? allPublications.filter((p) => p.id !== publication.id && p.project === publication.project)
			: []
	);

	// KEY TERMS — real full-text frequencies, sized by rank. Only shown when a
	// text analysis exists for this publication (data as ornament, never faked).
	const keyTerms = $derived.by(() => {
		if (!hasAnalysis(publication.id)) return [];
		const freqs = getAnalysis(publication.id)?.frequencies ?? [];
		const top = freqs.slice(0, 28);
		if (top.length === 0) return [];
		const max = top[0].count;
		const min = top[top.length - 1].count;
		const span = Math.max(1, max - min);
		// Map raw count → a serif size between ~13px and ~30px.
		return top.map((f) => ({
			word: f.word,
			size: 13 + ((f.count - min) / span) * 17
		}));
	});

	// Cover image (aside plate). Prefer the dedicated cover; fall back to hero.
	const coverSrc = $derived(publication.image ?? publication.heroImage?.src);
	const coverAlt = $derived(publication.heroImage?.alt ?? `Cover of ${publication.title}`);

	// ── Metadata ledger rows — render only fields present in the data. ──────────
	type MetaRow = {
		key: string;
		value: string;
		href?: string;
		external?: boolean;
		accent?: boolean;
	};

	const metadataRows = $derived.by((): MetaRow[] => {
		const rows: MetaRow[] = [];
		const push = (key: string, value: string | undefined | null, extra: Partial<MetaRow> = {}) => {
			if (value != null && String(value).trim() !== '') {
				rows.push({ key, value: String(value), ...extra });
			}
		};

		push('Type', typeLabel);

		// Journal-family fields.
		if (['article', 'special-issue', 'bulletin-article'].includes(publication.type)) {
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
		push('Series', publication.series);

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
				accent: true
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

	const tags = $derived(publication.tags?.filter(Boolean) ?? []);

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

<SEO
	title={truncateTitle(publication.title) + ' | Frédérick Madore'}
	description={seoDescription}
	keywords={seoKeywords}
	ogImage={publication.image ? `${base}/${publication.image}` : undefined}
	includeCitationAuthor={false}
/>

<MetaTags {publication} />

<div class="container py-8 page-enter">
	<div class="pub-shell">
		<!-- Breadcrumb — mono, muted. -->
		<nav class="pub-breadcrumb" aria-label="Breadcrumb">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed path -->
			<a href="{base}/publications" class="pub-breadcrumb-link">← Publications</a>
			<span class="pub-breadcrumb-sep" aria-hidden="true">/</span>
			<span class="pub-breadcrumb-current">{typeLabel}</span>
		</nav>

		<div class="pub-grid">
			<!-- ═══ MAIN COLUMN ═══ -->
			<article class="pub-main">
				<header class="pub-header">
					<p class="eyebrow pub-eyebrow">
						<span>{typeLabel}</span>
						<span class="pub-eyebrow-sep" aria-hidden="true">·</span>
						<span>{publication.date}</span>
						{#if isOpenAccess}
							<span class="pub-eyebrow-sep" aria-hidden="true">·</span>
							<span>Open Access</span>
						{/if}
					</p>

					<h1 class="pub-title">{publication.title}</h1>

					{#if byline}
						<p class="pub-byline">
							{#if publication.prefacedBy}by {byline}. Preface by {publication.prefacedBy}{:else}by
								{byline}{/if}
						</p>
					{/if}
				</header>

				<!-- Abstract -->
				{#if abstractParagraphs.length > 0}
					<section class="section pub-section scroll-reveal" aria-labelledby="pub-abstract-head">
						<div class="section-head">
							<h2 id="pub-abstract-head" class="section-title">Abstract</h2>
						</div>
						<div class="pub-abstract">
							{#each abstractParagraphs as paragraph, index (index)}
								<p class="pub-abstract-p" class:drop-cap={index === 0}>{paragraph}</p>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Table of contents -->
				{#if tocEntries.length > 0}
					<section class="section pub-section scroll-reveal" aria-labelledby="pub-toc-head">
						<div class="section-head">
							<h2 id="pub-toc-head" class="section-title">Table of Contents</h2>
						</div>
						<ol class="pub-toc">
							{#each tocEntries as item, index (index)}
								<li class="pub-toc-item">
									<span class="pub-toc-no">{String(index + 1).padStart(2, '0')}</span>
									{#if typeof item === 'string'}
										<span class="pub-toc-title">{item}</span>
									{:else}
										<span class="pub-toc-title">
											{item.title}
											{#if item.authors && item.authors.length > 0}
												<span class="pub-toc-authors">{formatNameList(item.authors)}</span>
											{/if}
										</span>
									{/if}
								</li>
							{/each}
						</ol>
					</section>
				{/if}

				<!-- Reviews -->
				<Reviews reviewedBy={reviews} />

				<!-- Cited by -->
				<CitedBy {citedBy} />

				<!-- More in this project -->
				{#if relatedInProject.length > 0}
					<div class="pub-section">
						<RelatedItemsList
							allItems={allPublications}
							currentItemId={publication.id}
							filterKey="project"
							filterValue={publication.project}
							title="More in this Project"
							itemComponent={RelatedItemCard as unknown as ComponentType}
							baseItemUrl="/publications/"
							viewAllUrl="{base}/publications"
							maxItems={3}
							sectionClass="pub-related section"
							titleClass="pub-related-title section-title"
						/>
					</div>
				{/if}
			</article>

			<!-- ═══ ASIDE — THE METADATA ═══ -->
			<aside class="pub-aside">
				{#if coverSrc}
					<figure class="pub-cover">
						<img
							class="plate pub-cover-img"
							src="{base}/{coverSrc}"
							alt={coverAlt}
							loading="lazy"
						/>
						<figcaption class="plate-caption">Fig. 1 — cover.</figcaption>
					</figure>
				{/if}

				<!-- Metadata ledger — mono key/value hairline rows. -->
				<div class="pub-meta">
					<h2 class="pub-aside-label">Record</h2>
					<dl class="pub-meta-ledger">
						{#each metadataRows as row (row.key)}
							<div class="pub-meta-row">
								<dt class="pub-meta-key">{row.key}</dt>
								<dd class="pub-meta-value" class:pub-meta-value--accent={row.accent}>
									{#if row.href && row.external}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
										<a href={row.href} target="_blank" rel="noopener" class="pub-meta-link"
											>{row.value} ↗</a
										>
									{:else if row.href}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed internal path -->
										<a href={row.href} class="pub-meta-link">{row.value} →</a>
									{:else}
										{row.value}
									{/if}
								</dd>
							</div>
						{/each}
					</dl>
				</div>

				<!-- Tags -->
				{#if tags.length > 0}
					<div class="pub-tags">
						<h2 class="pub-aside-label">Tags</h2>
						<div class="chip-row">
							{#each tags as tag (tag)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- tag search URL -->
								<a class="chip" href="{base}/publications?tag={encodeURIComponent(tag)}">{tag}</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Key terms — real full-text frequencies, sized by rank. -->
				{#if keyTerms.length > 0}
					<div class="pub-key-terms">
						<h2 class="pub-aside-label">Key Terms</h2>
						<div class="key-terms">
							{#each keyTerms as term (term.word)}
								<span style="font-size: {term.size.toFixed(1)}px;">{term.word}</span>
							{/each}
						</div>
						<p class="pub-key-terms-note">Most frequent terms from the full text</p>
					</div>
				{/if}

				<!-- CTAs -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -- external publication links -->
				<div class="pub-cta">
					{#if publication.url}
						<a
							href={publication.url}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-accent btn-block"
						>
							Access Publication ↗
						</a>
					{/if}
					{#if publication.additionalUrls}
						{#each publication.additionalUrls.filter((l) => l.url && l.label) as link (link.url)}
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-outline-secondary btn-block"
							>
								{link.label} ↗
							</a>
						{/each}
					{/if}
					<button onclick={downloadBibtex} class="btn btn-outline-primary btn-block cursor-pointer">
						Export BibTeX
					</button>
				</div>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</aside>
		</div>
	</div>
</div>

<style>
	/* Shell caps the whole record at a comfortable reading width. */
	.pub-shell {
		max-width: var(--container-lg);
		margin: 0 auto;
	}

	/* ── Breadcrumb ────────────────────────────────────────────────────────── */
	.pub-breadcrumb {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-xl);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.pub-breadcrumb-link {
		color: var(--color-text-light);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.pub-breadcrumb-link:hover {
		color: var(--color-accent);
	}

	.pub-breadcrumb-sep {
		color: var(--color-text-muted);
	}

	.pub-breadcrumb-current {
		color: var(--color-text-muted);
	}

	/* ── Two-column grid: main + 380px metadata rail ──────────────────────── */
	.pub-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
	}

	@media (--lg) {
		.pub-grid {
			grid-template-columns: minmax(0, 1fr) 380px;
			gap: var(--space-3xl);
			align-items: start;
		}
	}

	.pub-main {
		min-width: 0;
	}

	/* Consistent rhythm between the numbered sections. */
	.pub-section {
		margin-top: var(--space-2xl);
	}

	/* ── Header ────────────────────────────────────────────────────────────── */
	.pub-header {
		margin-bottom: var(--space-xl);
	}

	.pub-eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2);
		margin-bottom: var(--space-sm);
	}

	.pub-eyebrow-sep {
		color: var(--color-text-muted);
	}

	.pub-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-size: var(--font-size-4xl);
		font-weight: 820;
		letter-spacing: -0.015em;
		line-height: 1.02;
		color: var(--color-text-emphasis);
		margin: 0;
		text-wrap: balance;
	}

	/* Byline — the document voice, serif italic. */
	.pub-byline {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-xl);
		line-height: var(--line-height-normal);
		color: var(--color-text-soft);
		margin: var(--space-md) 0 0;
		max-width: 52ch;
	}

	/* ── Abstract ──────────────────────────────────────────────────────────── */
	.pub-abstract {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: 68ch;
	}

	.pub-abstract-p {
		margin: 0;
	}

	.pub-abstract-p + .pub-abstract-p {
		margin-top: var(--space-md);
	}

	/* ── Table of contents — two columns of ledger rows ───────────────────── */
	.pub-toc {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	@media (--sm) {
		.pub-toc {
			column-count: 2;
			column-gap: var(--space-2xl);
		}
	}

	.pub-toc-item {
		display: grid;
		grid-template-columns: 2.25rem 1fr;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm) 0;
		border-top: var(--rule-hairline) solid var(--color-border);
		break-inside: avoid;
	}

	.pub-toc-no {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.08em;
		color: var(--color-accent);
		line-height: var(--line-height-snug);
	}

	.pub-toc-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
		color: var(--color-text);
	}

	.pub-toc-authors {
		display: block;
		margin-top: var(--space-1);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	/* ── Aside ─────────────────────────────────────────────────────────────── */
	.pub-aside {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		min-width: 0;
	}

	@media (--lg) {
		.pub-aside {
			position: sticky;
			top: var(--space-xl);
		}
	}

	/* Section labels inside the rail — data voice over a hairline. */
	.pub-aside-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm);
		padding-bottom: var(--space-2);
		border-bottom: var(--rule-hairline) solid var(--color-border);
	}

	/* Cover plate. */
	.pub-cover {
		margin: 0;
	}

	.pub-cover-img {
		width: 100%;
		height: auto;
	}

	/* Metadata ledger — hanging mono key against a mono value, hairline rows. */
	.pub-meta-ledger {
		margin: 0;
	}

	.pub-meta-row {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	.pub-meta-row:last-child {
		border-bottom: var(--rule-hairline) solid var(--color-border);
	}

	.pub-meta-key {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-light);
		line-height: var(--line-height-snug);
	}

	.pub-meta-value {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.02em;
		line-height: var(--line-height-snug);
		color: var(--color-text-emphasis);
		margin: 0;
		font-variant-numeric: tabular-nums;
		word-break: break-word;
	}

	.pub-meta-value--accent {
		color: var(--color-accent);
	}

	.pub-meta-link {
		color: inherit;
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.pub-meta-link:hover {
		text-decoration: underline;
	}

	.pub-meta-value:not(.pub-meta-value--accent) .pub-meta-link:hover {
		color: var(--color-accent);
	}

	.pub-meta-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
	}

	/* Key-terms note. */
	.pub-key-terms-note {
		margin: var(--space-sm) 0 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* CTAs — stacked, full-width. Accent fill leads, outline follows. */
	.pub-cta {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@media (prefers-reduced-motion: reduce) {
		.pub-breadcrumb-link,
		.pub-meta-link {
			transition: none;
		}
	}
</style>
