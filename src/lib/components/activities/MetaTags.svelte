<script lang="ts">
	import { basePrefix } from '#lib/utils/paths.ts';
	import type { Activity } from '#lib/types/activity.ts';
	import { page } from '$app/state';
	import {
		type CoinsField,
		buildCoins,
		buildHeadTags,
		getFullUrl,
		parseAuthorName,
		toLastFirstFormat
	} from '#lib/utils/metaTags.ts';
	import BaseMetaTags from '#lib/components/common/BaseMetaTags.svelte';
	import { author, website } from '#lib/data/siteConfig.ts';

	let { activity }: { activity: Activity } = $props();

	// Resolve URLs against the canonical site origin — at prerender time
	// page.url.origin is the placeholder http://sveltekit-prerender, which must
	// never reach the baked head tags Zotero and crawlers consume.
	// The site author as citation managers file a name ("Madore, Frédérick"),
	// and its parts for COinS.
	const authorCitationName = toLastFirstFormat(author.name);
	const authorNameParts = parseAuthorName(authorCitationName);

	const resolveUrl = (path: string | undefined) => getFullUrl(website.url, basePrefix(), path);

	// Canonical page URL (see resolveUrl note above).
	const currentUrl = $derived(`${website.url}${page.url.pathname}`);

	// COinS field mapping — blog posts use the journal format with the site
	// name as "journal" title.
	const coinsFields = (): CoinsField[] => [
		['rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal'],
		['rft.genre', 'article'],
		['rft.jtitle', author.name],
		['rft.title', activity.title],
		// Author (always the site author for activities)
		['rft.au', authorCitationName],
		['rft.aufirst', authorNameParts.first],
		['rft.aulast', authorNameParts.last],
		['rft.date', activity.dateISO || activity.year?.toString()]
	];

	// Head tag field mapping — order here is emission order.
	const metaTags = $derived.by(() =>
		buildHeadTags([
			// No Highwire `citation_*` tags: Google Scholar and Zotero read any
			// page that carries them as a paper, and an activity post is not one
			// (every post once claimed `citation_journal_title` = the site
			// owner's name). Dublin Core and COinS describe it as what it is.
			{ name: 'DC.creator', content: authorCitationName },
			// Dublin Core tags for blog posts
			{ name: 'DC.title', content: activity.title },
			{ name: 'DC.type', content: 'Text' },
			{ name: 'DC.publisher', content: author.name },
			{ name: 'DC.description', content: activity.description },
			{ name: 'DC.date', content: activity.dateISO },
			{ name: 'DC.identifier', content: currentUrl },
			{ name: 'DC.language', content: 'en' },
			// Subject tags from activity tags, plus the activity type
			(activity.tags ?? []).map((tag) => ({ name: 'DC.subject', content: tag })),
			{ name: 'DC.subject', content: activity.type },
			// Blog post specific meta tags for better detection
			{ name: 'article:author', content: author.name },
			{ name: 'article:section', content: 'Academic Activities' },
			{ name: 'article:published_time', content: activity.dateISO },
			{ name: 'article:modified_time', content: activity.dateISO },
			// Website/blog identification
			{ name: 'og:site_name', content: author.name },
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
