<script lang="ts">
    import { allPublications } from '$lib/data/publications/index';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import type { Publication } from '$lib/types';
    import CitedBy from '$lib/components/publications/CitedBy.svelte';
    import Reviews from '$lib/components/publications/Reviews.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    
    // Get publication from the page data
    export let data;
    $: publication = data.publication;
    
    // Format date for display
    function formatDate(dateString: string): string {
        return dateString || '';
    }
    
    // Helper to get badge text
    function getTypeBadgeText(type: string): string {
        switch (type) {
            case 'article': return 'Journal Article';
            case 'book': return 'Book';
            case 'chapter': return 'Book Chapter';
            case 'special-issue': return 'Special Issue';
            case 'report': return 'Report';
            case 'encyclopedia': return 'Encyclopedia Entry';
            case 'blogpost': return 'Blog Post';
            case 'dissertation': return 'Dissertation';
            default: return type;
        }
    }
</script>

<SEO 
    title="{publication.title} | Publications | Frédérick Madore"
    description="{publication.abstract || `Details about ${publication.title} by ${publication.authors?.join(', ')}`}"
    keywords="{[
        'publication',
        publication.type,
        ...(publication.tags || []),
        ...(publication.authors || []),
        'Islam',
        'West Africa',
        'Frédérick Madore'
    ].join(', ')}"
    ogImage="{base}/{publication.image}"
/>

