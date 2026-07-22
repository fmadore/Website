<script lang="ts">
	import type { Activity } from '$lib/types/activity';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { type CoinsField, buildCoins, buildHeadTags, getFullUrl } from '$lib/utils/metaTags';
	import BaseMetaTags from '$lib/components/common/BaseMetaTags.svelte';
	import { website } from '$lib/data/siteConfig';

	let { activity }: { activity: Activity } = $props();

	// Resolve URLs against the canonical site origin — at prerender time
	// page.url.origin is the placeholder http://sveltekit-prerender, which must
	// never reach the baked head tags Zotero and crawlers consume.
	const resolveUrl = (path: string | undefined) => getFullUrl(website.url, base, path);

	// Canonical page URL (see resolveUrl note above).
	const currentUrl = $derived(`${website.url}${page.url.pathname}`);

	// COinS field mapping — blog posts use the journal format with the site
	// name as "journal" title.
	const coinsFields = (): CoinsField[] => [
		['rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal'],
		['rft.genre', 'article'],
		['rft.jtitle', 'Frédérick Madore'],
		['rft.title', activity.title],
		// Author (always Frédérick Madore for activities)
		['rft.au', 'Madore, Frédérick'],
		['rft.aufirst', 'Frédérick'],
		['rft.aulast', 'Madore'],
		['rft.date', activity.dateISO || activity.year?.toString()]
	];

	// Head tag field mapping — order here is emission order.
	const metaTags = $derived.by(() =>
		buildHeadTags([
			// Basic Highwire Press tags for blog posts
			{ name: 'citation_title', content: activity.title },
			{ name: 'citation_genre', content: 'blogPost' },
			// Author - always Frédérick Madore for activities
			{ name: 'citation_author', content: 'Madore, Frédérick' },
			{ name: 'DC.creator', content: 'Madore, Frédérick' },
			// Publication info for blog posts - try multiple approaches
			{ name: 'citation_journal_title', content: 'Frédérick Madore' },
			{ name: 'citation_publication_title', content: 'Frédérick Madore' },
			{ name: 'citation_publisher', content: 'Frédérick Madore' },
			{ name: 'citation_date', content: activity.dateISO },
			{ name: 'citation_publication_date', content: activity.dateISO },
			{ name: 'citation_online_date', content: activity.dateISO },
			{ name: 'citation_year', content: activity.year?.toString() },
			{ name: 'citation_language', content: 'en' },
			{ name: 'citation_keywords', content: activity.tags?.join('; ') },
			// Abstract/Description
			{ name: 'citation_abstract', content: activity.description },
			// URLs
			{ name: 'citation_public_url', content: currentUrl },
			{ name: 'citation_abstract_html_url', content: currentUrl },
			{ name: 'citation_fulltext_html_url', content: currentUrl },
			{ name: 'citation_pdf_url', content: resolveUrl(activity.pdfPath) },
			// Additional blog-specific URL — raw (unresolved) by long-standing
			// behaviour, unlike citation_pdf_url above.
			{ name: 'citation_reference_url', content: activity.url },
			// Dublin Core tags for blog posts
			{ name: 'DC.title', content: activity.title },
			{ name: 'DC.type', content: 'Text' },
			{ name: 'DC.publisher', content: 'Frédérick Madore' },
			{ name: 'DC.description', content: activity.description },
			{ name: 'DC.date', content: activity.dateISO },
			{ name: 'DC.identifier', content: currentUrl },
			{ name: 'DC.language', content: 'en' },
			// Subject tags from activity tags, plus the activity type
			(activity.tags ?? []).map((tag) => ({ name: 'DC.subject', content: tag })),
			{ name: 'DC.subject', content: activity.type },
			// Blog post specific meta tags for better detection
			{ name: 'article:author', content: 'Frédérick Madore' },
			{ name: 'article:section', content: 'Academic Activities' },
			{ name: 'article:published_time', content: activity.dateISO },
			{ name: 'article:modified_time', content: activity.dateISO },
			// Website/blog identification
			{ name: 'og:site_name', content: 'Frédérick Madore' },
			{ name: 'og:type', content: 'article' },
			{ name: 'og:title', content: activity.title },
			{ name: 'og:description', content: activity.description },
			{ name: 'og:url', content: currentUrl },
			// Hero image if available
			{ name: 'og:image', content: resolveUrl(activity.heroImage?.src) },
			{
				name: 'og:image:alt',
				content: activity.heroImage?.alt,
				when: Boolean(activity.heroImage?.src)
			}
		])
	);
</script>

<BaseMetaTags tags={metaTags} coins={buildCoins(coinsFields())} />
