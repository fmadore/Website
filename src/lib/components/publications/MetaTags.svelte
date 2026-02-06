<script lang="ts">
	import type { Publication } from '$lib/types';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import {
		type MetaTag,
		createConditionalTag,
		toLastFirstFormat,
		splitNames,
		createAuthorTags,
		getFullUrl,
		deduplicateAndFilterTags,
		parseAuthorName
	} from '$lib/utils/metaTags';

	let { publication }: { publication: Publication } = $props();

	// Helper to resolve URLs using current page context
	const resolveUrl = (path: string | undefined) => getFullUrl(page.url.origin, base, path);

	// Helper to get citation genre for OpenURL/COinS compatibility
	const getCitationGenre = (type: Publication['type']): string => {
		const genreMap: Record<Publication['type'], string> = {
			article: 'article',
			chapter: 'bookitem',
			encyclopedia: 'bookitem',
			blogpost: 'article',
			book: 'book',
			'special-issue': 'journal',
			report: 'report',
			'phd-dissertation': 'dissertation',
			'masters-thesis': 'dissertation',
			'conference-proceedings': 'proceeding',
			'bulletin-article': 'article'
		};
		return genreMap[type] || 'unknown';
	};

	// Helper to map publication types to Dublin Core types
	const getDcType = (type: Publication['type']): string => {
		const typeMap: Record<Publication['type'], string> = {
			article: 'Text',
			chapter: 'Text',
			encyclopedia: 'Text',
			blogpost: 'Text',
			book: 'Book',
			'special-issue': 'Collection',
			report: 'Text',
			'phd-dissertation': 'Text',
			'masters-thesis': 'Text',
			'conference-proceedings': 'Text',
			'bulletin-article': 'Text'
		};
		return typeMap[type] || 'Text';
	};

	// Helper to create editor tags for different publication types
	const createEditorTags = (): MetaTag[] => {
		const tags: MetaTag[] = [];

		// Handle chapters with editors
		if (publication.type === 'chapter' && publication.editors) {
			if (Array.isArray(publication.editors)) {
				tags.push(...createAuthorTags(publication.editors, 'citation_editor'));
				tags.push(...createAuthorTags(publication.editors, 'DC.creator'));
			} else if (typeof publication.editors === 'string') {
				const editorNames = splitNames(publication.editors);
				tags.push(...createAuthorTags(editorNames, 'citation_editor'));
				tags.push(...createAuthorTags(editorNames, 'DC.creator'));
			}
		}

		// Handle special issues and edited volumes
		if (
			(publication.type === 'special-issue' ||
				(publication.type === 'book' && publication.isEditedVolume)) &&
			Array.isArray(publication.authors)
		) {
			tags.push(...createAuthorTags(publication.authors, 'citation_editor'));
			tags.push(...createAuthorTags(publication.authors, 'DC.creator'));
		}

		return tags;
	};

	// Helper to create page-related tags
	const createPageTags = (): MetaTag[] => {
		const tags: MetaTag[] = [];
		const isPagedContent = publication.type === 'article' || publication.type === 'chapter';

		if (!isPagedContent || !publication.pages) return tags;

		if (publication.pages.includes('-')) {
			const [firstPage, lastPage] = publication.pages.split('-').map((p) => p.trim());
			if (firstPage) {
				tags.push({ name: 'citation_firstpage', content: firstPage });
			}
			if (lastPage) {
				tags.push({ name: 'citation_lastpage', content: lastPage });
			}
		} else if (/^\d+$/.test(publication.pages.trim())) {
			const pg = publication.pages.trim();
			tags.push(
				{ name: 'citation_firstpage', content: pg },
				{ name: 'citation_lastpage', content: pg }
			);
		}

		return tags;
	};

	// Helper to create COinS metadata
	const createCoinsData = (): string => {
		const params = new SvelteURLSearchParams();

		// Basic COinS parameters
		params.set('url_ver', 'Z39.88-2004');
		params.set('ctx_ver', 'Z39.88-2004');
		params.set('rfr_id', 'info:sid/personal-website');

		// Publication type specific format
		if (publication.type === 'article' || publication.type === 'special-issue') {
			params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal');
			params.set('rft.genre', 'article');
			if (publication.journal) params.set('rft.jtitle', publication.journal);
			if (publication.volume) params.set('rft.volume', publication.volume);
			if (publication.issue) params.set('rft.issue', publication.issue);
		} else if (publication.type === 'book') {
			params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:book');
			params.set('rft.genre', 'book');
			if (publication.publisher) params.set('rft.pub', publication.publisher);
			if (publication.placeOfPublication) params.set('rft.place', publication.placeOfPublication);
		} else if (publication.type === 'chapter') {
			params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:book');
			params.set('rft.genre', 'bookitem');
			if (publication.book) params.set('rft.btitle', publication.book);
			if (publication.publisher) params.set('rft.pub', publication.publisher);
		}

		// Common fields
		if (publication.title) params.set('rft.title', publication.title);
		if (publication.authors) {
			publication.authors.forEach((author, index) => {
				if (index === 0) {
					const { first, last } = parseAuthorName(author);
					if (first) params.set('rft.aufirst', first);
					if (last) params.set('rft.aulast', last);
				}
				params.set('rft.au', toLastFirstFormat(author));
			});
		}
		if (publication.dateISO) params.set('rft.date', publication.dateISO);
		else if (publication.year) params.set('rft.date', publication.year.toString());
		if (publication.pages) {
			params.set('rft.pages', publication.pages);
			const [start, end] = publication.pages.split('-').map((s) => s.trim());
			if (start) params.set('rft.spage', start);
			if (end) params.set('rft.epage', end);
		}
		if (publication.doi) params.set('rft_id', `info:doi/${publication.doi}`);
		if (publication.isbn) params.set('rft.isbn', publication.isbn);
		if ((publication as any).issn) params.set('rft.issn', (publication as any).issn);

		return params.toString();
	};

	// Main meta tags computation
	const metaTags = $derived.by((): MetaTag[] => {
		const tags: MetaTag[] = [];

		// Basic Highwire Press tags
		tags.push({ name: 'citation_title', content: publication.title });

		// Add citation genre for better type detection
		tags.push({ name: 'citation_genre', content: getCitationGenre(publication.type) });

		// Authors
		if (publication.authors) {
			tags.push(...createAuthorTags(publication.authors, 'citation_author'));
			tags.push(...createAuthorTags(publication.authors, 'DC.creator'));
		}

		// Editors
		tags.push(...createEditorTags());

		// Basic publication info
		tags.push(
			...createConditionalTag('citation_series_title', publication.series),
			...createConditionalTag('citation_date', publication.dateISO || publication.date),
			...createConditionalTag('citation_publication_date', publication.dateISO || publication.date),
			...createConditionalTag('citation_year', publication.year?.toString()),
			...createConditionalTag('citation_publisher', publication.publisher),
			...createConditionalTag('citation_doi', publication.doi),
			...createConditionalTag('citation_isbn', publication.isbn),
			...createConditionalTag('citation_issn', (publication as any).issn),
			...createConditionalTag('citation_eIssn', (publication as any).eIssn),
			...createConditionalTag('citation_language', publication.language),
			...createConditionalTag('citation_keywords', publication.tags?.join('; '))
		);

		// URLs
		tags.push(
			...createConditionalTag('citation_public_url', resolveUrl(publication.url)),
			...createConditionalTag(
				'citation_abstract_html_url',
				`${page.url.origin}${page.url.pathname}`
			),
			...createConditionalTag('citation_fulltext_html_url', resolveUrl(publication.url)),
			...createConditionalTag('citation_pdf_url', resolveUrl((publication as any).pdfUrl))
		);

		// Type-specific tags
		const isJournalContent = publication.type === 'article' || publication.type === 'special-issue';
		tags.push(
			...createConditionalTag('citation_journal_title', publication.journal, isJournalContent),
			...createConditionalTag('citation_volume', publication.volume, isJournalContent),
			...createConditionalTag('citation_issue', publication.issue, isJournalContent)
		);

		// Book-related tags
		tags.push(
			...createConditionalTag(
				'citation_book_title',
				publication.book,
				publication.type === 'chapter'
			),
			...createConditionalTag('citation_book_title', publication.title, publication.type === 'book')
		);

		// Page tags
		tags.push(...createPageTags());

		// Dissertation/thesis tags
		const isThesis =
			publication.type === 'phd-dissertation' || publication.type === 'masters-thesis';
		tags.push(
			...createConditionalTag('citation_dissertation_institution', publication.university, isThesis)
		);

		// Report tags
		const isReport = publication.type === 'report';
		tags.push(
			...createConditionalTag(
				'citation_technical_report_institution',
				(publication as any).institution || publication.publisher,
				isReport
			),
			...createConditionalTag(
				'citation_technical_report_number',
				(publication as any).reportNumber,
				isReport
			)
		);

		// Dublin Core tags
		tags.push(
			{ name: 'DC.title', content: publication.title },
			...createConditionalTag('DC.description', publication.abstract),
			...createConditionalTag('DC.publisher', publication.publisher),
			...createConditionalTag('DC.date', publication.dateISO || publication.date),
			{ name: 'DC.type', content: getDcType(publication.type) },
			...createConditionalTag(
				'DC.identifier',
				publication.doi ? `doi:${publication.doi}` : resolveUrl(publication.url)
			),
			...createConditionalTag('DC.language', publication.language)
		);

		// Subject tags from publication tags
		if (publication.tags) {
			tags.push(...publication.tags.map((tag) => ({ name: 'DC.subject', content: tag })));
		}

		return deduplicateAndFilterTags(tags);
	});
</script>

<svelte:head>
	{#each metaTags as tag, index (tag.name + tag.content + index)}
		<meta name={tag.name} content={tag.content} />
	{/each}
</svelte:head>

<!-- COinS metadata for Zotero compatibility -->
<span class="Z3988" title={createCoinsData()} style="display: none;"></span>
