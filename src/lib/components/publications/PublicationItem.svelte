<script lang="ts">
    import type { Publication } from '$lib/types';
    import { toggleTagFilter, toggleAuthorFilter } from '$lib/data/publications/filters';
    
    export let publication: Publication;
    
    // Human-readable labels for publication types
    const typeLabels: {[key: string]: string} = {
        'book': 'Books',
        'article': 'Journal Articles',
        'chapter': 'Book Chapters',
        'special-issue': 'Special Issues'
    };
</script>

<li class="publication-item">
    <div class="publication-layout">
        {#if publication.heroImage?.src || publication.image}
            <div class="publication-image">
                <img 
                    src={publication.heroImage?.src || publication.image} 
                    alt={publication.heroImage?.alt || `Cover of ${publication.title}`}
                    class="cover-image"
                />
                {#if publication.heroImage?.caption}
                    <div class="image-caption">{publication.heroImage.caption}</div>
                {/if}
            </div>
        {/if}
        
        <div class="publication-content">
            <div class="publication-type-badge">
                {typeLabels[publication.type] || publication.type}
            </div>
            
            <div class="publication-title">
                <a href={publication.url}>
                    {publication.title}
                </a>
            </div>
            
            {#if publication.type === 'book'}
                <p class="publication-meta">
                    {#if publication.isEditedVolume}
                        Edited by 
                        {#if publication.editors && typeof publication.editors === 'string'}
                            <!-- Parse editor names from string format -->
                            {#each publication.editors.split(' and ').map(name => name.trim()) as editor, i}
                                {#if editor === "Frédérick Madore"}
                                    {editor}
                                {:else}
                                    <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                        {editor}
                                    </button>
                                {/if}
                                {#if i < publication.editors.split(' and ').length - 1}<span> and </span>{/if}
                            {/each}
                        {:else if Array.isArray(publication.editors)}
                            <!-- Handle editors as an array -->
                            {#each publication.editors as editor, i}
                                {#if editor === "Frédérick Madore"}
                                    {editor}
                                {:else}
                                    <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                        {editor}
                                    </button>
                                {/if}
                                {#if i < publication.editors.length - 1}, {/if}
                            {/each}
                        {:else}
                            Unknown
                        {/if}<span>.</span> {publication.publisher}, {publication.placeOfPublication}, {publication.year}
                        {#if publication.series}
                            <br>{publication.series}
                        {/if}
                    {:else}
                        {#each publication.authors as author, i}
                            {#if author === "Frédérick Madore"}
                                {author}
                            {:else}
                                <button class="author-link" on:click={() => toggleAuthorFilter(author)}>
                                    {author}
                                </button>
                            {/if}
                            {#if i < publication.authors.length - 1}, {/if}
                        {/each}<span>.</span> {publication.publisher}, {publication.placeOfPublication}, {publication.year}
                    {/if}
                    {#if publication.isbn}
                        <br>ISBN: {publication.isbn}
                    {/if}
                </p>
            {:else if publication.type === 'article'}
                <p class="publication-meta">
                    {#each publication.authors as author, i}
                        {#if author === "Frédérick Madore"}
                            {author}
                        {:else}
                            <button class="author-link" on:click={() => toggleAuthorFilter(author)}>
                                {author}
                            </button>
                        {/if}
                        {#if i < publication.authors.length - 1}, {/if}
                    {/each}<span>.</span> {publication.journal}, {publication.year}
                    {#if publication.volume}
                        <br>Vol. {publication.volume}
                        {#if publication.issue}
                            , No. {publication.issue}
                        {/if}
                    {/if}
                    {#if publication.pages}
                        , pp. {publication.pages}
                    {/if}
                </p>
            {:else if publication.type === 'chapter'}
                <p class="publication-meta">
                    {#each publication.authors as author, i}
                        {#if author === "Frédérick Madore"}
                            {author}
                        {:else}
                            <button class="author-link" on:click={() => toggleAuthorFilter(author)}>
                                {author}
                            </button>
                        {/if}
                        {#if i < publication.authors.length - 1}, {/if}
                    {/each}<span>.</span> In <em>{publication.book}</em>, edited by 
                    {#if publication.editors && typeof publication.editors === 'string'}
                        <!-- Parse editor names from string format -->
                        {#each publication.editors.split(' and ').map(name => name.trim()) as editor, i}
                            {#if editor === "Frédérick Madore"}
                                {editor}
                            {:else}
                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                    {editor}
                                </button>
                            {/if}
                            {#if i < publication.editors.split(' and ').length - 1}<span> and </span>{/if}
                        {/each}
                    {:else if Array.isArray(publication.editors)}
                        <!-- Handle editors as an array -->
                        {#each publication.editors as editor, i}
                            {#if editor === "Frédérick Madore"}
                                {editor}
                            {:else}
                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                    {editor}
                                </button>
                            {/if}
                            {#if i < publication.editors.length - 1}, {/if}
                        {/each}
                    {:else}
                        Unknown
                    {/if}<span>.</span> {publication.publisher}, {publication.placeOfPublication}, {publication.year}
                    {#if publication.pages}
                        , pp. {publication.pages}
                    {/if}
                </p>
            {:else if publication.type === 'special-issue'}
                <p class="publication-meta">
                    Edited by 
                    {#if publication.editors && typeof publication.editors === 'string'}
                        <!-- Parse editor names from string format -->
                        {#each publication.editors.split(' and ').map(name => name.trim()) as editor, i}
                            {#if editor === "Frédérick Madore"}
                                {editor}
                            {:else}
                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                    {editor}
                                </button>
                            {/if}
                            {#if i < publication.editors.split(' and ').length - 1}<span> and </span>{/if}
                        {/each}
                    {:else if Array.isArray(publication.editors)}
                        <!-- Handle editors as an array -->
                        {#each publication.editors as editor, i}
                            {#if editor === "Frédérick Madore"}
                                {editor}
                            {:else}
                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                    {editor}
                                </button>
                            {/if}
                            {#if i < publication.editors.length - 1}, {/if}
                        {/each}
                    {:else}
                        Unknown
                    {/if}<span>.</span> <em>{publication.journal}</em>, {publication.volume}
                    {#if publication.publisher}
                        , {publication.publisher}
                    {/if}
                    , {publication.date}
                </p>
                {#if publication.additionalUrls && publication.additionalUrls.length > 0}
                    <p class="additional-urls">
                        Additional links: 
                        {#each publication.additionalUrls as link, i}
                            <a href={link.url} class="additional-link">{link.label}</a>
                            {#if i < publication.additionalUrls.length - 1}, {/if}
                        {/each}
                    </p>
                {/if}
            {/if}
            
            {#if publication.abstract}
                <p class="publication-abstract">{publication.abstract}</p>
            {/if}
            
            {#if publication.tags && publication.tags.length > 0}
                <div class="publication-tags">
                    {#each publication.tags as tag}
                        <button class="tag" on:click={() => toggleTagFilter(tag)}>
                            {tag}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</li>

<style>
    .publication-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .publication-layout {
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
    }
    
    .publication-image {
        flex: 0 0 150px;
    }
    
    .cover-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .image-caption {
        font-size: 0.75rem;
        color: #718096;
        margin-top: 0.5rem;
        text-align: center;
    }
    
    .publication-content {
        flex: 1;
    }
    
    .publication-type-badge {
        display: inline-block;
        background-color: #ebf4ff;
        color: #2c5282;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }
    
    .publication-title {
        font-weight: 600;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }
    
    .publication-title a {
        color: #2b6cb0;
        text-decoration: none;
    }
    
    .publication-title a:hover {
        text-decoration: underline;
    }
    
    .publication-meta {
        color: #4a5568;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .publication-abstract {
        color: #4a5568;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
    }
    
    .publication-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .tag {
        background-color: #e2e8f0;
        color: #4a5568;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        border: none;
        cursor: pointer;
    }
    
    .tag:hover {
        background-color: #cbd5e0;
    }
    
    .additional-urls {
        color: #4a5568;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .additional-link {
        color: #2b6cb0;
        text-decoration: none;
    }
    
    .additional-link:hover {
        text-decoration: underline;
    }
    
    .author-link {
        background: none;
        border: none;
        padding: 0;
        color: #2b6cb0;
        font-size: inherit;
        cursor: pointer;
        text-decoration: none;
        font-family: inherit;
    }
    
    .author-link:hover {
        text-decoration: underline;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .publication-layout {
            flex-direction: column;
        }
        
        .publication-image {
            flex: 0 0 auto;
            margin-bottom: 1rem;
            max-width: 200px;
        }
    }
</style> 