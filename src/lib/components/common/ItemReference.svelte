<script lang="ts">
    import { allPublications } from '$lib/data/publications/index';
    import { allCommunications } from '$lib/data/communications/index';
    import type { Publication, Communication } from '$lib/types';
    import { base } from '$app/paths';
    import { onMount, onDestroy, tick } from 'svelte';
    import { browser } from '$app/environment'; // Import browser

    // Prop: ID of the item to reference
    export let id: string;

    // Find the item data and type
    let item: Publication | Communication | undefined;
    let itemType: 'publication' | 'communication' | undefined;

    // Search logic
    $: {
        item = allPublications.find(p => p.id === id);
        if (item) {
            itemType = 'publication';
        } else {
            item = allCommunications.find(c => c.id === id);
            if (item) {
                itemType = 'communication';
            }
        }
    }

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
    
    // Helper to get year consistently
    function getYear(item: Publication | Communication): string {
        if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
        if ('date' in item && item.date) return item.date.substring(0, 4);
        if ('year' in item && item.year) return item.year.toString();
        return 'N/D';
    }

    // Helper to get first author's last name
    function getFirstAuthorLastName(item: Publication | Communication): string {
        const authors = item.authors;
        if (authors && authors.length > 0 && typeof authors[0] === 'string') {
            return authors[0].split(' ').pop() || 'N/A';
        }
        return 'N/A';
    }

    $: referenceText = item
        ? `(${getFirstAuthorLastName(item)}, ${getYear(item)})`
        : `(${id})`; 

    $: itemUrl = item && itemType
        ? `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`
        : '#';

    $: ariaLabel = item
        ? `View ${itemType || 'item'}: ${item.title}`
        : `Reference ${id}`;

    // Consolidate image source logic
    $: imageSrc = item && (('heroImage' in item && item.heroImage?.src) || ('image' in item && item.image))
        ? `${base}/${('heroImage' in item && item.heroImage?.src) || ('image' in item && item.image)}`
        : null;
</script>

{#if item && itemType}
    <span 
        bind:this={referenceElement} 
        class:preview-visible={showPreview}
        class="item-reference"
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
        aria-controls="item-preview-{id}"
    >
        <a 
            href={itemUrl} 
            class="reference-link" 
            aria-label={ariaLabel}
            tabindex="-1" 
        >
            {referenceText}
        </a>

        {#if showPreview}
            <div 
                bind:this={cardElement}
                class="preview-card {positionClass}"
                id="item-preview-{id}" 
                role="dialog" 
                aria-label="Item Preview"
                aria-modal="false"
                on:pointerenter={handlePointerEnterCard}
                on:pointerleave={handlePointerLeaveCard}
            >
                <a href={itemUrl} class="card-link" tabindex="-1">
                    {#if imageSrc}
                        <img 
                            src={imageSrc} 
                            alt={item.title} 
                            class="card-image"
                        />
                    {/if}
                    <div class="card-content">
                        <h4 class="card-title">{item.title}</h4>
                        {#if item.authors && item.authors.length > 0}
                            <p class="card-authors">{item.authors.join(', ')}</p>
                        {/if}
                        <p class="card-date">{item.date || getYear(item)}</p>
                        {#if itemType === 'publication'}
                            {#if item.type === 'article' && item.journal}
                                <p class="card-meta"><em>{item.journal}</em></p>
                            {:else if item.type === 'chapter' && item.book}
                                <p class="card-meta">In: <em>{item.book}</em></p>
                            {:else if item.type === 'book' && item.publisher}
                                <p class="card-meta">{item.publisher}</p>
                            {:else if item.type === 'special-issue' && item.journal}
                                <p class="card-meta">Special Issue: <em>{item.journal}</em></p>
                            {/if}
                        {:else if itemType === 'communication'}
                            {#if item.type}
                                <p class="card-meta">Type: {item.type}</p>
                            {/if}
                            {#if 'event' in item && item.event}
                                <p class="card-meta">Event: {item.event}</p>
                            {/if}
                            {#if 'conference' in item && item.conference}
                                <p class="card-meta">Conference: {item.conference}</p>
                            {/if}
                            {#if 'location' in item && item.location}
                                <p class="card-meta">Location: {item.location}</p>
                            {/if}
                        {/if}
                    </div>
                </a>
            </div>
        {/if}
    </span>
{:else}
    <!-- Fallback if item ID is not found -->
    <span class="item-reference-error">[Ref: {id}?]</span>
{/if}

<style>
    .item-reference {
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
    
    .item-reference:hover .reference-link,
    .item-reference:focus .reference-link {
        color: var(--color-primary-dark); 
        text-decoration-style: solid;
    }
    
    .item-reference:focus {
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
    .item-reference.preview-visible .preview-card {
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

    .item-reference-error {
        color: #d9534f; 
        font-style: italic;
        font-size: 0.9em;
        cursor: not-allowed;
    }
</style> 