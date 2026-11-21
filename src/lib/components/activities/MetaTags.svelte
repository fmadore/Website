<script lang="ts">
	import type { Activity } from '#lib/types/activity.ts';
	import { page } from '$app/state';
	import {
		type CoinsField,
		buildCoins,
		buildHeadTags,
		parseAuthorName,
		toLastFirstFormat
	} from '#lib/utils/metaTags.ts';
	import BaseMetaTags from '#lib/components/common/BaseMetaTags.svelte';
	import { author, website } from '#lib/data/siteConfig.ts';

	let { activity }: { activity: Activity } = $props();

	// The site author as citation managers file a name ("Madore, Frédérick"),
	// and its parts for COinS.
	const authorCitationName = toLastFirstFormat(author.name);
	const authorNameParts = parseAuthorName(authorCitationName);

	// Canonical page URL, on the site origin: at prerender time page.url.origin
	// is the placeholder http://sveltekit-prerender, which must never reach the
	// baked head tags Zotero and crawlers consume.
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

	// Head tag field mapping — order here is emission order. No `og:*` or
	// `article:*` tags: SEO.svelte owns the social tags (the route passes it
	// the article fields and the hero image's alt text).
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
			{ name: 'DC.subject', content: activity.type }
		])
	);
</script>

<BaseMetaTags tags={metaTags} coins={buildCoins(coinsFields())} />