<div class="container mx-auto py-8 px-4">
    <article class="publication-article rounded-lg p-6 mb-8">
        <PageHeader 
            title={publication.title}
            backLinkHref="publications"
            backLinkLabel="← Back to Publications"
            date={publication.date}
            typeBadgeText={getTypeBadgeText(publication.type)}
            authors={publication.authors}
            editors={publication.editors}
            tags={publication.tags}
        />
        
        {#if publication.heroImage?.src}
            <figure class="mb-6">
                <img 
                    src="{base}/{publication.heroImage.src}" 
                    alt="{publication.heroImage.alt || publication.title}"
                    class="w-full max-w-xs h-auto rounded-md mx-auto"
                >
                {#if publication.heroImage.caption}
                    <figcaption class="text-text-muted text-sm mt-2 italic text-center">
                        {publication.heroImage.caption}
                    </figcaption>
                {/if}
            </figure>
        {:else if publication.image}
            <img 
                src="{base}/{publication.image}" 
                alt="{publication.title}"
                class="mb-6 w-full max-w-xs h-auto rounded-md mx-auto"
            >
        {/if}
        
        {#if publication.abstract}
            <section class="mb-6">
                <h2 class="text-xl font-semibold mb-2">Abstract</h2>
                <div class="text-text">{publication.abstract}</div>
            </section>
        {/if}
        
        <section class="publication-details grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Publication-specific details based on type -->
            {#if publication.type === 'article'}
                <div>
                    <strong>Journal:</strong> {publication.journal}
                </div>
                {#if publication.volume}
                    <div>
                        <strong>Volume:</strong> {publication.volume}
                    </div>
                {/if}
                {#if publication.issue}
                    <div>
                        <strong>Issue:</strong> {publication.issue}
                    </div>
                {/if}
            {:else if publication.type === 'book'}
                {#if publication.publisher}
                    <div>
                        <strong>Publisher:</strong> {publication.publisher}
                    </div>
                {/if}
                {#if publication.placeOfPublication}
                    <div>
                        <strong>Place:</strong> {publication.placeOfPublication}
                    </div>
                {/if}
                {#if publication.isbn}
                    <div>
                        <strong>ISBN:</strong> {publication.isbn}
                    </div>
                {/if}
            {:else if publication.type === 'chapter'}
                <div>
                    <strong>Book:</strong> {publication.book}
                </div>
                {#if publication.editors}
                    <div>
                        <strong>Edited by:</strong> {Array.isArray(publication.editors) ? publication.editors.join(', ') : publication.editors}
                    </div>
                {/if}
                {#if publication.publisher}
                    <div>
                        <strong>Publisher:</strong> {publication.publisher}
                    </div>
                {/if}
            {:else if publication.type === 'special-issue'}
                <div>
                    <strong>Journal:</strong> {publication.journal}
                </div>
                {#if publication.volume}
                    <div>
                        <strong>Volume:</strong> {publication.volume}
                    </div>
                {/if}
                {#if publication.issue}
                    <div>
                        <strong>Issue:</strong> {publication.issue}
                    </div>
                {/if}
            {:else if publication.type === 'report'}
                {#if publication.publisher}
                    <div>
                        <strong>Publisher:</strong> {publication.publisher}
                    </div>
                {/if}
                {#if publication.placeOfPublication}
                    <div>
                        <strong>Place:</strong> {publication.placeOfPublication}
                    </div>
                {/if}
            {:else if publication.type === 'encyclopedia'}
                <div>
                    <strong>Encyclopedia:</strong> {publication.encyclopediaTitle}
                </div>
                {#if publication.publisher}
                    <div>
                        <strong>Publisher:</strong> {publication.publisher}
                    </div>
                {/if}
            {:else if publication.type === 'blogpost'}
                <div>
                    <strong>Blog:</strong> {publication.publisher}
                </div>
            {:else if publication.type === 'dissertation'}
                <div>
                    <strong>University:</strong> {publication.university}
                </div>
                {#if publication.department}
                    <div>
                        <strong>Department:</strong> {publication.department}
                    </div>
                {/if}
                {#if publication.advisors && publication.advisors.length > 0}
                    <div>
                        <strong>Advisors:</strong> {publication.advisors.join(', ')}
                    </div>
                {/if}
            {/if}
            
            <!-- Common details for all publication types -->
            {#if publication.pages}
                <div>
                    <strong>Pages:</strong> {publication.pages}
                </div>
            {/if}
            {#if publication.pageCount}
                <div>
                    <strong>Pages:</strong> {publication.pageCount}
                </div>
            {/if}
            {#if publication.language}
                <div>
                    <strong>Language:</strong> {publication.language}
                </div>
            {/if}
            {#if publication.doi}
                <div>
                    <strong>DOI:</strong> <a href="https://doi.org/{publication.doi}" target="_blank" rel="noopener" class="text-primary hover:underline">{publication.doi}</a>
                </div>
            {/if}
            {#if publication.project}
                {@const projectMappings: Record<string, string> = {
                    "Religious Activism on Campuses in Togo and Benin": `${base}/research/religious-activism-campuses-togo-benin`,
                    "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso": `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`,
                    "Muslim Minorities in Southern Cities of Benin and Togo": `${base}/research/muslim-minorities-southern-cities-benin-togo`,
                    "Mining the Islam West Africa Collection": `${base}/research/mining-the-islam-west-africa-collection}`
                }}
                {@const projectUrl = projectMappings[publication.project]}
                <div>
                    <strong>Project:</strong> 
                    {#if projectUrl}
                        <a href="{projectUrl}" class="text-primary hover:underline">{publication.project}</a>
                    {:else}
                        {publication.project} <!-- Display as text if no mapping exists -->
                    {/if}
                </div>
            {/if}
            {#if publication.country && publication.country.length > 0}
                <div>
                    <strong>Countries:</strong> {publication.country.join(', ')}
                </div>
            {/if}
        </section>
        
        {#if publication.tags && publication.tags.length > 0}
            <section class="mb-6">
                <h2 class="text-lg font-semibold mb-2">Tags</h2>
                <div class="flex flex-wrap gap-2">
                    {#each publication.tags as tag}
                        <a href="{base}/publications?tag={encodeURIComponent(tag)}" class="tag-link text-sm px-3 py-1 rounded-full">
                            {tag}
                        </a>
                    {/each}
                </div>
            </section>
        {/if}
        
        <section class="publication-links">
            {#if publication.url}
                <div class="mb-2">
                    <a href="{publication.url}" target="_blank" rel="noopener" class="btn btn-primary">
                        Access Publication
                    </a>
                </div>
            {/if}
            
            {#if publication.additionalUrls && publication.additionalUrls.length > 0}
                <div class="flex flex-wrap gap-2">
                    {#each publication.additionalUrls as link}
                        <a href="{link.url}" target="_blank" rel="noopener" class="btn btn-outline">
                            {link.label}
                        </a>
                    {/each}
                </div>
            {/if}
        </section>
    </article>

    <!-- Use the Reviews component -->
    <Reviews reviewedBy={publication.reviewedBy} />

    <!-- Use the CitedBy component -->
    <CitedBy citedBy={publication.citedBy} />

    <!-- Related publications by same project, if any -->
    {#if publication.project}
        <section class="mt-8">
            <h2 class="text-xl font-semibold mb-4">More Publications in this Project</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each allPublications.filter(p => p.project === publication.project && p.id !== publication.id).slice(0, 3) as relatedPub}
                    <a href="{base}/publications/{relatedPub.id}" class="related-item rounded-lg p-4 transition-shadow">
                        <div class="related-date text-sm mb-1">{relatedPub.date}</div>
                        <h3 class="related-title font-medium text-primary">{relatedPub.title}</h3>
                        <div class="related-authors text-sm mt-1">{relatedPub.authors?.join(', ')}</div>
                    </a>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .publication-details > div {
        padding: 0.5rem;
        border-bottom: 1px solid var(--color-border);
    }
    
    .publication-details strong {
        color: var(--color-text-light);
        font-weight: 600;
        margin-right: 0.5rem;
    }
    
    .btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius-md);
        font-weight: 600;
        text-decoration: none;
        text-align: center;
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        background-color: var(--color-primary);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--color-primary-dark);
    }
    
    .btn-outline {
        border: 1px solid var(--color-border);
        color: var(--color-text);
    }
    
    .btn-outline:hover {
        background-color: var(--color-border);
    }

    /* Theme styles for main article container */
    .publication-article {
        background-color: var(--color-background);
        box-shadow: var(--shadow-md);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    /* Theme styles for tags */
    .tag-link {
        background-color: var(--color-border);
        color: var(--color-text-light);
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .tag-link:hover {
        background-color: var(--color-primary);
        color: var(--color-background);
    }

    /* Theme styles for related items */
    .related-item {
        background-color: var(--color-background);
        box-shadow: var(--shadow-sm);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    .related-item:hover {
        box-shadow: var(--shadow-md);
    }
    .related-date,
    .related-authors {
        color: var(--color-text-light);
    }

    /* Theme style for image caption */
    .publication-article figcaption {
        color: var(--color-text-light);
    }
</style> 