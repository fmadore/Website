<script lang="ts">
    import { base } from '$app/paths';
    
    // SEO props
    export let title = "Frédérick Madore - Research Fellow at ZMO";
    export let description = "Personal website of Frédérick Madore, Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)";
    export let keywords = "Frédérick Madore, Islam, West Africa, Digital Humanities, Research";
    export let canonical = "";
    export let ogImage = `${base}/images/Profile-picture.jpg`;
    export let type = "website";
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
    <meta property="og:url" content={canonical || "https://fmadore.github.io/Website"} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonical || "https://fmadore.github.io/Website"} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={ogImage} />
    
    <!-- Scholar / Academic -->
    <meta name="citation_author" content="Frédérick Madore" />
    <meta name="author" content="Frédérick Madore" />
    <meta name="robots" content="index, follow" />
</svelte:head> 