<script lang="ts">
    import { allPublications } from '$lib/data/publications/index';
    import type { Publication } from '$lib/types';
    import { base } from '$app/paths';

    // Prop: ID of the publication to reference
    export let id: string;

    // Find the publication data
    let publication: Publication | undefined = allPublications.find(p => p.id === id);

    // State for hover visibility
    let showPreview = false;

    function handleMouseOver() {
        showPreview = true;
    }

    function handleMouseOut() {
        showPreview = false;
    }

    // Generate a short reference string (e.g., Author Year)
    $: referenceText = publication 
        ? `(${(publication.authors?.[0]?.split(' ').pop() || 'N/A' )}, ${publication.date?.substring(0, 4) || 'N/D'})`
        : `(${id})`; 
</script>

{#if publication}
    <span 
        class="publication-reference" 
        on:mouseenter={handleMouseOver} 
        on:mouseleave={handleMouseOut}
        on:focusin={handleMouseOver}
        on:focusout={handleMouseOut}
        tabindex="0"
        role="link"
        aria-describedby="pub-preview-{id}"
    >
        <a href="{base}/publications/{publication.id}" class="reference-link" aria-label="View publication: {publication.title}">
            {referenceText}
        </a>

        {#if showPreview}
            <div class="preview-card" id="pub-preview-{id}" role="tooltip">
                <a href="{base}/publications/{publication.id}" class="card-link" tabindex="-1">
                    {#if publication.heroImage?.src || publication.image}
                        <img 
                            src="{base}/{publication.heroImage?.src || publication.image}" 
                            alt="{publication.title}" 
                            class="card-image"
                        />
                    {/if}
                    <div class="card-content">
                        <h4 class="card-title">{publication.title}</h4>
                        {#if publication.authors}
                            <p class="card-authors">{publication.authors.join(', ')}</p>
                        {/if}
                        <p class="card-date">{publication.date}</p>
                        {#if publication.type === 'article' && publication.journal}
                            <p class="card-meta"><em>{publication.journal}</em></p>
                        {:else if publication.type === 'chapter' && publication.book}
                            <p class="card-meta">In: <em>{publication.book}</em></p>
                        {:else if publication.type === 'book' && publication.publisher}
                            <p class="card-meta">{publication.publisher}</p>
                         {:else if publication.type === 'special-issue' && publication.journal}
                            <p class="card-meta">Special Issue: <em>{publication.journal}</em></p>
                        {/if}
                    </div>
                </a>
            </div>
        {/if}
    </span>
{:else}
    <!-- Fallback if publication ID is not found -->
    <span class="publication-reference-error">[Pub: {id}?]</span>
{/if}

<style>
    .publication-reference {
        position: relative; /* Needed for absolute positioning of the card */
        display: inline-block; 
        cursor: help; /* Indicate interactivity */
    }

    .reference-link {
        color: var(--color-primary); 
        text-decoration: underline;
        text-decoration-style: dotted;
        font-size: 0.9em; 
    }
    
    .reference-link:hover, .reference-link:focus {
        text-decoration-style: solid;
        outline: none; /* Remove default focus outline if custom style is applied or not needed */
    }

    .preview-card {
        position: absolute;
        bottom: calc(100% + 8px); /* Position above the reference with some space */
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        padding: 0; /* Remove padding to let image/content fill */
        width: 300px; /* Max width */
        max-width: 80vw;
        z-index: 50; /* Ensure it's above other content */
        opacity: 1;
        transition: opacity 0.15s ease-in-out;
        pointer-events: none; /* Prevent card from blocking hover on reference */
        text-align: left; 
        font-size: 0.8rem; 
        line-height: 1.4; 
        color: var(--color-text); 
        overflow: hidden; /* Ensure image corners are rounded */
    }

    .card-image {
        width: 100%;
        height: auto;
        max-height: 120px; /* Limit image height */
        object-fit: cover; /* Cover the area */
        display: block;
    }
    
    .card-content {
        padding: var(--spacing-3); /* Add padding back for text content */
    }

    .card-link {
        text-decoration: none;
        color: inherit;
        display: block; 
    }

    .card-title {
        font-weight: 600;
        margin-bottom: var(--spacing-1);
        color: var(--color-primary); 
        line-height: 1.3;
    }

    .card-authors, .card-date, .card-meta {
        margin-bottom: var(--spacing-1);
        color: var(--color-text-secondary); 
    }

    .card-meta em {
         font-style: italic;
     }

    .publication-reference-error {
        color: #d9534f; /* Bootstrap danger color */
        font-style: italic;
        font-size: 0.9em;
        cursor: not-allowed;
    }
</style> 