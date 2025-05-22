<script lang="ts">
    /**
     * ReferenceLinkWithPreview.svelte  ────────────────────────────────────────────
     * Inline reference that shows a hover/click‑activated preview card.
     * Re‑written for improved readability, accessibility, and maintainability.
     * Migrated to Svelte 5 with improved mobile support.
     * ---------------------------------------------------------------------------
     * Usage: <ReferenceLinkWithPreview id="my‑item‑id" />
     */
  
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { crossfade, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
  
    import { allPublications } from '$lib/data/publications/index';
    import { allCommunications } from '$lib/data/communications/index';
    import type { Publication, Communication } from '$lib/types';
  
    import ReferenceLink from '$lib/components/atoms/ReferenceLink.svelte';
    import ReferencePreviewCard from '$lib/components/atoms/ReferencePreviewCard.svelte';
    import { activeReferenceId } from '$lib/stores/activeItemReferenceStore';
  
    /* ───────────────────────────── Props ─────────────────────────────── */
    /** ID of the referenced item. */
    let { id }: { id: string } = $props();
  
    /* ────────────────────────── Cross‑fade setup ─────────────────────── */
    const [send, receive] = crossfade({
      duration: 300,
      easing: quintOut,
      fallback: (node: Element) => fade(node, { duration: 200, easing: quintOut })
    });    /* ───────────────────────── Derived data ──────────────────────────── */
    const item = $derived.by(() => {
      const publicationItem = allPublications.find(p => p.id === id);
      if (publicationItem) return publicationItem;
      
      const communicationItem = allCommunications.find(c => c.id === id);
      if (communicationItem) return communicationItem;
      
      return undefined;
    });
    
    const itemType = $derived.by(() => {
      const publicationItem = allPublications.find(p => p.id === id);
      if (publicationItem) return 'publication' as const;
      
      const communicationItem = allCommunications.find(c => c.id === id);
      if (communicationItem) return 'communication' as const;
      
      return undefined;
    });
  
    /* ──────────────────────── Local state ────────────────────────────── */
    let showPreview = $state(false);          // Preview visibility state
    let viaClick = $state(false);             // True if preview opened with click/tap
    let positionBelow = $state(false);        // Position card above/below the link
    let spanEl = $state<HTMLElement>();       // Reference <span> element
    let closeTimer = $state<number | null>(null);
    let isTouchDevice = $state(false);        // Detect if device supports touch
  
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
      if (spanEl && !spanEl.contains(event.target as Node) && showPreview && viaClick) {
        togglePreview(false);
      }
    }

    function handleLinkClick(event: MouseEvent) {
      // On touch devices, first click opens preview, second click follows link
      if (isTouchDevice) {
        if (!showPreview) {
          event.preventDefault();
          togglePreview(true);
        }
        // If preview is already open, let the link work normally
      } else {
        // On non-touch devices, prevent default and just toggle preview
        event.preventDefault();
        togglePreview();
      }
    }

    function handlePointerEnter() {
      // Only auto-show on hover for non-touch devices
      if (!isTouchDevice && !viaClick) {
        showPreview = true;
      }
    }

    function handlePointerLeave() {
      // Only auto-hide on non-touch devices
      if (!isTouchDevice) {
        startCloseTimer();
      }
    }

    function handleFocus() {
      // Only auto-show on focus for non-touch devices
      if (!isTouchDevice && !viaClick) {
        showPreview = true;
      }
    }

    function handleBlur() {
      // Only auto-hide on blur for non-touch devices
      if (!isTouchDevice && !viaClick) {
        showPreview = false;
      }
    }
    /* ───────────────────────── Lifecycle ─────────────────────────────── */
    onMount(() => {
      if (!browser) return;

      // Detect touch capability
      isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
      document.addEventListener('click', handleOutsideClick, true);
  
      return () => {
        document.removeEventListener('click', handleOutsideClick, true);
        clearCloseTimer();
      };
    });
  
    /* Close this preview if another one was opened via click */
    $effect(() => {
      if ($activeReferenceId !== id && viaClick) {
        togglePreview(false);
      }
    });
  
    /* Re‑compute card position when preview toggles */
    $effect(() => {
      if (showPreview && spanEl) {
        const { top, bottom } = spanEl.getBoundingClientRect();
        const previewHeight = 250; // Approximate height; could be made reactive.
        positionBelow = window.innerHeight - bottom < previewHeight && top > previewHeight;
      }
    });
  </script>
    {#if item && itemType}
    <span
      bind:this={spanEl}
      class="item-reference {showPreview ? 'preview-visible' : ''}"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      aria-expanded={showPreview}
      aria-controls={showPreview ? `item-preview-${id}` : undefined}
  
      onpointerenter={handlePointerEnter}
      onpointerleave={handlePointerLeave}
      onfocus={handleFocus}
      onblur={handleBlur}
  
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePreview();
        }
        if (e.key === 'Escape') togglePreview(false);
      }}
  
      onclick={handleLinkClick}
    >
      <ReferenceLink {item} {itemType} {id} hasPopup />      {#if showPreview}
        <div
          id="item-preview-{id}"
          in:receive={{ key: `preview-${id}` }}
          out:send={{ key: `preview-${id}` }}
          class:position-below={positionBelow}
          onpointerenter={clearCloseTimer}
          onpointerleave={handlePointerLeave}
        >
          <ReferencePreviewCard {item} {itemType} referenceElement={spanEl} />
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
  </style>
  