<script lang="ts">
	import { base } from '$app/paths';

	interface Props {
		// SEO props
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		ogImage?: any;
		type?: string;
		// Control whether to include citation_author (default: true)
		// Set to false for publication pages that use MetaTags.svelte
		includeCitationAuthor?: boolean;
	}

	let {
		title = 'Frédérick Madore | Historian | Digital Humanist',
		description = 'Personal website of Frédérick Madore, Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)',
		keywords = 'Frédérick Madore, Islam, West Africa, Digital Humanities, Research',
		canonical = '',
		ogImage = `${base}/images/Profile-picture.webp`,
		type = 'website',
		includeCitationAuthor = true
	}: Props = $props();
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

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical || 'https://www.frederickmadore.com'} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />

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
</svelte:head>
