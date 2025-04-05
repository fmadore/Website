<script lang="ts">
    import type { Publication } from '$lib/types/publication';
    import { createEventDispatcher } from 'svelte';
    import { base } from '$app/paths';
    import { truncateAbstract } from '$lib/utils/textUtils';
    import MetadataList from './MetadataList.svelte';
    
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

    // Define type for metadata items
    type MetadataItem = { label: string; value: string | number | undefined | null };

    // Reactive computation for metadata list
    $: publicationMetadata = (() => {
        const common: MetadataItem[] = [];
        const bookDetails: MetadataItem[] = [];
        const other: MetadataItem[] = [];

        // Construct book details string if type is 'book'
        if (publication.type === 'book') {
            let details = '';
            if (publication.placeOfPublication) {
                details += publication.placeOfPublication;
                if (publication.publisher) {
                    details += ':';
                }
            }
            if (publication.placeOfPublication && publication.publisher) {
                details += ' '; // Use space instead of &nbsp; here
            }
            if (publication.publisher) {
                details += publication.publisher;
            }
            if ((publication.placeOfPublication || publication.publisher) && publication.year) {
                details += ', '; // Use space
            }
            if (publication.year) {
                details += publication.year;
            }
            if (details) {
                // Use empty label to signal MetadataList to hide it
                bookDetails.push({ label: '', value: details });
            }
        } else {
            // Add individual items for non-book types
            other.push({ label: 'Publisher', value: publication.publisher });
            other.push({ label: 'Place', value: publication.placeOfPublication });
            other.push({ label: 'Year', value: publication.year });
            other.push({ label: 'Journal', value: publication.journal });
            other.push({ label: 'Volume', value: publication.volume });
            other.push({ label: 'Issue', value: publication.issue });
            other.push({ label: 'Pages', value: publication.pages });
            other.push({ label: 'Encyclopedia', value: publication.encyclopediaTitle });
            other.push({ label: 'Editors', value: publication.editors });
        }

        // Combine and filter out empty items
        return [...common, ...bookDetails, ...other].filter(
            item => item.value !== undefined && item.value !== null && item.value !== ''
        );
    })();

    // Reactive computation for Author/Editor HTML string
    let authorDisplayHtml = '';
    $: {
        let html = '';
        const type = publication.type;
        const authors = publication.authors;
        const editors = publication.editors;

        if (type === 'book' || type === 'article' || type === 'chapter' || type === 'encyclopedia' || type === 'report' || type === 'blogpost' || type === 'dissertation') {
            if (authors) {
                const authorsArray = getAuthorsArray(authors);
                authorsArray.forEach((author, i) => {
                    if (author !== "Frédérick Madore") {
                        // IMPORTANT: Need a way to dispatch event from @html. 
                        // This approach breaks the on:click dispatch. Reverting temporarily.
                        // Using JS functions within @html is complex and potentially unsafe.
                        // Let's stick to template logic but be EXTREMELY precise with whitespace.
                        // html += `<button class="author-btn" data-author="${author}">${author}</button>`; // Cannot easily dispatch
                        html += `<span>${author}</span>`; // Fallback to span for now
                    } else {
                        html += `<span>${author}</span>`;
                    }
                    if (i < authorsArray.length - 1) {
                        html += ' and ';
                    } else {
                        html += '.';
                    }
                });
            }
        } else if (type === 'special-issue') {
            if (editors) {
                html += 'Edited by ';
                if (typeof editors === 'string') {
                    const editorsArray = editors.split(/\s*(?:,|and)\s*/).map(name => name.trim());
                    editorsArray.forEach((editor, i) => {
                         if (editor !== "Frédérick Madore") {
                            // html += `<button class="author-btn" data-editor="${editor}">${editor}</button>`; // Cannot easily dispatch
                            html += `<span>${editor}</span>`; // Fallback to span
                        } else {
                            html += `<span>${editor}</span>`;
                        }
                        if (i < editorsArray.length - 1) {
                            html += ', ';
                        } else {
                            html += '.';
                        }
                    });
                } 
                // Add logic for array editors if needed
            }
        }
        authorDisplayHtml = html;
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
                <a href="{base}/publications/{publication.id}" class="hover:text-primary">
                    {publication.title}
                </a>
            </h3>
            
            <div class="text-light mb-2">
                <!-- Render the pre-computed author/editor HTML -->
                {@html authorDisplayHtml}

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
                {:else if publication.type === 'encyclopedia'}
                    <!-- Specific encyclopedia handling remains for title linking etc -->
                    <span>"{publication.title}", </span>
                    <MetadataList metadata={publicationMetadata} /><span>.</span>
                {:else}
                    <!-- Use MetadataList for other types (article, chapter, report, etc.) -->
                    <MetadataList metadata={publicationMetadata} /><span>.</span>
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
                            class="tag-button text-sm"
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
        cursor: pointer; /* Add pointer cursor */
        border-radius: var(--border-radius-full); /* Make it pill-shaped */
        padding: var(--spacing-1) var(--spacing-2); /* Add padding */
        transition: all 0.2s ease;
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