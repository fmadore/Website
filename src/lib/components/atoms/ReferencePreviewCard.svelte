<script lang="ts">
    import { onMount, createEventDispatcher, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import type { Publication, Communication } from '$lib/types';
    import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let item: Publication | Communication;
    export let itemType: 'publication' | 'communication';
    export let referenceElement: HTMLElement | null = null;
    export let positionClass: string = '';
    
    const dispatch = createEventDispatcher();
    
    let cardElement: HTMLElement;
    let isPositioned = false;
    let isClicked = false;
    let isMobile = false;
    
    // Helper function to get year consistently
    function getYear(item: Publication | Communication): string {
        if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
        if ('date' in item && item.date) return item.date.substring(0, 4);
        if ('year' in item && item.year) return item.year.toString();
        return 'N/D';
    }
    
    $: itemUrl = item && itemType
        ? `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`
        : '#';
        
    // Consolidate image source logic
    $: imageSrc = item && (('heroImage' in item && item.heroImage?.src) || ('image' in item && item.image))
        ? `${base}/${('heroImage' in item && item.heroImage?.src) || ('image' in item && item.image)}`
        : null;
          onMount(() => {
        if (!browser) return;
        
        // Check if we're on mobile
        isMobile = window.innerWidth <= 768;
        
        // Let the animation start first when component mounts
        tick().then(() => {
            // Position the card after a short delay to allow initial animations
            setTimeout(() => {
                if (!isMobile) {
                    positionCard();
                }
                isPositioned = true;
            }, 50);
        });
        
        // Add resize listener for mobile detection
        const handleResize = () => {
            isMobile = window.innerWidth <= 768;
            if (!isMobile) {
                positionCard();
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    function positionCard() {
        if (!browser || !referenceElement || !cardElement) return;
        
        // Use requestAnimationFrame to measure after browser layout/paint
        requestAnimationFrame(() => {
            const refRect = referenceElement.getBoundingClientRect();
            const cardWidth = cardElement.offsetWidth;
            const viewportWidth = window.innerWidth;
            
            // Calculate how much the card would overflow on each side if centered on refCenter
            const refCenter = refRect.left + (refRect.width / 2);
            const halfCardWidth = cardWidth / 2;
            const leftOverflow = halfCardWidth - refCenter;
            const rightOverflow = (refCenter + halfCardWidth) - viewportWidth;
            
            // Calculate the horizontal offset to keep card fully in viewport
            let horizontalOffset = 0;
            
            if (leftOverflow > 0) {
                // Would overflow left edge, shift right
                horizontalOffset = leftOverflow;
            } else if (rightOverflow > 0) {
                // Would overflow right edge, shift left
                horizontalOffset = -rightOverflow;
            }
            
            // Apply horizontal offset
            cardElement.style.left = `calc(50% + ${horizontalOffset}px)`;
            
            // Position arrow to point at reference element
            const arrowElement = cardElement.querySelector('.card-arrow') as HTMLElement;
            if (arrowElement) {
                arrowElement.style.left = `calc(50% - ${horizontalOffset}px)`;
            }
        });
    }
    
    function handlePointerEnter() {
        dispatch('pointerenter');
    }
    
    function handlePointerLeave() {
        dispatch('pointerleave');
    }

    // Handle card click with animation
    async function handleCardClick(event: MouseEvent) {
        event.preventDefault();
        
        // If we're on mobile, we have dedicated buttons for navigation
        // so don't navigate on card click
        if (isMobile) return;
        
        if (isClicked) return;
        isClicked = true;
        
        // Apply click effect
        if (cardElement) {
            cardElement.classList.add('card-clicked');
            
            // Delay navigation to allow animation to complete
            setTimeout(() => {
                goto(itemUrl);
            }, 300);
        }
    }
</script>

<div 
    bind:this={cardElement}
    class="preview-card {positionClass}"
    class:positioned={isPositioned}
    class:card-clicked={isClicked}
    class:is-mobile={isMobile}
    role="dialog" 
    aria-label="Item Preview"
    aria-modal="false"
    on:pointerenter={handlePointerEnter}
    on:pointerleave={handlePointerLeave}
>
    <a 
        href={itemUrl} 
        class="card-link" 
        tabindex="-1"
        on:click={handleCardClick}
    >
        <div class="card-content-wrapper">
            {#if imageSrc}
                <img 
                    src={imageSrc} 
                    alt={item.title} 
                    class="card-image"
                    loading="lazy"
                />
            {/if}
            <div class="card-content">
                <h4 class="card-title">{item.title}</h4>
                {#if item.authors && item.authors.length > 0}
                    <p class="card-authors">{item.authors.join(', ')}</p>
                {/if}
                <p class="card-date">{item.date || getYear(item)}</p>
                {#if itemType === 'publication'}
                    {#if item.type === 'article' && 'journal' in item && item.journal}
                        <p class="card-meta"><em>{item.journal}</em></p>
                    {:else if item.type === 'chapter' && 'book' in item && item.book}
                        <p class="card-meta">In: <em>{item.book}</em></p>
                    {:else if item.type === 'book' && 'publisher' in item && item.publisher}
                        <p class="card-meta">{item.publisher}</p>
                    {:else if item.type === 'special-issue' && 'journal' in item && item.journal}
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
                
                <div class="view-more-hint" class:visible-mobile={isMobile}>
                    <span class="hint-text">View full details</span>
                    <span class="hint-arrow">→</span>
                </div>
            </div>
        </div>
    </a>
    <span class="card-arrow"></span>
</div>

<style>
    .preview-card {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        padding: 0; 
        width: 320px;
        max-width: 90vw;
        z-index: 1000;
        pointer-events: auto; 
        text-align: left; 
        font-size: var(--font-size-sm);
        line-height: 1.4; 
        color: var(--color-text); 
        overflow: hidden;
        /* Initial opacity for animation */
        opacity: 0.9;
        transform: translateX(-50%) scale(0.98);
        transition: opacity 0.15s ease-out, transform 0.15s ease-out, 
                    box-shadow 0.3s ease-out, border-color 0.3s ease-out;
    }
    
    .preview-card.positioned {
        opacity: 1;
        transform: translateX(-50%) scale(1);
    }

    .preview-card.card-clicked {
        box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04));
        transform: translateX(-50%) scale(1.03);
        border-color: var(--color-primary, #4a90e2);
        opacity: 0.9;
    }
    
    /* Position below variant */
    .preview-card.position-below {
        bottom: auto;
        top: calc(100% + 10px);
    }
    
    /* Mobile specific styling */
    .preview-card.is-mobile {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 90vw;
        width: 350px;
        max-height: 80vh;
        z-index: 1500;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .card-content-wrapper {
        position: relative;
        overflow: hidden;
    }
    
    .card-image {
        width: 100%;
        height: auto;
        max-height: 100px;
        object-fit: cover; 
        display: block;
        border-bottom: 1px solid var(--color-border);
        transition: transform 0.3s ease-out;
    }
    
    .card-content {
        padding: var(--spacing-3);
        position: relative;
    }
    
    .view-more-hint {
        margin-top: var(--spacing-2);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        opacity: 0;
        transform: translateX(-10px);
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    
    /* Always show the hint on mobile */
    .view-more-hint.visible-mobile {
        opacity: 1;
        transform: translateX(0);
        font-weight: 500;
        font-size: var(--font-size-sm);
    }
    
    .hint-arrow {
        margin-left: var(--spacing-1);
        font-size: 1.1em;
    }
    
    .card-link {
        text-decoration: none;
        color: inherit;
        display: block;
    }
    
    .card-link:hover .view-more-hint,
    .card-link:focus .view-more-hint {
        opacity: 1;
        transform: translateX(0);
    }
    
    .card-link:hover .card-image,
    .card-link:focus .card-image {
        transform: scale(1.05);
    }
      .card-arrow {
        position: absolute;
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-width: 7px;
        border-style: solid;
        border-color: var(--color-background) transparent transparent;
        filter: drop-shadow(0 1px 0px rgba(0,0,0,0.08));
    }
    
    .position-below .card-arrow {
        bottom: auto;
        top: -14px;
        border-color: transparent transparent var(--color-background);
        filter: drop-shadow(0 -1px 0px rgba(0,0,0,0.08));
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
    
    /* Additional mobile styling */
    @media (max-width: 768px) {
        .card-image {
            max-height: 150px;
        }
        
        .card-content {
            padding: var(--spacing-4, 1rem);
        }
        
        .card-title {
            font-size: var(--font-size-lg, 1.125rem);
        }
        
        .card-authors, .card-date, .card-meta {
            font-size: var(--font-size-sm, 0.875rem);
        }
    }
</style>