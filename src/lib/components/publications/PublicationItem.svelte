<script lang="ts">
    import type { Publication } from '$lib/types/publication';
    import { createEventDispatcher } from 'svelte';
    import { base } from '$app/paths';
    import { truncateAbstract } from '$lib/utils/textUtils';
    
    export let publication: Publication;
    
    const dispatch = createEventDispatcher();
    
    // Human-readable labels for publication types
    const typeLabels: {[key: string]: string} = {
        'book': 'Book',
        'article': 'Journal Article',
        'chapter': 'Book Chapter',
        'special-issue': 'Special Issue',
        'report': 'Report',
        'encyclopedia': 'Encyclopedia Entry',
        'blogpost': 'Blog Post',
        'dissertation': 'Ph.D. Dissertation'
    };
    
    // Helper function to handle authors that might be string or array
    function getAuthorsArray(authors: string[] | string | undefined): string[] {
        if (!authors) return [];
        if (typeof authors === 'string') return authors.split(' and ');
        return authors;
    }

    // Helper function to truncate abstract
    // function truncateAbstract(abstract: string | undefined, maxLength: number = 200): string {
    //     if (!abstract) return '';
    //     if (abstract.length <= maxLength) return abstract;
    //     return abstract.substring(0, maxLength) + '...';
    // }
</script>

