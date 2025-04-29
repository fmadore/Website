<script lang="ts">
    import type { Publication } from '$lib/types/publication';
    import { createEventDispatcher } from 'svelte';
    import { base } from '$app/paths';
    import { truncateAbstract } from '$lib/utils/textUtils';
    // Import the necessary functions from the new formatter
    import { formatCitation, getAuthorsArray } from '$lib/utils/citationFormatter';
    import TagList from '$lib/components/molecules/TagList.svelte';
    
    export let publication: Publication;
    
    const dispatch = createEventDispatcher();
    
    // Reactive computation using the citation formatter
    $: formattedCitation = formatCitation(publication);

    // Define structure for display list items
    interface DisplayListItem {
        name: string;
        isClickable: boolean;
    }

    // Reactive computation for Author/Editor list (not HTML string)
    let displayList: DisplayListItem[] = [];
    let listPrefix = ''; // e.g., "Edited by "
    let authorString = ''; // Holds the fully formatted author/editor string
    $: {
        const type = publication.type;
        const authors = publication.authors;
        const editors = publication.editors;
        const selfName = "Frédérick Madore"; // Define self name

        let items: DisplayListItem[] = [];
        listPrefix = ''; // Reset prefix

        if (type === 'book' || type === 'article' || type === 'chapter' || type === 'encyclopedia' || type === 'report' || type === 'blogpost' || type === 'dissertation') {
            if (authors) {
                const authorsArray = getAuthorsArray(authors);
                items = authorsArray.map(author => ({
                    name: author,
                    isClickable: false // No longer needed, but keep structure for now
                }));
            }
        } else if (type === 'special-issue') {
            if (editors) {
                listPrefix = 'Edited by ';
                if (typeof editors === 'string') {
                    const editorsArray = editors.split(' and ').flatMap(part => part.split(', ')).map(name => name.trim()).filter(Boolean);
                    items = editorsArray.map(editor => ({
                        name: editor,
                        isClickable: false // No longer needed
                    }));
                }
                 // Add logic for array editors if needed
            }
        }
        // Handle advisors separately in the template as before
        // Handle prefacedBy separately in the template as before

        displayList = items;

        // Build the authorString
        let builtString = '';
        const listLength = displayList.length;
        displayList.forEach((item, i) => {
            builtString += item.name; // Add name
            if (i < listLength - 1) { // If not the last item
                // Use ', ' for all but the last join, which is ' and '.
                const separator = (i === listLength - 2) ? ' and ' : ', ';
                builtString += separator;
            }
        });
        authorString = builtString;
    }

</script>

<li class="p-0 list-none">
    <div class="card p-4">
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
                    <!-- Use typeLabel from formattedCitation -->
                    <span class="text-primary text-sm">{formattedCitation.typeLabel}</span>
                    {#if publication.language && publication.language.includes(',')}
                        <span class="text-light text-sm ml-2">({publication.language})</span>
                    {:else if publication.language && publication.language !== 'English'}
                        <span class="text-light text-sm ml-2">({publication.language})</span>
                    {/if}
                </div>
                
                <h3 class="text-default font-medium mb-2">
                    <a href="{base}/publications/{publication.id}" class="hover:text-primary">
                        {publication.title}
                    </a>
                </h3>
                
                <div class="text-light text-sm mb-2">
                    <!-- Render prefix and the constructed author string -->
                    {listPrefix}{authorString}
                     <!-- Space, then (Year). Only if year is defined -->
                     {#if formattedCitation.year} ({formattedCitation.year}). {/if}

                    <!-- Add type-specific prefixes before detailsHtml -->
                    {#if publication.type === 'dissertation'}
                        <span>"{publication.title}". </span>
                        {@html formattedCitation.detailsHtml}
                        <!-- Supervisor info remains separate -->
                        {#if publication.advisors && publication.advisors.length > 0}
                            <div class="mt-1">
                                <span>Supervised by </span>
                                {#each publication.advisors as advisor, i}
                                    {#if advisor !== "Frédérick Madore"}
                                        <button
                                            class="author-btn"
                                            on:click={() => dispatch('filterrequest', { type: 'author', value: advisor })}
                                        >
                                            {advisor}
                                        </button>
                                    {:else}
                                         <span>{advisor}</span>
                                    {/if}
                                    {#if i < publication.advisors.length - 1}
                                        <span> and </span>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                    {:else if publication.type === 'encyclopedia'}
                         <span>"{publication.title}". </span>
                         {@html formattedCitation.detailsHtml}
                     {:else}
                        <!-- Render details generated by formatter (covers article, chapter, book, report, special-issue, blogpost) -->
                        {@html formattedCitation.detailsHtml}
                    {/if}
                    
                    <!-- Preface information -->
                    {#if publication.prefacedBy}
                        <div class="mt-1">
                            <span>Preface by </span>
                             {#if publication.prefacedBy !== "Frédérick Madore"}
                                 <button
                                    class="author-btn"
                                    on:click={() => dispatch('filterrequest', { type: 'author', value: publication.prefacedBy || '' })}
                                >
                                    {publication.prefacedBy}
                                </button>
                             {:else}
                                <span>{publication.prefacedBy}</span>
                             {/if}
                        </div>
                    {/if}
                </div>
                
                {#if publication.abstract}
                    <div class="text-light text-sm mb-4">
                        {truncateAbstract(publication.abstract)}
                    </div>
                {/if}
                
                {#if publication.tags && publication.tags.length > 0}
                    <TagList tags={publication.tags} baseUrl="/publications?tag=" sectionTitle="" sectionClass="mt-3" listClass="flex flex-wrap gap-2" />
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

    /* Replace with hover:shadow-md utility */
    /*
    .hover-shadow:hover {
        box-shadow: var(--shadow-md);
    }
    */
    
    /* Replace with font-medium utility */
    /*
    .font-weight-500 {
        font-weight: 500;
    }
    */
    
    /* Replace with text-sm utility */
    /*
    .text-sm {
        font-size: 0.875rem;
    }
    */
    
    /* Replace with ml-2 utility */
    /*
    .ml-2 {
        margin-left: 0.5rem;
    }
    */
    
    .publication-cover-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: var(--shadow-md);
    }
</style> 