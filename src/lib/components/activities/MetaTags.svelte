<script lang="ts">
	import type { Activity } from '$lib/types/activity';
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	let { activity }: { activity: Activity } = $props();

	// Helper to generate full URLs
	const getFullUrl = (path: string | undefined): string | undefined => {
		if (!path) return undefined;
		if (path.startsWith('http://') || path.startsWith('https://')) return path;
		return `${$page.url.origin}${base}${path.startsWith('/') ? '' : '/'}${path}`;
	};

	// Helper to get citation genre for blog posts
	const getCitationGenre = (): string => {
		// For activities treated as blog posts, use 'blogPost' as the genre
		return 'blogPost';
	};

	// Helper to map activity types to Dublin Core types
	const getDcType = (): string => {
		return 'Text'; // Blog posts are text documents
	};

	// Type for meta tag objects with better type safety
	interface MetaTag {
		name: string;
		content: string;
	}

	// Helper to create conditional tags
	const createConditionalTag = (
		name: string,
		content: string | undefined,
		condition: boolean = true
	): MetaTag[] => {
		if (!content || !condition) return [];
		return [{ name, content }];
	};

	// Helper to create COinS metadata for blog posts
	const createCoinsData = (): string => {
		const params = new URLSearchParams();

		// Basic COinS parameters
		params.set('url_ver', 'Z39.88-2004');
		params.set('ctx_ver', 'Z39.88-2004');
		params.set('rfr_id', 'info:sid/frederickmadore.com');

		// Blog post format - use journal format with blog as journal
		params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal');
		params.set('rft.genre', 'article');

		// Use website name as "journal" title for blog
		params.set('rft.jtitle', 'Frédérick Madore');

		// Basic fields
		if (activity.title) params.set('rft.title', activity.title);

		// Author (always Frédérick Madore for activities)
		params.set('rft.au', 'Frédérick Madore');
		params.set('rft.aufirst', 'Frédérick');
		params.set('rft.aulast', 'Madore');

		// Date
		if (activity.dateISO) params.set('rft.date', activity.dateISO);
		else if (activity.year) params.set('rft.date', activity.year.toString());

		return params.toString();
	};

	// Main meta tags computation for blog post activities
	const metaTags = $derived.by((): MetaTag[] => {
		const tags: MetaTag[] = [];

		// Basic Highwire Press tags for blog posts
		tags.push({ name: 'citation_title', content: activity.title });

		// Blog post specific tags
		tags.push({ name: 'citation_genre', content: getCitationGenre() });

		// Author - always Frédérick Madore for activities
		tags.push(
			{ name: 'citation_author', content: 'Frédérick Madore' },
			{ name: 'DC.creator', content: 'Frédérick Madore' }
		);

		// Publication info for blog posts - try multiple approaches
		tags.push(
			{ name: 'citation_journal_title', content: 'Frédérick Madore' }, // Blog name as "journal"
			{ name: 'citation_publication_title', content: 'Frédérick Madore' }, // Alternative blog title
			{ name: 'citation_publisher', content: 'Frédérick Madore' },
			...createConditionalTag('citation_date', activity.dateISO),
			...createConditionalTag('citation_publication_date', activity.dateISO),
			...createConditionalTag('citation_online_date', activity.dateISO),
			...createConditionalTag('citation_year', activity.year?.toString()),
			{ name: 'citation_language', content: 'en' }, // Always English
			...createConditionalTag('citation_keywords', activity.tags?.join('; '))
		);

		// Abstract/Description
		tags.push(...createConditionalTag('citation_abstract', activity.description));

		// URLs
		const currentUrl = `${$page.url.origin}${$page.url.pathname}`;
		tags.push(
			{ name: 'citation_public_url', content: currentUrl },
			{ name: 'citation_abstract_html_url', content: currentUrl },
			{ name: 'citation_fulltext_html_url', content: currentUrl },
			...createConditionalTag('citation_pdf_url', getFullUrl(activity.pdfPath))
		);

		// Additional blog-specific URLs
		if (activity.url) {
			tags.push(...createConditionalTag('citation_reference_url', activity.url));
		}

		// Dublin Core tags for blog posts
		tags.push(
			{ name: 'DC.title', content: activity.title },
			{ name: 'DC.type', content: getDcType() },
			{ name: 'DC.publisher', content: 'Frédérick Madore' },
			...createConditionalTag('DC.description', activity.description),
			...createConditionalTag('DC.date', activity.dateISO),
			{ name: 'DC.identifier', content: currentUrl },
			{ name: 'DC.language', content: 'en' }
		);

		// Subject tags from activity tags
		if (activity.tags) {
			tags.push(...activity.tags.map((tag) => ({ name: 'DC.subject', content: tag })));
		}

		// Activity type as subject
		if (activity.type) {
			tags.push({ name: 'DC.subject', content: activity.type });
		}

		// Blog post specific meta tags for better detection
		tags.push(
			{ name: 'article:author', content: 'Frédérick Madore' },
			{ name: 'article:section', content: 'Academic Activities' },
			...createConditionalTag('article:published_time', activity.dateISO),
			...createConditionalTag('article:modified_time', activity.dateISO)
		);

		// Website/blog identification
		tags.push(
			{ name: 'og:site_name', content: 'Frédérick Madore' }, // This might be what Zotero uses for blog title
			{ name: 'og:type', content: 'article' },
			{ name: 'og:title', content: activity.title },
			...createConditionalTag('og:description', activity.description),
			{ name: 'og:url', content: currentUrl }
		);

		// Add image if available
		if (activity.heroImage?.src) {
			const imageUrl = getFullUrl(activity.heroImage.src);
			if (imageUrl) {
				tags.push(
					{ name: 'og:image', content: imageUrl },
					...createConditionalTag('og:image:alt', activity.heroImage.alt)
				);
			}
		}

		// Remove duplicates and empty content
		const uniqueTags = tags.filter((tag, index) => {
			const key = `${tag.name}:${tag.content}`;
			return tags.findIndex((t) => `${t.name}:${t.content}` === key) === index;
		});

		return uniqueTags.filter((tag) => tag.content && tag.content.trim() !== '');
	});

	// Development logging (can be removed in production)
	$effect(() => {
		if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
			console.log('Activity MetaTags - Activity:', activity.title);
			console.log('Activity MetaTags - Generated tags count:', metaTags.length);
			console.log('Activity MetaTags - Sample tags:', metaTags.slice(0, 5));
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
	Activity MetaTags Component
	
	This component generates comprehensive meta tags for academic activities,
	treating them as blog posts for better citation manager compatibility.
	Supports Zotero, Mendeley, and other citation tools.
	
	Features:
	- Highwire Press tags optimized for blog posts
	- Dublin Core metadata for general discoverability
	- Open Graph tags for social media sharing
	- COinS metadata for Zotero automatic detection
	- Activity-specific metadata preservation
	- Blog post genre classification
-->
