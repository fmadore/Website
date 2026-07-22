<!--
PublicationAside - The metadata rail of a publication detail page

The right-hand apparatus column of /publications/[id]: cover plate, metadata
ledger ("Record"), tag chips, frequency-scaled key terms, and the CTA stack
(access / additional links / BibTeX export). Mirrors the ResearchProjectAside
precedent: the page supplies the record (`publication`) plus the two labels it
already computes (`typeLabel`, `projectUrl`); everything else — ledger rows,
key-term sizing, BibTeX download — is assembled here.
-->
<script lang="ts">
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import { getAnalysis, hasAnalysis } from '$lib/data/analysis';
	import { generateBibtex } from '$lib/utils/bibtexGenerator';

	interface Props {
		publication: Publication;
		/** Human-readable type badge (e.g. 'Journal Article'). */
		typeLabel: string;
		/** Internal research-project URL for the Project ledger row, when mapped. */
		projectUrl?: string;
	}

	let { publication, typeLabel, projectUrl }: Props = $props();

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

<!-- ═══ ASIDE — THE METADATA ═══ -->
<aside class="pub-aside">
	{#if coverSrc}
		<figure class="pub-cover">
			<img class="plate pub-cover-img" src="{base}/{coverSrc}" alt={coverAlt} loading="lazy" />
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

<style>
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
		.pub-meta-link {
			transition: none;
		}
	}
</style>
