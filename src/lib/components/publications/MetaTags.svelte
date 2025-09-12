<script lang="ts">
	import type { Publication } from '$lib/types';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	let { publication }: { publication: Publication } = $props();

	// Helper to generate full URLs
	const getFullUrl = (path: string | undefined): string | undefined => {
		if (!path) return undefined;
		if (path.startsWith('http://') || path.startsWith('https://')) return path;
		return `${page.url.origin}${base}${path.startsWith('/') ? '' : '/'}${path}`;
	};

	// Helper to get citation genre for OpenURL/COinS compatibility
	const getCitationGenre = (type: Publication['type']): string => {
		const genreMap: Record<Publication['type'], string> = {
			'article': 'article',
			'chapter': 'bookitem',
			'encyclopedia': 'bookitem',
			'blogpost': 'article',
			'book': 'book',
			'special-issue': 'journal',
			'report': 'report',
			'phd-dissertation': 'dissertation',
			'masters-thesis': 'dissertation'
		};
		return genreMap[type] || 'unknown';
	};

	// Helper to map publication types to Dublin Core types
	const getDcType = (type: Publication['type']): string => {
		const typeMap: Record<Publication['type'], string> = {
			'article': 'Text',
			'chapter': 'Text',
			'encyclopedia': 'Text',
			'blogpost': 'Text',
			'book': 'Book',
			'special-issue': 'Collection',
			'report': 'Text',
			'phd-dissertation': 'Text',
			'masters-thesis': 'Text'
		};
		return typeMap[type] || 'Text';
	};

	// Type for meta tag objects with better type safety
	interface MetaTag {
		name: string;
		content: string;
	}

	// Helper to split author/editor strings into arrays
	const splitNames = (names: string): string[] => {
		return names
			.split(/,\s*|\s+and\s+/)
			.map((name) => name.trim())
			.filter(Boolean);
	};

	// Helper to create author/editor meta tags
	const createAuthorTags = (
		authors: string[] | undefined,
		tagName: string
	): MetaTag[] => {
		if (!authors) return [];
		return authors.map((author) => ({
			name: tagName,
			content: author
		}));
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
			const [firstPage, lastPage] = publication.pages.split('-').map(p => p.trim());
			if (firstPage) {
				tags.push({ name: 'citation_firstpage', content: firstPage });
			}
			if (lastPage) {
				tags.push({ name: 'citation_lastpage', content: lastPage });
			}
		} else if (/^\d+$/.test(publication.pages.trim())) {
			const page = publication.pages.trim();
			tags.push(
				{ name: 'citation_firstpage', content: page },
				{ name: 'citation_lastpage', content: page }
			);
		}
		
		return tags;
	};

	// Helper to create conditional tags
	const createConditionalTag = (
		name: string,
		content: string | undefined,
		condition: boolean = true
	): MetaTag[] => {
		if (!content || !condition) return [];
		return [{ name, content }];
	};

	// Helper to create COinS metadata
	const createCoinsData = (): string => {
		const params = new URLSearchParams();
		
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
					const [last, first] = author.split(',').map(s => s.trim());
					if (first) params.set('rft.aufirst', first);
					if (last) params.set('rft.aulast', last);
				}
				params.set('rft.au', author);
			});
		}
		if (publication.dateISO) params.set('rft.date', publication.dateISO);
		else if (publication.year) params.set('rft.date', publication.year.toString());
		if (publication.pages) {
			params.set('rft.pages', publication.pages);
			const [start, end] = publication.pages.split('-').map(s => s.trim());
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
			...createConditionalTag('citation_public_url', getFullUrl(publication.url)),
			...createConditionalTag('citation_abstract_html_url', `${page.url.origin}${page.url.pathname}`),
			...createConditionalTag('citation_fulltext_html_url', getFullUrl(publication.url)),
			...createConditionalTag('citation_pdf_url', getFullUrl((publication as any).pdfUrl))
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
			...createConditionalTag('citation_book_title', publication.book, publication.type === 'chapter'),
			...createConditionalTag('citation_book_title', publication.title, publication.type === 'book')
		);
		
		// Page tags
		tags.push(...createPageTags());
		
		// Dissertation/thesis tags
		const isThesis = publication.type === 'phd-dissertation' || publication.type === 'masters-thesis';
		tags.push(
			...createConditionalTag('citation_dissertation_institution', publication.university, isThesis)
		);
		
		// Report tags
		const isReport = publication.type === 'report';
		tags.push(
			...createConditionalTag('citation_technical_report_institution', 
				(publication as any).institution || publication.publisher, isReport),
			...createConditionalTag('citation_technical_report_number', 
				(publication as any).reportNumber, isReport)
		);
		
		// Dublin Core tags
		tags.push(
			{ name: 'DC.title', content: publication.title },
			...createConditionalTag('DC.description', publication.abstract),
			...createConditionalTag('DC.publisher', publication.publisher),
			...createConditionalTag('DC.date', publication.dateISO || publication.date),
			{ name: 'DC.type', content: getDcType(publication.type) },
			...createConditionalTag('DC.identifier', 
				publication.doi ? `doi:${publication.doi}` : getFullUrl(publication.url)),
			...createConditionalTag('DC.language', publication.language)
		);
		
		// Subject tags from publication tags
		if (publication.tags) {
			tags.push(...publication.tags.map(tag => ({ name: 'DC.subject', content: tag })));
		}
		
		// Remove duplicates before returning (defensive programming)
		const uniqueTags = tags.filter((tag, index) => {
			const key = `${tag.name}:${tag.content}`;
			return tags.findIndex(t => `${t.name}:${t.content}` === key) === index;
		});
		
		return uniqueTags.filter(tag => tag.content && tag.content.trim() !== '');
	});

	// Development logging (can be removed in production)
	$effect(() => {
		if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
			console.log('MetaTags - Publication:', publication.title);
			console.log('MetaTags - Generated tags count:', metaTags.length);
		}
	});
</script>

<svelte:head>
	{#each metaTags as tag, index (tag.name + tag.content + index)}
		<meta name={tag.name} content={tag.content} />
	{/each}
</svelte:head>

<!-- COinS metadata for Zotero compatibility -->
<span class="Z3988" title={createCoinsData()} style="display: none;"></span>

<!-- 
	MetaTags Component
	
	This component generates comprehensive meta tags for academic publications,
	supporting both Highwire Press and Dublin Core standards for better
	discoverability and citation management tool compatibility.
	
	Features:
	- Highwire Press tags for citation managers (Zotero, Mendeley, etc.)
	- Dublin Core metadata for general discoverability
	- Type-specific tags for different publication types
	- Proper URL generation and validation
	- Clean, maintainable code structure
-->
