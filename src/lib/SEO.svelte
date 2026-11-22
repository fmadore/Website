<script lang="ts">
	import {
		createBreadcrumbSchema,
		createWebPageSchema,
		combineSchemas,
		type BreadcrumbItem
	} from '#lib/utils/jsonLdSchemas.ts';
	import { page } from '$app/state';
	import { getDefaultDescription, author, website } from '#lib/utils/siteHelpers.ts';
	import JsonLd from '#lib/components/common/JsonLd.svelte';
	import { markdownTwinPath } from '#lib/utils/markdownTwin.ts';
	import { DEFAULT_SOCIAL_IMAGE_ALT, socialImage } from '#lib/utils/socialImage.ts';

	interface Props {
		// SEO props
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		/**
		 * The card image. Defaults to the portrait; a vector, or a format a
		 * platform may reject, is swapped for a raster by `socialImage()`.
		 */
		ogImage?: string;
		/** Text alternative for `ogImage` (`og:image:alt`, `twitter:image:alt`). */
		ogImageAlt?: string;
		type?: string;
		/**
		 * Open Graph `article:*` fields, for a page whose `type` is `article`.
		 * This component owns every social tag (`og:*`, `article:*`,
		 * `twitter:*`): a record's MetaTags carries Highwire, Dublin Core and
		 * COinS only, so a page never ships two disagreeing sets.
		 */
		article?: {
			publishedTime?: string;
			modifiedTime?: string;
			section?: string;
			author?: string;
		};
		// Breadcrumb navigation for rich snippets
		breadcrumbs?: BreadcrumbItem[];
		// Page type for WebPage schema
		pageType?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ProfilePage';
		// Date information for pages
		datePublished?: string;
		dateModified?: string;
		// Additional JSON-LD schemas to include
		additionalSchemas?: object[];
		// RSS feed autodiscovery (default: true for all pages)
		includeRSSLink?: boolean;
		/**
		 * Keep this page out of search results while still letting crawlers follow
		 * its links ("noindex, follow"). For drafts, holding pages, and thin
		 * duplicates. A page set this way should also be left out of sitemap.xml —
		 * the sitemap is generated separately and cannot read this prop.
		 */
		noindex?: boolean;
		/**
		 * The WebPage schema's `name`, when it should differ from the browser
		 * title: a record page caps its `<title>` and appends a qualifier and
		 * the site name, but structured data wants the untruncated, unsuffixed
		 * title. Open Graph and Twitter take it too: a card prints its own site
		 * name (`og:site_name`), and Google ranks on the full text.
		 */
		schemaName?: string;
		/**
		 * `@id` of the thing this page describes (`recordEntityId` on a record
		 * page), which the WebPage schema names as its `mainEntity`.
		 */
		mainEntity?: string;
	}

	let {
		title = `${author.name} | Historian | Digital Humanist`,
		description = getDefaultDescription(),
		keywords = 'Frédérick Madore, Islam, West Africa, Digital Humanities, Research',
		canonical = '',
		ogImage,
		ogImageAlt,
		type = 'website',
		article,
		breadcrumbs = [],
		pageType = 'WebPage',
		datePublished,
		dateModified,
		additionalSchemas = [],
		includeRSSLink = true,
		noindex = false,
		schemaName,
		mainEntity
	}: Props = $props();

	/**
	 * Canonical defaults to this page's own address on the production origin.
	 * Only the nine landing pages used to pass one, so every detail page
	 * reported og:url as the bare site root and — because the WebPage schema
	 * below is gated on it — shipped no page schema either. Query strings are
	 * dropped deliberately: a filtered list canonicalises to the plain page.
	 */
	const canonicalUrl = $derived(canonical || `${website.url}${page.url.pathname}`);

	/** The full record title on a record page (see `schemaName`), else the page title. */
	const socialTitle = $derived(schemaName ?? title);

	/**
	 * Open Graph and Twitter want an absolute image URL, in a format every
	 * platform renders, with its size declared. `socialImage()` resolves the
	 * page's image against its canonical address (`paths.relative` makes an
	 * `asset()` path page-relative), swaps an SVG or AVIF for a raster, reads
	 * the size off the image manifest, and picks the summary card for a
	 * portrait image, which the large card would crop.
	 */
	const card = $derived(socialImage(ogImage, canonicalUrl));
	/** The page's own alt, unless the default image stood in for its image. */
	const cardAlt = $derived(card.fallback || !ogImage ? DEFAULT_SOCIAL_IMAGE_ALT : ogImageAlt);

	/**
	 * The page's Markdown twin, for agents (llms.txt v2): `/publications/x` →
	 * `/publications/x.md`, the home page → `/index.md`. Absolute on the
	 * production origin like the canonical and the feeds — `paths.relative`
	 * would otherwise render a depth-dependent `../` prefix. Pages with no twin
	 * (the visualisations, the slides gallery, an error) announce none.
	 */
	const markdownTwinUrl = $derived.by(() => {
		const path = markdownTwinPath(page.route.id, page.url.pathname);
		return path ? `${website.url}${path}` : undefined;
	});

	// Generate JSON-LD for breadcrumbs and page schema
	const jsonLdString = $derived.by(() => {
		const schemas: object[] = [...additionalSchemas];

		// Add breadcrumb schema if breadcrumbs provided
		if (breadcrumbs.length > 0) {
			schemas.push(createBreadcrumbSchema(breadcrumbs));
		}

		// Add WebPage schema — every page has a canonical URL, so every page gets one.
		schemas.push(
			createWebPageSchema({
				name: schemaName ?? title,
				description,
				path: new URL(canonicalUrl).pathname,
				type: pageType,
				datePublished,
				dateModified,
				mainEntity
			})
		);

		// No Person node here: the root layout publishes the one `#person` on
		// every page (the home page's fuller one in its place), and a
		// ProfilePage's `mainEntity` names it by `@id`.

		return schemas.length > 0 ? combineSchemas(schemas) : '';
	});
