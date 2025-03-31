<script lang="ts">
    import { allPublications } from '$lib/data/publications/index';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import type { Publication } from '$lib/types';
    
    // Get publication from the page data
    export let data;
    $: publication = data.publication;
    
    // Format date for display
    function formatDate(dateString: string): string {
        return dateString || '';
    }
    
    // Format editor names
    function formatEditors(editors: string | string[] | undefined): string {
        if (!editors) return '';
        
        if (typeof editors === 'string') {
            return editors;
        }
        
        if (editors.length === 1) return editors[0];
        if (editors.length === 2) return `${editors[0]} and ${editors[1]}`;
        return editors.join(', ');
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
    ogImage="{publication.image}"
/>

<div class="container mx-auto py-8 px-4">
    <a href="{base}/publications" class="text-primary hover:underline mb-4 inline-block">
        ← Back to Publications
    </a>
    
    <article class="bg-white rounded-lg shadow-md p-6 mb-8">
        <header class="mb-6">
            <div class="flex justify-between items-start mb-2">
                <div class="publication-type-badge">
                    {#if publication.type === 'article'}
                        Journal Article
                    {:else if publication.type === 'book'}
                        Book
                    {:else if publication.type === 'chapter'}
                        Book Chapter
                    {:else if publication.type === 'special-issue'}
                        Special Issue
                    {:else if publication.type === 'report'}
                        Report
                    {:else if publication.type === 'encyclopedia'}
                        Encyclopedia Entry
                    {:else if publication.type === 'blogpost'}
                        Blog Post
                    {:else if publication.type === 'dissertation'}
                        Dissertation
                    {:else}
                        {publication.type}
                    {/if}
                </div>
                <div class="text-text-muted">{publication.date}</div>
            </div>
            
            <h1 class="text-2xl font-bold mb-2">{publication.title}</h1>
            
            <div class="text-lg mb-2">
                {#if publication.authors && publication.authors.length > 0}
                    {publication.authors.join(', ')}
                {/if}
            </div>
            
            {#if publication.editors}
                <div class="text-text-secondary mb-2">
                    Edited by {formatEditors(publication.editors)}
                </div>
            {/if}
        </header>
        
        {#if publication.heroImage?.src}
            <figure class="mb-6">
                <img 
                    src="{base}/{publication.heroImage.src}" 
                    alt="{publication.heroImage.alt || publication.title}"
                    class="w-full max-w-md h-auto rounded-md mx-auto"
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
                class="mb-6 w-full max-w-md h-auto rounded-md mx-auto"
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
                        <strong>Edited by:</strong> {formatEditors(publication.editors)}
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
                <div>
                    <strong>Project:</strong> <a href="{base}/research/{publication.project.toLowerCase().replace(/\s+/g, '-')}" class="text-primary hover:underline">{publication.project}</a>
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
                        <a href="{base}/publications?tag={encodeURIComponent(tag)}" class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-text-secondary">
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
    
    <!-- Related publications by same project, if any -->
    {#if publication.project}
        <section class="mt-8">
            <h2 class="text-xl font-semibold mb-4">More Publications in this Project</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each allPublications.filter(p => p.project === publication.project && p.id !== publication.id).slice(0, 3) as relatedPub}
                    <a href="{base}/publications/{relatedPub.id}" class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div class="text-sm text-text-muted mb-1">{relatedPub.date}</div>
                        <h3 class="font-medium text-primary">{relatedPub.title}</h3>
                        <div class="text-sm mt-1">{relatedPub.authors?.join(', ')}</div>
                    </a>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .publication-type-badge {
        display: inline-block;
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.25rem 0.75rem;
        border-radius: var(--border-radius-full);
    }
    
    .publication-details > div {
        padding: 0.5rem;
        border-bottom: 1px solid var(--color-border-light);
    }
    
    .publication-details strong {
        color: var(--color-text-secondary);
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
        background-color: var(--color-background-alt);
    }
</style> 