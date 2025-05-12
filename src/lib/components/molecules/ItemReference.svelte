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
    const item: Publication | Communication | undefined =
      allPublications.find(p => p.id === id) ??
      allCommunications.find(c => c.id === id);
  
    const itemType: 'publication' | 'communication' | undefined =
      item && 'journal' in item ? 'publication' : item ? 'communication' : undefined;
  
    /* ──────────────────────── Local state ────────────────────────────── */
    let showPreview = false;          // Preview visibility state
    let viaClick = false;             // True if preview opened with click/tap
    let positionBelow = false;        // Position card above/below the link
    let spanEl: HTMLElement;          // Reference <span> element
    let closeTimer: number | null = null;
  
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
  
    /* ───────────────────────── Lifecycle ─────────────────────────────── */
    onMount(() => {
      if (!browser) return;
  
      document.addEventListener('click', handleOutsideClick, true);
  
      return () => {
        document.removeEventListener('click', handleOutsideClick, true);
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
      class="item-reference {showPreview ? 'preview-visible' : ''}"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      aria-expanded={showPreview}
      aria-controls={showPreview ? `item-preview-${id}` : undefined}
  
      on:pointerenter={() => !viaClick && (showPreview = true)}
      on:pointerleave={() => startCloseTimer()}
      on:focus={() => !viaClick && (showPreview = true)}
      on:blur={() => !viaClick && (showPreview = false)}
  
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
          on:pointerenter={clearCloseTimer}
          on:pointerleave={() => startCloseTimer()}
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
  