</script>

<JsonLd id="seo-json-ld" json={jsonLdString} />

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- RSS Feed Autodiscovery -->
	{#if includeRSSLink}
		<link
			rel="alternate"
			type="application/rss+xml"
			title="{author.name} - Activities RSS Feed"
			href="{website.url}{website.rssPath}"
		/>
		<link
			rel="alternate"
			type="application/rss+xml"
			title="{author.name} - Publications RSS Feed"
			href="{website.url}/publications/rss.xml"
		/>
	{/if}

	<!-- Machine-readable versions (https://llmstxt.org/): this page as Markdown,
	     and the llms.txt that maps the site it belongs to. -->
	{#if markdownTwinUrl}
		<link rel="alternate" type="text/markdown" href={markdownTwinUrl} />
	{/if}
	<link rel="describedby" type="text/plain" href="{website.url}/llms.txt" />

	<!-- Open Graph / Facebook: `property=`, per the Open Graph protocol. -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={socialTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={card.url} />
	{#if card.width && card.height}
		<meta property="og:image:width" content={String(card.width)} />
		<meta property="og:image:height" content={String(card.height)} />
	{/if}
	{#if cardAlt}
		<meta property="og:image:alt" content={cardAlt} />
	{/if}
	<meta property="og:site_name" content={author.name} />
	<meta property="og:locale" content="en_US" />
	{#if article?.publishedTime}
		<meta property="article:published_time" content={article.publishedTime} />
	{/if}
	{#if article?.modifiedTime}
		<meta property="article:modified_time" content={article.modifiedTime} />
	{/if}
	{#if article?.author}
		<meta property="article:author" content={article.author} />
	{/if}
	{#if article?.section}
		<meta property="article:section" content={article.section} />
	{/if}

	<!-- Twitter: `name=`, per the Twitter Cards markup. -->
	<meta name="twitter:card" content={card.card} />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={socialTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={card.url} />
	{#if cardAlt}
		<meta name="twitter:image:alt" content={cardAlt} />
	{/if}

	<!-- No site-wide citation_author: Google Scholar reads it as the authors of
	     the paper on the page, and says not to use it for the website's author.
	     Record pages emit their own Highwire tags through their MetaTags. -->
	<meta name="author" content={author.name} />
	<meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
	<meta
		name="googlebot"
		content={noindex
			? 'noindex, follow'
			: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}
	/>
</svelte:head>
