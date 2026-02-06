<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import {
		type MetaTag,
		createConditionalTag,
		getFullUrl,
		deduplicateAndFilterTags
	} from '$lib/utils/metaTags';

	let { communication }: { communication: Communication } = $props();

	// Helper to resolve URLs using current page context
	const resolveUrl = (path: string | undefined) => getFullUrl($page.url.origin, base, path);

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

	// Helper to create COinS metadata for presentations
	const createCoinsData = (): string => {
		const params = new SvelteURLSearchParams();

		// Basic COinS parameters
		params.set('url_ver', 'Z39.88-2004');
		params.set('ctx_ver', 'Z39.88-2004');
		params.set('rfr_id', 'info:sid/frederickmadore.com');

		// Presentation format
		params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:dc');
		params.set('rft.type', 'presentation');

		// Basic fields
		if (communication.title) params.set('rft.title', communication.title);

		// Presenter (always Frédérick Madore for communications)
		params.set('rft.creator', 'Madore, Frédérick');
		params.set('rft.aufirst', 'Frédérick');
		params.set('rft.aulast', 'Madore');

		// Meeting/Conference info
		if (communication.conference) params.set('rft.source', communication.conference);
		if (communication.location) params.set('rft.coverage', communication.location);

		// Date
		if (communication.dateISO) params.set('rft.date', communication.dateISO);
		else if (communication.year) params.set('rft.date', communication.year.toString());

		return params.toString();
	};

	// Main meta tags computation for presentations
	const metaTags = $derived.by((): MetaTag[] => {
		const tags: MetaTag[] = [];

		// Basic Highwire Press tags for presentations
		tags.push({ name: 'citation_title', content: communication.title });

		// Presentation specific tags
		tags.push({ name: 'citation_genre', content: 'presentation' });

		// Author/Presenter - always Frédérick Madore for communications
		tags.push(
			{ name: 'citation_author', content: 'Madore, Frédérick' },
			{ name: 'citation_presenter', content: 'Madore, Frédérick' },
			{ name: 'DC.creator', content: 'Madore, Frédérick' }
		);

		// Conference/Meeting info for presentations
		tags.push(
			{ name: 'citation_conference_title', content: communication.conference },
			{ name: 'citation_meeting_name', content: communication.conference },
			...createConditionalTag(
				'citation_place',
				`${communication.location}, ${communication.country}`
			),
			...createConditionalTag('citation_presentation_type', getPresentationType()),
			...createConditionalTag('citation_date', communication.dateISO),
			...createConditionalTag('citation_publication_date', communication.dateISO),
			...createConditionalTag('citation_year', communication.year?.toString()),
			...createConditionalTag(
				'citation_language',
				communication.language
					? Array.isArray(communication.language)
						? communication.language.join(', ')
						: communication.language
					: 'en'
			),
			...createConditionalTag('citation_keywords', communication.tags?.join('; '))
		);

		// Panel-specific information
		if (communication.panelTitle) {
			tags.push(...createConditionalTag('citation_panel_title', communication.panelTitle));
		}

		// Abstract/Description
		tags.push(...createConditionalTag('citation_abstract', communication.abstract));

		// URLs
		const currentUrl = `${$page.url.origin}${$page.url.pathname}`;
		tags.push(
			{ name: 'citation_public_url', content: currentUrl },
			{ name: 'citation_abstract_html_url', content: currentUrl },
			{ name: 'citation_fulltext_html_url', content: currentUrl },
			...createConditionalTag('citation_pdf_url', resolveUrl(communication.url))
		);

		// Additional presentation-specific URLs
		if (communication.url) {
			tags.push(...createConditionalTag('citation_presentation_url', communication.url));
		}

		// Dublin Core tags for presentations
		tags.push(
			{ name: 'DC.title', content: communication.title },
			{ name: 'DC.type', content: 'Event' },
			{ name: 'DC.publisher', content: communication.conference },
			...createConditionalTag('DC.description', communication.abstract),
			...createConditionalTag('DC.date', communication.dateISO),
			...createConditionalTag('DC.coverage', `${communication.location}, ${communication.country}`),
			...createConditionalTag(
				'DC.language',
				communication.language
					? Array.isArray(communication.language)
						? communication.language.join(', ')
						: communication.language
					: 'en'
			)
		);

		// Subject tags from communication tags
		if (communication.tags) {
			tags.push(...communication.tags.map((tag) => ({ name: 'DC.subject', content: tag })));
		}

		// Open Graph tags for social media sharing
		tags.push(
			{ name: 'og:title', content: communication.title },
			{ name: 'og:type', content: 'article' },
			{ name: 'og:url', content: currentUrl },
			...createConditionalTag('og:description', communication.abstract),
			...createConditionalTag('og:image', resolveUrl(communication.image)),
			{ name: 'og:site_name', content: 'Frédérick Madore' }
		);

		// Twitter Card tags
		tags.push(
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: communication.title },
			...createConditionalTag('twitter:description', communication.abstract),
			...createConditionalTag('twitter:image', resolveUrl(communication.image))
		);

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
