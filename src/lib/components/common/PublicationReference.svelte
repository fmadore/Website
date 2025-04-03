<script lang="ts">
    import { allPublications } from '$lib/data/publications/index';
    import type { Publication } from '$lib/types';
    import { base } from '$app/paths';
    import { onMount, onDestroy, tick } from 'svelte';
    import { browser } from '$app/environment'; // Import browser

    // Prop: ID of the publication to reference
    export let id: string;

    // Find the publication data
    let publication: Publication | undefined = allPublications.find(p => p.id === id);

    let showPreview = false; // Controls visibility
    let isOpenedByClick = false; // Track if opened via click/tap
    let referenceElement: HTMLElement | null = null; // Bind to the main span
    let cardElement: HTMLElement | null = null; // Bind to the card div
    let closeTimeoutId: number | null = null; // Timeout ID for delayed close
    let positionClass = ''; // Class for positioning ('' or 'position-below')

    // --- Positioning Logic ---
    async function positionCard() {
        if (!browser || !referenceElement || !cardElement) return;

        await tick(); // Wait for Svelte state/DOM updates

        // Use requestAnimationFrame to measure after browser layout/paint
        requestAnimationFrame(() => {
            // Re-check elements exist in case they were removed quickly
            if (!cardElement || !referenceElement) return; 

            const refRect = referenceElement.getBoundingClientRect();
            const cardHeight = cardElement.offsetHeight;
            const spaceAbove = refRect.top;
            const spaceBelow = window.innerHeight - refRect.bottom;
            const margin = 15; // Required space including arrow etc.

            let newPositionClass = ''; // Determine desired class

            // Prefer position above unless not enough space
            if (spaceAbove >= cardHeight + margin) {
                newPositionClass = '';
            } else if (spaceBelow >= cardHeight + margin) {
                // Flip below if not enough space above BUT enough space below
                newPositionClass = 'position-below';
            } else {
                // Default to above if neither fits well (least bad option?)
                newPositionClass = '';
            }
            
            // Only update the Svelte state variable if the class needs to change
            // This prevents potential infinite loops if measurement fluctuates slightly
            if (positionClass !== newPositionClass) {
                positionClass = newPositionClass;
            }
        });
    }

    // Re-position when preview becomes visible
    $: if (showPreview && browser) {
        positionCard();
    } else if (!showPreview) {
        positionClass = ''; // Reset class when hidden
    }

    // --- Event Handlers ---

    function cancelCloseTimer() {
        if (closeTimeoutId) {
            clearTimeout(closeTimeoutId);
            closeTimeoutId = null;
        }
    }

    function startCloseTimer() {
        cancelCloseTimer(); // Clear any existing timer
        closeTimeoutId = window.setTimeout(() => {
            if (!isOpenedByClick) { // Only close if not opened by click
                 showPreview = false;
            }
            closeTimeoutId = null;
        }, 150); // 150ms delay
    }

    function handlePointerEnterReference() {
        cancelCloseTimer();
        if (!isOpenedByClick) {
            showPreview = true;
        }
    }

    function handlePointerLeaveReference() {
        startCloseTimer();
    }
    
    function handlePointerEnterCard() {
        // Entering the card also cancels the close timer
        cancelCloseTimer();
    }

    function handlePointerLeaveCard() {
        // Leaving the card restarts the close timer
        startCloseTimer();
    }

    function handleFocusIn() {
        cancelCloseTimer();
        if (!isOpenedByClick) {
            showPreview = true;
        }
    }

    function handleFocusOut(event: FocusEvent) {
        // Check if focus moved completely outside the component (span + card)
        if (referenceElement && !referenceElement.contains(event.relatedTarget as Node) && 
            cardElement && !cardElement.contains(event.relatedTarget as Node)) {
             if (!isOpenedByClick) {
                 showPreview = false;
             }
        }
        // If focus moves between span and card, don't close immediately
    }

    // Combined click/tap handler for the reference span
    function handleClick(event: MouseEvent | TouchEvent | KeyboardEvent) {
        // If the click/touch/key event originated inside the card, let it bubble naturally.
        // The span's handler should not interfere with card interactions.
        if (cardElement && cardElement.contains(event.target as Node)) {
            // Exception: If it was a keyboard event on the span itself, handle it.
            if (!(event instanceof KeyboardEvent && event.target === referenceElement)) {
                 return; 
            }
        }
        
        let targetElement = event.target as HTMLElement;
        let isTargetLink = targetElement.closest('.reference-link') !== null;

        if (!showPreview) {
            cancelCloseTimer(); // Ensure timer is cleared when opening via click
            showPreview = true;
            isOpenedByClick = true;
            if (!(event instanceof KeyboardEvent)) event.preventDefault(); 
        } else if (showPreview && isOpenedByClick) {
            if (isTargetLink && !(event instanceof KeyboardEvent)) {
                // Allow link navigation
            } else {
                showPreview = false;
                isOpenedByClick = false;
                if (!(event instanceof KeyboardEvent)) event.preventDefault();
            }
        } else if (showPreview && !isOpenedByClick) {
             cancelCloseTimer();
             isOpenedByClick = true; 
             if (!(event instanceof KeyboardEvent)) event.preventDefault();
        }
    }

    // Keyboard handler for accessibility
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            if (event.key === ' ') event.preventDefault();
            handleClick(event);
        }
        // Allow Escape key to close the card if opened by click
        if (event.key === 'Escape' && showPreview && isOpenedByClick) {
            showPreview = false;
            isOpenedByClick = false;
        }
    }

    // Global click listener to handle clicking outside
    function handleClickOutside(event: MouseEvent) {
        if (referenceElement && !referenceElement.contains(event.target as Node) && 
            cardElement && !cardElement.contains(event.target as Node)) { // Also check card
            if (showPreview && isOpenedByClick) {
                showPreview = false;
                isOpenedByClick = false;
            }
        }
    }

    // --- Lifecycle ---

    onMount(() => {
        if (browser) { // <-- Check if in browser
            document.addEventListener('click', handleClickOutside, true); // Use capture phase
        }
    });

    onDestroy(() => {
        if (browser) { // <-- Check if in browser
            document.removeEventListener('click', handleClickOutside, true);
        }
    });

    // --- Reactive Computations ---
    
    $: referenceText = publication 
        ? `(${(publication.authors?.[0]?.split(' ').pop() || 'N/A' )}, ${publication.date?.substring(0, 4) || 'N/D'})`
        : `(${id})`; 
