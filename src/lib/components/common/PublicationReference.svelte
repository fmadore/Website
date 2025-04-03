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
        transition: color 0.2s ease, text-decoration-style 0.2s ease; /* Add transition */
    }
    
    .reference-link:hover, .reference-link:focus {
        color: var(--color-primary-dark); /* Darken color on hover */
        text-decoration-style: solid;
        outline: none; 
    }

    .preview-card {
        position: absolute;
        bottom: calc(100% + 10px); /* Increase space slightly */
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-background); /* Use variable */
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md); /* Use variable */
        box-shadow: var(--shadow-lg); /* Use variable */
        padding: 0; 
        width: 320px; /* Slightly wider */
        max-width: 90vw;
        z-index: 50; 
        opacity: 1;
        /* Add subtle fade-in transition */
        transition: opacity 0.2s ease-in-out, bottom 0.2s ease-in-out;
        pointer-events: none; 
        text-align: left; 
        font-size: var(--font-size-sm); /* Use base small font size */
        line-height: 1.4; 
        color: var(--color-text); 
        overflow: hidden; 
    }
    
    /* Hide initially for transition */
    .publication-reference:not(:hover):not(:focus-within) .preview-card {
        opacity: 0;
        bottom: calc(100% + 5px); /* Start closer for animation */
        visibility: hidden;
        transition: opacity 0.15s ease-out, bottom 0.15s ease-out, visibility 0s linear 0.15s;
    }
    
    /* Make visible on hover/focus */
    .publication-reference:hover .preview-card,
    .publication-reference:focus-within .preview-card {
        opacity: 1;
        bottom: calc(100% + 10px);
        visibility: visible;
        transition: opacity 0.2s ease-in, bottom 0.2s ease-in;
    }

    .card-image {
        width: 100%;
        height: auto;
        max-height: 100px; /* Slightly smaller max height */
        object-fit: cover; 
        display: block;
        border-bottom: 1px solid var(--color-border); /* Separator line */
    }
    
    .card-content {
        padding: var(--spacing-3); /* Use variable */
    }

    /* Small arrow pointing down */
    .preview-card::after {
        content: '';
        position: absolute;
        top: 100%; 
        left: 50%;
        transform: translateX(-50%);
        border-width: 7px; /* Slightly larger arrow */
        border-style: solid;
        border-color: var(--color-background) transparent transparent transparent; 
        /* Add shadow matching the card's border */
        filter: drop-shadow(0 1px 0px var(--color-border)); 
    }
    
    .card-link {
        text-decoration: none;
        color: inherit;
        display: block; 
    }

    .card-title {
        font-weight: 600; /* Use semibold */
        margin-bottom: var(--spacing-1);
        color: var(--color-primary); /* Use primary color */
        line-height: 1.3;
        font-size: var(--font-size-base); /* Slightly larger title */
    }

    .card-authors, .card-date, .card-meta {
        margin-bottom: var(--spacing-1);
        color: var(--color-text-secondary); /* Use secondary text color */
        font-size: var(--font-size-xs); /* Smaller meta text */
    }

    .card-meta em {
         font-style: italic;
     }

    .publication-reference-error {
        color: #d9534f; 
        font-style: italic;
        font-size: 0.9em;
        cursor: not-allowed;
    }
</style> 