<script lang="ts">
	/**
	 * ItemReference.svelte  ─────────────────────────────────────────────
	 * Inline reference that shows a hover/click‑activated preview card.
	 * Re‑written for improved readability, accessibility, and maintainability.
	 * Migrated to Svelte 5 with improved mobile support and glassmorphism design.
	 * ────────────────────────────────────────────────────────────────────
	 * Usage: <ItemReference id="my‑item‑id" />
	 */

	import { browser } from '$app/environment';
	import { crossfade, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { allPublications } from '$lib/data/publications/index';
	import { allCommunications } from '$lib/data/communications/index';
	import type { Publication, Communication } from '$lib/types';

	import ReferenceLink from './ReferenceLink.svelte';
	import ReferencePreviewCard from './ReferencePreviewCard.svelte';
	import { activeReferenceId } from '$lib/stores/activeItemReferenceStore';

	/* ───────────────────────────── Props ─────────────────────────────── */
	/** ID of the referenced item. */
	let { id }: { id: string } = $props();

	/* ────────────────────────── Cross‑fade setup ─────────────────────── */
	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut,
		fallback: (node: Element) => fade(node, { duration: 200, easing: quintOut })
	}); /* ───────────────────────── Derived data ──────────────────────────── */
	const item = $derived.by(() => {
		const publicationItem = allPublications.find((p) => p.id === id);
		if (publicationItem) return publicationItem;

		const communicationItem = allCommunications.find((c) => c.id === id);
		if (communicationItem) return communicationItem;

		return undefined;
	});

	const itemType = $derived.by(() => {
		const publicationItem = allPublications.find((p) => p.id === id);
		if (publicationItem) return 'publication' as const;

		const communicationItem = allCommunications.find((c) => c.id === id);
		if (communicationItem) return 'communication' as const;

		return undefined;
	});

	/* ──────────────────────── Local state ────────────────────────────── */
	let showPreview = $state(false); // Preview visibility state
	let viaClick = $state(false); // True if preview opened with click/tap
	let positionBelow = $state(false); // Position card above/below the link
	let spanEl = $state<HTMLElement>(); // Reference <span> element
	let closeTimer = $state<number | null>(null);
	let isTouchDevice = $state(false); // Detect if device supports touch

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
	$effect(() => {
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
		<ReferenceLink {item} {itemType} {id} hasPopup />
		{#if showPreview}
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
		border-radius: var(--border-radius);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.item-reference::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: var(--border-radius-md);
		opacity: 0;
		z-index: -1;
		
		/* Minimal glassmorphism for subtle hover effect */
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		
		/* Very subtle background that doesn't interfere with reading */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.02) 0%,
			rgba(var(--color-primary-rgb), 0.01) 50%,
			rgba(var(--color-accent-rgb), 0.005) 100%
		);
		
		/* Minimal border */
		border: 1px solid rgba(var(--color-primary-rgb), 0.1);
		
		/* Very subtle shadow */
		box-shadow: 
			0 2px 8px 0 rgba(31, 38, 135, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		
		transition: opacity 0.3s ease;
	}

	.item-reference:hover::before,
	.item-reference:focus::before {
		opacity: 1;
	}

	.item-reference.preview-visible {
		transform: var(--transform-lift-sm, translateY(-1px));
	}

	.item-reference.preview-visible::before {
		opacity: 1;
		
		/* Enhanced gradient for active state */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		
		/* Enhanced border */
		border-color: rgba(var(--color-primary-rgb), 0.2);
		
		/* Enhanced shadow */
		box-shadow: 
			0 8px 24px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.position-below {
		bottom: 100%;
	}

	.item-reference-error {
		color: #ef4444;
		font-style: italic;
		font-size: 0.9em;
		padding: 2px 6px;
		border-radius: var(--border-radius);
		cursor: not-allowed;
		
		/* Glassmorphism for error state */
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 0.1) 0%,
			rgba(239, 68, 68, 0.05) 100%
		);
		border: 1px solid rgba(239, 68, 68, 0.2);
		box-shadow: 
			0 4px 16px 0 rgba(239, 68, 68, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Focus states */
	.item-reference:focus {
		outline: 2px solid rgba(var(--color-primary-rgb), 0.5);
		outline-offset: 2px;
	}

	/* Dark mode glassmorphism adjustments */
	:global(html.dark) .item-reference::before {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-primary-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		
		border: 1px solid rgba(255, 255, 255, 0.1);
		
		box-shadow: 
			0 4px 16px 0 rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	:global(html.dark) .item-reference.preview-visible::before {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-primary-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		
		border-color: rgba(var(--color-primary-rgb), 0.3);
		
		box-shadow: 
			0 8px 24px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .item-reference-error {
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 0.15) 0%,
			rgba(239, 68, 68, 0.10) 100%
		);
		
		border-color: rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		
		box-shadow: 
			0 4px 16px 0 rgba(239, 68, 68, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.item-reference {
			transition: none;
		}
		
		.item-reference::before {
			transition: none;
		}
		
		.item-reference.preview-visible {
			transform: none;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.item-reference::before {
			border-width: 2px;
		}
		
		.item-reference-error {
			border-width: 2px;
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(4px)) {
		.item-reference::before {
			background: rgba(255, 255, 255, 0.8);
		}
		
		:global(html.dark) .item-reference::before {
			background: rgba(0, 0, 0, 0.7);
		}
		
		.item-reference-error {
			background: rgba(239, 68, 68, 0.1);
		}
		
		:global(html.dark) .item-reference-error {
			background: rgba(239, 68, 68, 0.15);
		}
	}
</style> 