</script>

{#if publication}
    <span 
        bind:this={referenceElement} 
        class:preview-visible={showPreview}
        class="publication-reference" 
        on:pointerenter={handlePointerEnterReference} 
        on:pointerleave={handlePointerLeaveReference}
        on:focusin={handleFocusIn}
        on:focusout={handleFocusOut}
        on:click={handleClick}
        on:touchstart={handleClick}
        on:keydown={handleKeyDown}
        tabindex="0"
        role="button"
        aria-haspopup="dialog"
        aria-expanded={showPreview}
        aria-controls="pub-preview-{id}"
    >
        <a 
            href="{base}/publications/{publication.id}" 
            class="reference-link" 
            aria-label="View publication: {publication.title}"
            tabindex="-1" 
        >
            {referenceText}
        </a>

        {#if showPreview}
            <div 
                bind:this={cardElement}
                class="preview-card {positionClass}"
                id="pub-preview-{id}" 
                role="dialog" 
                aria-label="Publication Preview"
                aria-modal="false"
                on:pointerenter={handlePointerEnterCard}
                on:pointerleave={handlePointerLeaveCard}
            >
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
        position: relative;
        display: inline-block; 
        cursor: pointer;
        -webkit-tap-highlight-color: transparent; /* Remove tap highlight on iOS */
    }

    .reference-link {
        color: var(--color-primary); 
        text-decoration: underline;
        text-decoration-style: dotted;
        font-size: 0.9em; 
        transition: color 0.2s ease, text-decoration-style 0.2s ease;
        pointer-events: none; /* Let span handle interactions */
    }
    
    .publication-reference:hover .reference-link,
    .publication-reference:focus .reference-link {
        color: var(--color-primary-dark); 
        text-decoration-style: solid;
    }
    
    .publication-reference:focus {
        outline: none; /* Remove default focus outline */
    }

    .preview-card {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        padding: 0; 
        width: 320px;
        max-width: 90vw;
        z-index: 1000; /* Increased z-index to appear above header */
        opacity: 0;
        visibility: hidden;
        transform: translateX(-50%) scale(0.95);
        transform-origin: bottom center;
        transition: opacity 0.15s ease-out, transform 0.15s ease-out, visibility 0s linear 0.15s;
        pointer-events: auto; 
        text-align: left; 
        font-size: var(--font-size-sm);
        line-height: 1.4; 
        color: var(--color-text); 
        overflow: hidden; 
    }
    
    /* Use class binding for visible state */
    .publication-reference.preview-visible .preview-card {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) scale(1);
        transition: opacity 0.2s ease-in, transform 0.2s ease-in, visibility 0s linear;
    }

    .card-image {
        width: 100%;
        height: auto;
        max-height: 100px;
        object-fit: cover; 
        display: block;
        border-bottom: 1px solid var(--color-border);
    }
    
    .card-content {
        padding: var(--spacing-3);
    }

    /* Arrow */
    .preview-card::after {
        content: '';
        position: absolute;
        top: 100%; 
        left: 50%;
        transform: translateX(-50%);
        border-width: 7px;
        border-style: solid;
        border-color: var(--color-background) transparent transparent transparent; 
        filter: drop-shadow(0 1px 0px rgba(0,0,0,0.08)); /* Adjusted shadow slightly */
    }
    
    /* Styles for when card is positioned below */
    .preview-card.position-below {
        bottom: auto; /* Override default bottom */
        top: calc(100% + 10px); /* Position below */
        transform-origin: top center; /* Adjust transform origin */
    }
    
    .preview-card.position-below::after {
        top: auto; /* Override default top */
        bottom: 100%; /* Position arrow above the card */
        border-color: transparent transparent var(--color-background) transparent; /* Flip arrow direction */
        filter: drop-shadow(0 -1px 0px rgba(0,0,0,0.08)); /* Adjust shadow */
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
        font-size: var(--font-size-base);
    }

    .card-authors, .card-date, .card-meta {
        margin-bottom: var(--spacing-1);
        color: var(--color-text-secondary);
        font-size: var(--font-size-xs);
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