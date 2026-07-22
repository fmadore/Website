<script lang="ts">
	import type { Publication } from '$lib/types';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import {
		type CoinsField,
		type HeadTagEntry,
		buildCoins,
		buildHeadTags,
		toLastFirstFormat,
		splitNames,
		createAuthorTags,
		getFullUrl,
		parseAuthorName
	} from '$lib/utils/metaTags';
	import BaseMetaTags from '$lib/components/common/BaseMetaTags.svelte';
	import { website } from '$lib/data/siteConfig';
	import { getCitationGenre, getDcType } from '$lib/utils/publicationTypeLabels';

	let { publication }: { publication: Publication } = $props();

	// Resolve URLs against the canonical site origin — at prerender time
	// page.url.origin is the placeholder http://sveltekit-prerender, which must
	// never reach the baked head tags Zotero and crawlers consume.
	const resolveUrl = (path: string | undefined) => getFullUrl(website.url, base, path);

	// Editor entries for the publication types that carry editors.
	const editorEntries = (): HeadTagEntry[] => {
		const entries: HeadTagEntry[] = [];

		// Handle chapters with editors
		if (publication.type === 'chapter' && publication.editors) {
			const editorNames = Array.isArray(publication.editors)
				? publication.editors
				: splitNames(publication.editors);
			entries.push(...createAuthorTags(editorNames, 'citation_editor'));
			entries.push(...createAuthorTags(editorNames, 'DC.creator'));
		}

		// Handle special issues and edited volumes
		if (
			(publication.type === 'special-issue' ||
				(publication.type === 'book' && publication.isEditedVolume)) &&
			Array.isArray(publication.authors)
		) {
			entries.push(...createAuthorTags(publication.authors, 'citation_editor'));
			entries.push(...createAuthorTags(publication.authors, 'DC.creator'));
		}

		return entries;
	};

	// Page-range entries — only paged content types emit first/last page.
	const pageEntries = (): HeadTagEntry[] => {
		const entries: HeadTagEntry[] = [];
		const isPagedContent =
			publication.type === 'article' ||
			publication.type === 'chapter' ||
			publication.type === 'bulletin-article';

		if (!isPagedContent || !publication.pages) return entries;

		if (publication.pages.includes('-')) {
			const [firstPage, lastPage] = publication.pages.split('-').map((p) => p.trim());
			entries.push(
				{ name: 'citation_firstpage', content: firstPage || undefined },
				{ name: 'citation_lastpage', content: lastPage || undefined }
			);
		} else if (/^\d+$/.test(publication.pages.trim())) {
			const pg = publication.pages.trim();
			entries.push(
				{ name: 'citation_firstpage', content: pg },
				{ name: 'citation_lastpage', content: pg }
			);
		}

		return entries;
	};

	// COinS field mapping. Bulletin articles (e.g. the ZMO Bulletin) are
	// journal-shaped for citation managers: same OpenURL journal format,
	// jtitle, issue, and spage (spage comes from the common pages handling
	// below).
	const coinsFields = (): CoinsField[] => {
		const fields: CoinsField[] = [];

		// Publication type specific format
		if (
			publication.type === 'article' ||
			publication.type === 'special-issue' ||
			publication.type === 'bulletin-article'
		) {
			fields.push(
				['rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal'],
				['rft.genre', 'article'],
				['rft.jtitle', publication.journal],
				['rft.volume', publication.volume],
				['rft.issue', publication.issue]
			);
		} else if (publication.type === 'book') {
			fields.push(
				['rft_val_fmt', 'info:ofi/fmt:kev:mtx:book'],
				['rft.genre', 'book'],
				['rft.pub', publication.publisher],
				['rft.place', publication.placeOfPublication]
			);
		} else if (publication.type === 'chapter') {
			fields.push(
				['rft_val_fmt', 'info:ofi/fmt:kev:mtx:book'],
				['rft.genre', 'bookitem'],
				['rft.btitle', publication.book],
				['rft.pub', publication.publisher]
			);
		}

		// Common fields
		fields.push(['rft.title', publication.title]);
		if (publication.authors?.length) {
			// First author split into aufirst/aulast; every author repeated as
			// rft.au (URLSearchParams.set semantics: last value wins, kept for
			// output stability).
			const { first, last } = parseAuthorName(publication.authors[0]);
			fields.push(['rft.aufirst', first], ['rft.aulast', last]);
			for (const author of publication.authors) {
				fields.push(['rft.au', toLastFirstFormat(author)]);
			}
		}
		fields.push(['rft.date', publication.dateISO || publication.year?.toString()]);
		if (publication.pages) {
			const [start, end] = publication.pages.split('-').map((s) => s.trim());
			fields.push(['rft.pages', publication.pages], ['rft.spage', start], ['rft.epage', end]);
		}
		fields.push(
			['rft_id', publication.doi ? `info:doi/${publication.doi}` : undefined],
			['rft.isbn', publication.isbn],
			['rft.issn', publication.issn]
		);

		return fields;
	};

	// Head tag field mapping — order here is emission order.
	const metaTags = $derived.by(() => {
		// Bulletin articles carry a journal title (e.g. the ZMO Bulletin) +
		// issue, so treat them as journal-like for the Highwire
		// citation_journal_title/volume/issue tags Zotero reads.
		const isJournalContent =
			publication.type === 'article' ||
			publication.type === 'special-issue' ||
			publication.type === 'bulletin-article';
		const isThesis =
			publication.type === 'phd-dissertation' || publication.type === 'masters-thesis';
		const isReport = publication.type === 'report';
		const extra = publication as unknown as Record<string, string | undefined>;

		return buildHeadTags([
			// Basic Highwire Press tags
			{ name: 'citation_title', content: publication.title },
			{ name: 'citation_genre', content: getCitationGenre(publication.type) },
			// Authors
			createAuthorTags(publication.authors, 'citation_author'),
			createAuthorTags(publication.authors, 'DC.creator'),
			// Editors
			editorEntries(),
			// Basic publication info
			{ name: 'citation_series_title', content: publication.series },
			{ name: 'citation_date', content: publication.dateISO || publication.date },
			{ name: 'citation_publication_date', content: publication.dateISO || publication.date },
			{ name: 'citation_year', content: publication.year?.toString() },
			{ name: 'citation_publisher', content: publication.publisher },
			{ name: 'citation_doi', content: publication.doi },
			{ name: 'citation_isbn', content: publication.isbn },
			{ name: 'citation_issn', content: publication.issn },
			// Historical no-op kept verbatim: content is always undefined, so
			// this tag never renders.
			{ name: 'citation_eIssn', content: undefined },
			{ name: 'citation_language', content: publication.language },
			{ name: 'citation_keywords', content: publication.tags?.join('; ') },
			// URLs
			{ name: 'citation_public_url', content: resolveUrl(publication.url) },
			{ name: 'citation_abstract_html_url', content: `${website.url}${page.url.pathname}` },
			{ name: 'citation_fulltext_html_url', content: resolveUrl(publication.url) },
			{ name: 'citation_pdf_url', content: resolveUrl(extra.pdfUrl) },
			// Type-specific journal tags
			{ name: 'citation_journal_title', content: publication.journal, when: isJournalContent },
			{ name: 'citation_volume', content: publication.volume, when: isJournalContent },
			{ name: 'citation_issue', content: publication.issue, when: isJournalContent },
			// Book-related tags
			{
				name: 'citation_book_title',
				content: publication.book,
				when: publication.type === 'chapter'
			},
			{
				name: 'citation_book_title',
				content: publication.title,
				when: publication.type === 'book'
			},
			// Page tags
			pageEntries(),
			// Dissertation/thesis tags
			{
				name: 'citation_dissertation_institution',
				content: publication.university,
				when: isThesis
			},
			// Report tags
			{
				name: 'citation_technical_report_institution',
				content: extra.institution || publication.publisher,
				when: isReport
			},
			{ name: 'citation_technical_report_number', content: extra.reportNumber, when: isReport },
			// Dublin Core tags
			{ name: 'DC.title', content: publication.title },
			{ name: 'DC.description', content: publication.abstract },
			{ name: 'DC.publisher', content: publication.publisher },
			{ name: 'DC.date', content: publication.dateISO || publication.date },
			{ name: 'DC.type', content: getDcType(publication.type) },
			{
				name: 'DC.identifier',
				content: publication.doi ? `doi:${publication.doi}` : resolveUrl(publication.url)
			},
			{ name: 'DC.language', content: publication.language },
			// Subject tags from publication tags
			(publication.tags ?? []).map((tag) => ({ name: 'DC.subject', content: tag }))
		]);
	});
</script>

<BaseMetaTags tags={metaTags} coins={buildCoins(coinsFields(), 'info:sid/personal-website')} />