<li class="card p-4 mb-4 hover-shadow">
    <div class="grid md:grid-cols-4 gap-4">
        {#if publication.image}
            <div class="col-span-1">
                <img 
                    src={publication.image} 
                    alt={publication.title} 
                    class="publication-cover-image"
                />
            </div>
        {/if}
        
        <div class="{publication.image ? 'col-span-3' : 'col-span-4'}">
            <div class="mb-2">
                <span class="text-primary text-sm">{typeLabels[publication.type] || publication.type}</span>
                {#if publication.language && publication.language.includes(',')}
                    <span class="text-light text-sm ml-2">({publication.language})</span>
                {:else if publication.language && publication.language !== 'English'}
                    <span class="text-light text-sm ml-2">({publication.language})</span>
                {/if}
            </div>
            
            <h3 class="text-dark font-weight-500 mb-2">
                <a href="{base}/publications/{publication.id}" class="hover:text-primary">
                    {publication.title}
                </a>
            </h3>
            
            <div class="text-light mb-2">
                <!-- Authors rendering -->
                {#if publication.type === 'book' || publication.type === 'article' || publication.type === 'chapter' || publication.type === 'encyclopedia' || publication.type === 'report' || publication.type === 'blogpost' || publication.type === 'dissertation'}
                    {#if publication.authors}
                        {#each getAuthorsArray(publication.authors) as author, i}
                            {#if author !== "Frédérick Madore"}
                                <button 
                                    class="author-btn" 
                                    on:click={() => dispatch('filterrequest', { type: 'author', value: author })}
                                >
                                    {author}
                                </button>
                            {:else}
                                <span>{author}</span>
                            {/if}
                            {#if i < getAuthorsArray(publication.authors).length - 1}
                                <span> and </span>
                            {/if}
                        {/each}
                    {/if}
                {:else if publication.type === 'special-issue'}
                    <!-- Special issue editor rendering -->
                    {#if publication.editors}
                        <span>Edited by </span>
                        {#if typeof publication.editors === 'string'}
                            {#each publication.editors.split(/\s*(?:,|and)\s*/).map(name => name.trim()) as editor, i}
                                {#if editor !== "Frédérick Madore"}
                                    <button 
                                        class="author-btn" 
                                        on:click={() => dispatch('filterrequest', { type: 'author', value: editor })}
                                    >
                                        {editor}
                                    </button>
                                {:else}
                                    <span>{editor}</span>
                                {/if}
                                {#if i < publication.editors.split(/\s*(?:,|and)\s*/).map(name => name.trim()).length - 1}
                                    <span>, </span>
                                {/if}
                            {/each}
                        {/if}
                    {/if}
                {/if}
                <span>. </span>
                
                <!-- Publication details -->
                {#if publication.type === 'dissertation'}
                    <span>"{publication.title}", </span>
                    <span>Ph.D. dissertation</span>
                    {#if publication.department}
                        <span>, {publication.department}</span>
                    {/if}
                    {#if publication.university}
                        <span>, {publication.university}</span>
                    {/if}
                    {#if publication.year}
                        <span>, {publication.year}</span>
                    {/if}
                    <span>.</span>
                    {#if publication.advisors && publication.advisors.length > 0}
                        <div class="mt-1">
                            <span>Supervised by </span>
                            {#each publication.advisors as advisor, i}
                                <span>{advisor}</span>
                                {#if i < publication.advisors.length - 1}
                                    <span> and </span>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                {:else if publication.type === 'encyclopedia' && publication.encyclopediaTitle}
                    <span>"{publication.title}", </span>
                    <span>{publication.encyclopediaTitle}</span>
                    {#if publication.pages}
                        <span>, {publication.pages}</span>
                    {/if}
                    {#if publication.placeOfPublication}
                        <span>. {publication.placeOfPublication}</span>
                    {/if}
                    {#if publication.publisher}
                        <span>: {publication.publisher}</span>
                    {/if}
                    {#if publication.year}
                        <span>, {publication.year}</span>
                    {/if}
                    <span>.</span>
                    {#if publication.editors}
                        <span> Edited by {publication.editors}.</span>
                    {/if}
                {:else if publication.publisher}
                    <span>{publication.publisher}</span>
                    {#if publication.year}
                        <span>, {publication.year}</span>
                    {/if}
                    <span>.</span>
                {:else if publication.journal}
                    <span>{publication.journal}</span>
                    {#if publication.volume}
                        <span>, {publication.volume}</span>
                    {/if}
                    {#if publication.issue}
                        <span>({publication.issue})</span>
                    {/if}
                    {#if publication.pages}
                        <span>: {publication.pages}</span>
                    {/if}
                    {#if publication.year}
                        <span>, {publication.year}</span>
                    {/if}
                    <span>.</span>
                {/if}
                
                <!-- Preface information -->
                {#if publication.prefacedBy}
                    <div class="mt-1">
                        <span>Preface by </span>
                        <button 
                            class="author-btn" 
                            on:click={() => dispatch('filterrequest', { type: 'author', value: publication.prefacedBy || '' })}
                        >
                            {publication.prefacedBy}
                        </button>
                    </div>
                {/if}
            </div>
            
            {#if publication.abstract}
                <div class="text-light text-sm mb-4">
                    {truncateAbstract(publication.abstract)}
                </div>
            {/if}
            
            {#if publication.tags && publication.tags.length > 0}
                <div class="mt-3 flex flex-wrap gap-2">
                    {#each publication.tags as tag}
                        <button 
                            class="btn-sm tag-button rounded-full text-sm"
                            on:click={() => dispatch('filterrequest', { type: 'tag', value: tag })}
                        >
                            {tag}
                        </button>
                    {/each}
                </div>
            {/if}
            
            {#if publication.additionalUrls && publication.additionalUrls.length > 0}
                <div class="mt-3">
                    {#each publication.additionalUrls as url, i}
                        <a 
                            href={url.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            class="btn-sm btn-outline-primary mr-2"
                        >
                            {url.label || `Link ${i+1}`}
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</li>

<style>
    /* Only keep minimal styles not covered by our CSS architecture */
    .author-btn {
        background: none;
        border: none;
        padding: 0 var(--spacing-1); /* Add small padding */
        font-size: inherit;
        font-family: inherit;
        color: var(--color-primary); /* Use theme primary color */
        text-decoration: none; /* Remove default underline */
        cursor: pointer;
        display: inline;
        border-radius: var(--border-radius-sm); /* Add slight rounding */
    }
    
    .author-btn:hover {
        /* Use primary color with low opacity for background */
        background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
        text-decoration: underline; /* Add underline on hover */
    }

    .tag-button {
        background-color: color-mix(in srgb, var(--color-border) 80%, transparent); /* Use theme border color with transparency */
        color: var(--color-text-light);
        border: 1px solid var(--color-border); /* Use theme border color */
    }
    .tag-button:hover {
        background-color: var(--color-border); /* Use solid theme border color on hover */
        color: var(--color-text);
    }
    
    .hover-shadow:hover {
        box-shadow: var(--shadow-md);
    }
    
    .font-weight-500 {
        font-weight: 500;
    }
    
    .text-sm {
        font-size: 0.875rem;
    }
    
    .ml-2 {
        margin-left: 0.5rem;
    }
    
    .publication-cover-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
</style> 