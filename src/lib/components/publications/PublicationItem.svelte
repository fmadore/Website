<script lang="ts">
    import type { Publication } from '$lib/types/publication';
    import { toggleAuthorFilter, toggleTagFilter } from '$lib/data/publications/filters';
    
    export let publication: Publication;
    
    // Human-readable labels for publication types
    const typeLabels: {[key: string]: string} = {
        'book': 'Book',
        'article': 'Journal Article',
        'chapter': 'Book Chapter',
        'special-issue': 'Special Issue',
        'report': 'Report',
        'encyclopedia': 'Encyclopedia Entry'
    };
    
    // Helper function to handle authors that might be string or array
    function getAuthorsArray(authors: string[] | string | undefined): string[] {
        if (!authors) return [];
        if (typeof authors === 'string') return authors.split(' and ');
        return authors;
    }
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
                {#if publication.url}
                    <a href={publication.url} target="_blank" rel="noopener noreferrer" class="hover:text-primary">
                        {publication.title}
                    </a>
                {:else}
                    {publication.title}
                {/if}
            </h3>
            
            <div class="text-light mb-2">
                <!-- Authors rendering -->
                {#if publication.type === 'book' || publication.type === 'article' || publication.type === 'chapter' || publication.type === 'encyclopedia' || publication.type === 'report'}
                    {#if publication.authors}
                        {#each getAuthorsArray(publication.authors) as author, i}
                            {#if author !== "Frédérick Madore"}
                                <button class="author-btn" on:click={() => toggleAuthorFilter(author)}>
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
                                    <button class="author-btn" on:click={() => toggleAuthorFilter(editor)}>
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
                {#if publication.type === 'encyclopedia' && publication.encyclopediaTitle}
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
                        <button class="author-btn" on:click={() => toggleAuthorFilter(publication.prefacedBy || '')}>
                            {publication.prefacedBy}
                        </button>
                    </div>
                {/if}
            </div>
            
            {#if publication.abstract}
                <div class="text-light text-sm mb-4">
                    {publication.abstract}
                </div>
            {/if}
            
            {#if publication.tags && publication.tags.length > 0}
                <div class="mt-3 flex flex-wrap gap-2">
                    {#each publication.tags as tag}
                        <button 
                            class="btn-sm bg-gray-100 hover:bg-gray-200 rounded-full border-0 text-sm"
                            on:click={() => toggleTagFilter(tag)}
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
        padding: 0;
        font-size: inherit;
        font-family: inherit;
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
        display: inline;
    }
    
    .author-btn:hover {
        color: var(--color-primary);
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