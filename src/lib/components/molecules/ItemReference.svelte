<script lang="ts">
    /**
     * ReferenceLinkWithPreview.svelte  ────────────────────────────────────────────
     * Inline reference that shows a hover/click‑activated preview card.
     * Re‑written for improved readability, accessibility, and maintainability.
     * ---------------------------------------------------------------------------
     * Usage: <ReferenceLinkWithPreview id="my‑item‑id" />
     */
  
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { crossfade, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { get } from 'svelte/store';
  
    import { allPublications } from '$lib/data/publications/index';
    import { allCommunications } from '$lib/data/communications/index';
    import type { Publication, Communication } from '$lib/types';
  
    import ReferenceLink from '$lib/components/atoms/ReferenceLink.svelte';
    import ReferencePreviewCard from '$lib/components/atoms/ReferencePreviewCard.svelte';
    import { activeReferenceId } from '$lib/stores/activeItemReferenceStore';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
  
    /* ───────────────────────────── Props ─────────────────────────────── */
    /** ID of the referenced item. */
    export let id: string;
  
    /* ────────────────────────── Cross‑fade setup ─────────────────────── */
    const [send, receive] = crossfade({
      duration: 300,
      easing: quintOut,
      fallback: (node: Element) => fade(node, { duration: 200, easing: quintOut })
    });
  
    /* ───────────────────────── Derived data ──────────────────────────── */
    let item: Publication | Communication | undefined;
    let itemType: 'publication' | 'communication' | undefined;

    const publicationItem = allPublications.find(p => p.id === id);
    if (publicationItem) {
      item = publicationItem;
      itemType = 'publication';
    } else {
      const communicationItem = allCommunications.find(c => c.id === id);
      if (communicationItem) {
        item = communicationItem;
        itemType = 'communication';
      }
    }
  
    /* ──────────────────────── Local state ────────────────────────────── */
    let showPreview = false;          // Preview visibility state
    let viaClick = false;             // True if preview opened with click/tap
    let positionBelow = false;        // Position card above/below the link
    let spanEl: HTMLElement;          // Reference <span> element
    let closeTimer: number | null = null;
    let isMobile = false;             // Mobile device detection
  
    /* ─────────────────────── Helper functions ────────────────────────── */
    function clearCloseTimer() {
      if (closeTimer !== null) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    }
  
    function startCloseTimer(delay = 150) {
      clearCloseTimer();
      closeTimer = window.setTimeout(() => {
        if (!viaClick) showPreview = false;
      }, delay);
    }
  
    /** Toggle preview; `force` overrides the natural toggle behaviour. */
    function togglePreview(force?: boolean) {
      showPreview = force ?? !showPreview;
      viaClick = showPreview;
      activeReferenceId.set(showPreview ? id : null);
    }
  
    function handleOutsideClick(event: MouseEvent) {
      if (!spanEl.contains(event.target as Node) && showPreview && viaClick) {
        togglePreview(false);
      }
    }

    function navigateToFullDetails() {
      if (!item || !itemType) return;
      
      const url = `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`;
      goto(url);
    }

    function checkIsMobile() {
      if (!browser) return;
      // Using a simple check for mobile viewports
      isMobile = window.innerWidth <= 768;
    }
  
    /* ───────────────────────── Lifecycle ─────────────────────────────── */
    onMount(() => {
      if (!browser) return;
  
      document.addEventListener('click', handleOutsideClick, true);
      window.addEventListener('resize', checkIsMobile);
      
      // Initial check for mobile
      checkIsMobile();
  
      return () => {
        document.removeEventListener('click', handleOutsideClick, true);
        window.removeEventListener('resize', checkIsMobile);
        clearCloseTimer();
      };
    });
  
    /* Close this preview if another one was opened via click */
    $: if (get(activeReferenceId) !== id && viaClick) {
      togglePreview(false);
    }
  
    /* Re‑compute card position when preview toggles */
    $: if (showPreview && spanEl) {
      const { top, bottom } = spanEl.getBoundingClientRect();
      const previewHeight = 250; // Approximate height; could be made reactive.
      positionBelow = window.innerHeight - bottom < previewHeight && top > previewHeight;
    }
  </script>
  
  {#if item && itemType}
    <span
      bind:this={spanEl}
      class="item-reference {showPreview ? 'preview-visible' : ''} {isMobile ? 'is-mobile' : ''}"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      aria-expanded={showPreview}
      aria-controls={showPreview ? `item-preview-${id}` : undefined}
  
      on:pointerenter={() => !viaClick && !isMobile && (showPreview = true)}
      on:pointerleave={() => !isMobile && startCloseTimer()}
      on:focus={() => !viaClick && !isMobile && (showPreview = true)}
      on:blur={() => !viaClick && !isMobile && (showPreview = false)}
  
      on:keydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePreview();
        }
        if (e.key === 'Escape') togglePreview(false);
      }}
  
      on:click={(e: MouseEvent) => {
        e.preventDefault();
        togglePreview();
      }}
    >
      <ReferenceLink {item} {itemType} {id} hasPopup />
  
      {#if showPreview}
        <div
          id="item-preview-{id}"
          in:receive={{ key: `preview-${id}` }}
          out:send={{ key: `preview-${id}` }}
          class:position-below={positionBelow}
          class:is-mobile={isMobile}
          on:pointerenter={clearCloseTimer}
          on:pointerleave={() => !isMobile && startCloseTimer()}
        >
          <ReferencePreviewCard {item} {itemType} referenceElement={spanEl} />
          
          {#if isMobile}
            <div class="mobile-controls">
              <button class="mobile-close-btn" on:click={() => togglePreview(false)}>Close</button>
              <button class="mobile-view-btn" on:click={navigateToFullDetails}>View full details</button>
            </div>
          {/if}
        </div>
      {/if}
    </span>
  {:else}
    <!-- Fallback if the ID is unknown -->
    <span class="item-reference-error">[Ref: {id}?]</span>
  {/if}
  
  <style>
    .item-reference {
      position: relative;
      display: inline-block;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent; /* iOS */
    }
  
    .item-reference.preview-visible {
      text-decoration: underline;
    }
  
    .position-below {
      bottom: 100%;
    }
  
    .item-reference-error {
      color: #d9534f;
      font-style: italic;
      font-size: 0.9em;
      cursor: not-allowed;
    }

    /* Mobile styles */
    .is-mobile {
      display: block;
      width: 100%;
      max-width: 90vw;
      margin: 0 auto;
    }

    .mobile-controls {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-3, 0.75rem);
      border-top: 1px solid var(--color-border, #e2e8f0);
      background: var(--color-background-alt, #f8fafc);
    }

    .mobile-close-btn,
    .mobile-view-btn {
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mobile-close-btn {
      background-color: transparent;
      color: var(--color-text, #1a202c);
      border: 1px solid var(--color-border, #e2e8f0);
    }

    .mobile-view-btn {
      background-color: var(--color-primary, #4a90e2);
      color: white;
      border: none;
    }

    /* Make the mobile preview fill more of the screen */
    div.is-mobile {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 90vw !important;
      max-width: 450px !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
      z-index: 1500 !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    }

    /* Hide the positioning arrow on mobile */
    div.is-mobile :global(.card-arrow) {
      display: none !important;
    }
  </style>
