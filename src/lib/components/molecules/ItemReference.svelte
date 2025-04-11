<script lang="ts">
    import { allPublications } from '$lib/data/publications/index';
    import { allCommunications } from '$lib/data/communications/index';
    import type { Publication, Communication } from '$lib/types';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import ReferenceLink from '$lib/components/atoms/ReferenceLink.svelte';
    import ReferencePreviewCard from '$lib/components/atoms/ReferencePreviewCard.svelte';

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
    let referenceElement: HTMLElement; // Bind to the main span
    let positionClass = ''; // Class for positioning ('' or 'position-below')
    let closeTimeoutId: number | null = null; // Timeout ID for delayed close

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
        // Check if focus moved completely outside the component
        const relatedTarget = event.relatedTarget as Node;
        const staysWithinComponent = 
            referenceElement.contains(relatedTarget) || 
            (document.querySelector(`#item-preview-${id}`) && 
             document.querySelector(`#item-preview-${id}`).contains(relatedTarget));
        
        if (!staysWithinComponent && !isOpenedByClick) {
            showPreview = false;
        }
    }

    // Combined click/tap handler for the reference span
    function handleClick(event: MouseEvent | TouchEvent | KeyboardEvent) {
        // Determine if this was within the card or on the span
        const targetElement = event.target as HTMLElement;
        const clickedWithinCard = document.querySelector(`#item-preview-${id}`) && 
                                 document.querySelector(`#item-preview-${id}`).contains(targetElement);
                                 
        // If clicked within card and not a keyboard event, let it bubble naturally
        if (clickedWithinCard && !(event instanceof KeyboardEvent)) {
            return;
        }
        
        // Handle the click based on current state
        if (!showPreview) {
            cancelCloseTimer();
            showPreview = true;
            isOpenedByClick = true;
            if (!(event instanceof KeyboardEvent)) event.preventDefault();
        } else if (showPreview && isOpenedByClick) {
            showPreview = false;
            isOpenedByClick = false;
            if (!(event instanceof KeyboardEvent)) event.preventDefault();
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
        const targetElement = event.target as HTMLElement;
        const clickedOutside = !referenceElement.contains(targetElement) && 
                              !(document.querySelector(`#item-preview-${id}`) && 
                                document.querySelector(`#item-preview-${id}`).contains(targetElement));
        
        if (clickedOutside && showPreview && isOpenedByClick) {
            showPreview = false;
            isOpenedByClick = false;
        }
    }

    // --- Lifecycle ---
    onMount(() => {
        if (browser) {
            document.addEventListener('click', handleClickOutside, true);
            
            // Calculate position class
            const handleResize = () => {
                if (showPreview && referenceElement) {
                    const refRect = referenceElement.getBoundingClientRect();
                    const previewHeight = 250; // Approximate preview card height
                    const spaceAbove = refRect.top;
                    const spaceBelow = window.innerHeight - refRect.bottom;
                    
                    // Update position class based on available space
                    if (spaceBelow >= previewHeight || spaceAbove < previewHeight) {
                        positionClass = 'position-below';
                    } else {
                        positionClass = '';
                    }
                }
            };
            
            window.addEventListener('resize', handleResize);
            
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    });

    onDestroy(() => {
        if (browser) {
            document.removeEventListener('click', handleClickOutside, true);
            cancelCloseTimer();
        }
    });
</script>

{#if item && itemType}
    <span 
        bind:this={referenceElement} 
        class="item-reference"
        class:preview-visible={showPreview}
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
        aria-controls={showPreview ? `item-preview-${id}` : undefined}
    >
        <ReferenceLink {item} {itemType} {id} hasPopup={true} />

        {#if showPreview}
            <div id="item-preview-{id}">
                <ReferencePreviewCard 
                    {item}
                    {itemType}
                    referenceElement={referenceElement}
                    {positionClass}
                    on:pointerenter={handlePointerEnterCard}
                    on:pointerleave={handlePointerLeaveCard}
                />
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
    
    .item-reference:hover,
    .item-reference:focus {
        outline: none; /* Remove default focus outline */
    }
    
    .item-reference-error {
        color: #d9534f; 
        font-style: italic;
        font-size: 0.9em;
        cursor: not-allowed;
    }
</style> 