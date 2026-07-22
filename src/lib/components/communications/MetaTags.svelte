<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { type CoinsField, buildCoins, buildHeadTags, getFullUrl } from '$lib/utils/metaTags';
	import BaseMetaTags from '$lib/components/common/BaseMetaTags.svelte';
	import { website } from '$lib/data/siteConfig';

	let { communication }: { communication: Communication } = $props();

	// Resolve URLs against the canonical site origin — at prerender time
	// page.url.origin is the placeholder http://sveltekit-prerender, which must
	// never reach the baked head tags Zotero and crawlers consume.
	const resolveUrl = (path: string | undefined) => getFullUrl(website.url, base, path);

	// Helper to get presentation type for Zotero
	const getPresentationType = (): string => {
		const typeMap: Record<string, string> = {
			conference: 'Conference Paper',
			workshop: 'Workshop Presentation',
			seminar: 'Seminar',
			lecture: 'Lecture',
			panel: 'Panel Discussion',
			event: 'Presentation'
		};
		return typeMap[communication.type || 'conference'] || 'Presentation';
	};

	// Canonical page URL (see resolveUrl note above).
	const currentUrl = $derived(`${website.url}${page.url.pathname}`);

	// Language: joined list or 'en' fallback.
	const language = $derived(
		communication.language
			? Array.isArray(communication.language)
				? communication.language.join(', ')
				: communication.language
			: 'en'
	);

	// COinS field mapping — presentations use the DC format.
	const coinsFields = (): CoinsField[] => [
		['rft_val_fmt', 'info:ofi/fmt:kev:mtx:dc'],
		['rft.type', 'presentation'],
		['rft.title', communication.title],
		// Presenter (always Frédérick Madore for communications)
		['rft.creator', 'Madore, Frédérick'],
		['rft.aufirst', 'Frédérick'],
		['rft.aulast', 'Madore'],
		// Meeting/Conference info
		['rft.source', communication.conference],
		['rft.coverage', communication.location],
		['rft.date', communication.dateISO || communication.year?.toString()]
	];

	// Head tag field mapping — order here is emission order.
	const metaTags = $derived.by(() => {
		const place = `${communication.location}, ${communication.country}`;

		return buildHeadTags([
			// Basic Highwire Press tags for presentations
			{ name: 'citation_title', content: communication.title },
			{ name: 'citation_genre', content: 'presentation' },
			// Author/Presenter - always Frédérick Madore for communications
			{ name: 'citation_author', content: 'Madore, Frédérick' },
			{ name: 'citation_presenter', content: 'Madore, Frédérick' },
			{ name: 'DC.creator', content: 'Madore, Frédérick' },
			// Conference/Meeting info for presentations
			{ name: 'citation_conference_title', content: communication.conference },
			{ name: 'citation_meeting_name', content: communication.conference },
			{ name: 'citation_place', content: place },
			{ name: 'citation_presentation_type', content: getPresentationType() },
			{ name: 'citation_date', content: communication.dateISO },
			{ name: 'citation_publication_date', content: communication.dateISO },
			{ name: 'citation_year', content: communication.year?.toString() },
			{ name: 'citation_language', content: language },
			{ name: 'citation_keywords', content: communication.tags?.join('; ') },
			// Panel-specific information
			{ name: 'citation_panel_title', content: communication.panelTitle },
			// Abstract/Description
			{ name: 'citation_abstract', content: communication.abstract },
			// URLs
			{ name: 'citation_public_url', content: currentUrl },
			{ name: 'citation_abstract_html_url', content: currentUrl },
			{ name: 'citation_fulltext_html_url', content: currentUrl },
			{ name: 'citation_pdf_url', content: resolveUrl(communication.url) },
			// Additional presentation-specific URL — raw (unresolved) by
			// long-standing behaviour, unlike citation_pdf_url above.
			{ name: 'citation_presentation_url', content: communication.url },
			// Dublin Core tags for presentations
			{ name: 'DC.title', content: communication.title },
			{ name: 'DC.type', content: 'Event' },
			{ name: 'DC.publisher', content: communication.conference },
			{ name: 'DC.description', content: communication.abstract },
			{ name: 'DC.date', content: communication.dateISO },
			{ name: 'DC.coverage', content: place },
			{ name: 'DC.language', content: language },
			// Subject tags from communication tags
			(communication.tags ?? []).map((tag) => ({ name: 'DC.subject', content: tag })),
			// Open Graph tags for social media sharing
			{ name: 'og:title', content: communication.title },
			{ name: 'og:type', content: 'article' },
			{ name: 'og:url', content: currentUrl },
			{ name: 'og:description', content: communication.abstract },
			{ name: 'og:image', content: resolveUrl(communication.image) },
			{ name: 'og:site_name', content: 'Frédérick Madore' },
			// Twitter Card tags
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: communication.title },
			{ name: 'twitter:description', content: communication.abstract },
			{ name: 'twitter:image', content: resolveUrl(communication.image) }
		]);
	});
</script>

<BaseMetaTags tags={metaTags} coins={buildCoins(coinsFields())} />
