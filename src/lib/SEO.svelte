<script lang="ts">
	import { base } from '$app/paths';
	import {
		createBreadcrumbSchema,
		createWebPageSchema,
		createPersonSchema,
		combineSchemas,
		type BreadcrumbItem
	} from '$lib/utils/seoUtils';

	interface Props {
		// SEO props
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		ogImage?: string;
		type?: string;
		// Control whether to include citation_author (default: true)
		// Set to false for publication pages that use MetaTags.svelte
		includeCitationAuthor?: boolean;
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
	}

	let {
		title = 'Frédérick Madore | Historian | Digital Humanist',
		description = 'Personal website of Frédérick Madore, Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)',
		keywords = 'Frédérick Madore, Islam, West Africa, Digital Humanities, Research',
		canonical = '',
		ogImage = `${base}/images/Profile-picture.webp`,
		type = 'website',
		includeCitationAuthor = true,
		breadcrumbs = [],
		pageType = 'WebPage',
		datePublished,
		dateModified,
		additionalSchemas = [],
		includeRSSLink = true
	}: Props = $props();

	// Generate JSON-LD for breadcrumbs and page schema
	const jsonLdString = $derived.by(() => {
		const schemas: object[] = [...additionalSchemas];

		// Check if a Person schema is already provided in additionalSchemas
		const hasPersonSchema = additionalSchemas.some(
			(schema: any) => schema['@type'] === 'Person'
		);

		// Add breadcrumb schema if breadcrumbs provided
		if (breadcrumbs.length > 0) {
			schemas.push(createBreadcrumbSchema(breadcrumbs));
		}

		// Add WebPage schema for main sections
		if (breadcrumbs.length > 0 || canonical) {
			const path = canonical
				? new URL(canonical).pathname
				: breadcrumbs.length > 0
					? new URL(breadcrumbs[breadcrumbs.length - 1].url).pathname
					: '';

			if (path) {
				schemas.push(
					createWebPageSchema({
						name: title,
						description,
						path,
						type: pageType,
						datePublished,
						dateModified
					})
				);
			}
		}

		// For ProfilePage, include the Person schema as the mainEntity target
		// Only add default Person schema if one isn't already provided
		if (pageType === 'ProfilePage' && !hasPersonSchema) {
			schemas.push(createPersonSchema());
		}

		return schemas.length > 0 ? combineSchemas(schemas) : '';
	});
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />

	<!-- Canonical URL -->
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}

	<!-- RSS Feed Autodiscovery -->
	{#if includeRSSLink}
		<link rel="alternate" type="application/rss+xml" title="Frédérick Madore - Activities RSS Feed" href="https://www.frederickmadore.com/rss.xml" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical || 'https://www.frederickmadore.com'} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="Frédérick Madore" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonical || 'https://www.frederickmadore.com'} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={ogImage} />

	<!-- Scholar / Academic -->
	{#if includeCitationAuthor}
		<meta name="citation_author" content="Frédérick Madore" />
	{/if}
	<meta name="author" content="Frédérick Madore" />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

	<!-- JSON-LD Structured Data -->
	{#if jsonLdString}
		{@html `<script type="application/ld+json">${jsonLdString}</script>`}
	{/if}
</svelte:head>
