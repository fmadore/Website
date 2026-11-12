<script lang="ts">
	import { basePrefix } from '#lib/utils/paths.ts';
	import type { Communication } from '#lib/types/communication.ts';
	import { page } from '$app/state';
	import {
		type CoinsField,
		type HeadTagEntry,
		buildCoins,
		buildHeadTags,
		getFullUrl,
		parseAuthorName,
		toLastFirstFormat
	} from '#lib/utils/metaTags.ts';
	import BaseMetaTags from '#lib/components/common/BaseMetaTags.svelte';
	import { author, website } from '#lib/data/siteConfig.ts';
	import { stripHtml } from '#lib/utils/textUtils.ts';
	import { languageCodes } from '#lib/utils/languageUtils.ts';

	let { communication }: { communication: Communication } = $props();

	// Abstracts may carry inline markup (`<i>` around transliterated terms);
	// the head tags Zotero and crawlers consume are plain text.
	const plainAbstract = $derived(
		communication.abstract ? stripHtml(communication.abstract) : communication.abstract
	);

	// Resolve URLs against the canonical site origin — at prerender time
	// page.url.origin is the placeholder http://sveltekit-prerender, which must
	// never reach the baked head tags Zotero and crawlers consume.
	// The site author as citation managers file a name ("Madore, Frédérick"),
	// and its parts for COinS.
	const authorCitationName = toLastFirstFormat(author.name);
	const authorNameParts = parseAuthorName(authorCitationName);

	const resolveUrl = (path: string | undefined) => getFullUrl(website.url, basePrefix(), path);

	// Helper to get presentation type for Zotero
	const getPresentationType = (): string => {
		const typeMap: Record<string, string> = {
			conference: 'Conference Paper',
			workshop: 'Workshop Presentation',
			seminar: 'Seminar',
			lecture: 'Lecture',
			panel: 'Panel Discussion',
			poster: 'Poster Presentation',
			event: 'Presentation'
		};
		return typeMap[communication.type || 'conference'] || 'Presentation';
	};

	// Canonical page URL (see resolveUrl note above).
	const currentUrl = $derived(`${website.url}${page.url.pathname}`);

	// BCP 47 codes, one tag per language of a bilingual talk; 'en' when unrecorded.
	const languages = $derived.by(() => {
		const codes = languageCodes(communication.language);
		return codes.length > 0 ? codes : ['en'];
	});

	/**
	 * Highwire `citation_*` tags tell Google Scholar and Zotero the page is a
	 * paper. A talk is not one, so it carries them only when it ships its own
	 * paper-like document on this site: a poster PDF. Every other talk keeps
	 * Dublin Core and COinS, which describe an event without claiming a paper.
	 * (`citation_pdf_url` once pointed at the event's website on 31 talks.)
	 */
	const posterPdfUrl = $derived(
		communication.poster ? resolveUrl(communication.poster.pdf) : undefined
	);

	// COinS field mapping — presentations use the DC format.
	const coinsFields = (): CoinsField[] => [
		['rft_val_fmt', 'info:ofi/fmt:kev:mtx:dc'],
		['rft.type', 'presentation'],
		['rft.title', communication.title],
		// Presenter (always the site author for communications)
		['rft.creator', authorCitationName],
		['rft.aufirst', authorNameParts.first],
		['rft.aulast', authorNameParts.last],
		// Meeting/Conference info
		['rft.source', communication.conference],
		['rft.coverage', communication.location],
		['rft.date', communication.dateISO || communication.year?.toString()]
	];

	const highwireEntries = (place: string): HeadTagEntry[] => {
		if (!posterPdfUrl) return [];
		return [
			{ name: 'citation_title', content: communication.title },
			{ name: 'citation_genre', content: 'presentation' },
			// Author/Presenter - always the site author for communications
			{ name: 'citation_author', content: authorCitationName },
			{ name: 'citation_presenter', content: authorCitationName },
			// Conference/Meeting info for presentations
			{ name: 'citation_conference_title', content: communication.conference },
			{ name: 'citation_meeting_name', content: communication.conference },
			{ name: 'citation_place', content: place },
			{ name: 'citation_presentation_type', content: getPresentationType() },
			{ name: 'citation_date', content: communication.dateISO },
			{ name: 'citation_publication_date', content: communication.dateISO },
			{ name: 'citation_year', content: communication.year?.toString() },
			...languages.map((code) => ({ name: 'citation_language', content: code })),
			{ name: 'citation_keywords', content: communication.tags?.join('; ') },
			{ name: 'citation_panel_title', content: communication.panelTitle },
			{ name: 'citation_abstract', content: plainAbstract },
			{ name: 'citation_public_url', content: currentUrl },
			{ name: 'citation_abstract_html_url', content: currentUrl },
			// The poster PDF, on this site — the one document Scholar can index.
			{ name: 'citation_pdf_url', content: posterPdfUrl }
		];
	};

	// Head tag field mapping — order here is emission order.
	const metaTags = $derived.by(() => {
		const place = `${communication.location}, ${communication.country}`;

		return buildHeadTags([
			// Highwire Press tags — only for a talk with its own poster PDF.
			highwireEntries(place),
			// Dublin Core tags for presentations
			{ name: 'DC.title', content: communication.title },
			{ name: 'DC.creator', content: authorCitationName },
			{ name: 'DC.type', content: 'Event' },
			{ name: 'DC.publisher', content: communication.conference },
			{ name: 'DC.description', content: plainAbstract },
			{ name: 'DC.date', content: communication.dateISO },
			{ name: 'DC.coverage', content: place },
			languages.map((code) => ({ name: 'DC.language', content: code })),
			// Subject tags from communication tags
			(communication.tags ?? []).map((tag) => ({ name: 'DC.subject', content: tag })),
			// Open Graph tags for social media sharing
			{ name: 'og:title', content: communication.title },
			{ name: 'og:type', content: 'article' },
			{ name: 'og:url', content: currentUrl },
			{ name: 'og:description', content: plainAbstract },
			{ name: 'og:image', content: resolveUrl(communication.image) },
			{ name: 'og:site_name', content: author.name },
			// Twitter Card tags
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: communication.title },
			{ name: 'twitter:description', content: plainAbstract },
			{ name: 'twitter:image', content: resolveUrl(communication.image) }
		]);
	});
</script>

<BaseMetaTags tags={metaTags} coins={buildCoins(coinsFields())} />
