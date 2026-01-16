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

	import ReferenceLink from './ReferenceLink.svelte';
	import ReferencePreviewCard from './ReferencePreviewCard.svelte';
	import {
		getActiveReferenceId,
		setActiveReferenceId
	} from '$lib/stores/activeItemReferenceStore.svelte';

	/* ───────────────────────────── Props ─────────────────────────────── */
	/** ID of the referenced item. */
	/** Optional custom label - if provided, displays this instead of (Author, Year) */
	let { id, label }: { id: string; label?: string } = $props();

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

	function startCloseTimer(delay = 300) {
		clearCloseTimer();
		closeTimer = window.setTimeout(() => {
			if (!viaClick) showPreview = false;
		}, delay);
	}
	/** Toggle preview; `force` overrides the natural toggle behaviour. */
	function togglePreview(force?: boolean) {
		showPreview = force ?? !showPreview;
		viaClick = showPreview;
		setActiveReferenceId(showPreview ? id : null);
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
			// Add a small delay before showing to avoid accidental triggers
			clearCloseTimer();
			closeTimer = window.setTimeout(() => {
				showPreview = true;
			}, 200);
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
		if (getActiveReferenceId() !== id && viaClick) {
			togglePreview(false);
		}
	});

	/* Re‑compute card position when preview toggles */
	$effect(() => {
		if (showPreview && spanEl) {
			const { top, bottom } = spanEl.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const previewHeight = 400; // Approximate max height of preview card
			const margin = 16;

			// Determine if we should position below based on available space
			const spaceAbove = top;
			const spaceBelow = viewportHeight - bottom;

			// Position below if:
			// 1. Not enough space above for the card
			// 2. AND there's more space below than above
			positionBelow = spaceAbove < previewHeight + margin && spaceBelow > spaceAbove;
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
		aria-label={isTouchDevice
			? showPreview
				? 'Close preview and view full details'
				: 'Click to preview this reference'
			: 'Hover to preview, click to view full details'}
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
		<ReferenceLink {item} {itemType} {id} {label} hasPopup isActive={showPreview} />
		{#if showPreview}
			<div
				id="item-preview-{id}"
				in:receive={{ key: `preview-${id}` }}
				out:send={{ key: `preview-${id}` }}
			>
				<ReferencePreviewCard
					{item}
					{itemType}
					referenceElement={spanEl}
					positionClass={positionBelow ? 'position-below' : ''}
					onpointerenter={clearCloseTimer}
					onpointerleave={handlePointerLeave}
				/>
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
		/* Explicit transition properties for better performance */
		transition:
			transform var(--duration-moderate) var(--ease-in-out),
			z-index var(--duration-moderate) var(--ease-in-out);
	}

	/* Touch device hint - subtle visual cue */
	.item-reference::after {
		content: '';
		position: absolute;
		top: calc(-1 * var(--space-0-5));
		right: calc(-1 * var(--space-0-5));
		width: var(--space-1-5);
		height: var(--space-1-5);
		background: var(--color-accent);
		border-radius: var(--border-radius-full);
		opacity: 0;
		transition: opacity var(--duration-normal) var(--ease-in-out);
		pointer-events: none;
	}

	/* Show indicator on touch devices when not active */
	@media (hover: none) and (pointer: coarse) {
		.item-reference:not(.preview-visible)::after {
			opacity: var(--opacity-60);
		}
	}

	.item-reference.preview-visible {
		/* Only apply a subtle lift when preview is visible, no background effects */
		transform: var(--transform-lift-sm);
		z-index: var(--z-popover, 1060);
	}

	.item-reference.preview-visible::after {
		opacity: 0;
	}

	.item-reference-error {
		color: var(--color-danger);
		font-style: italic;
		font-size: var(--font-size-sm);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius);
		cursor: not-allowed;

		/* Glassmorphism for error state using global values */
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-danger) calc(var(--opacity-15) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-danger) calc(var(--opacity-10) * 100%), transparent) 100%
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-danger) calc(var(--opacity-30) * 100%), transparent);
		box-shadow: var(--shadow-sm);
	}

	/* Focus states */
	.item-reference:focus {
		outline: var(--border-width-medium) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent);
		outline-offset: var(--border-width-medium);
	}

	/* Dark mode for error state only */
	:global(html.dark) .item-reference-error {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-danger) calc(var(--opacity-15) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-danger) calc(var(--opacity-10) * 100%), transparent) 100%
		);

		border-color: color-mix(
			in srgb,
			var(--color-danger) calc(var(--opacity-30) * 100%),
			transparent
		);
		color: color-mix(in srgb, var(--color-danger) calc(var(--opacity-80) * 100%), transparent);

		box-shadow:
			var(--shadow-sm),
			inset 0 var(--border-width-thin) 0 color-mix(in srgb, var(--color-white) 5%, transparent);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.item-reference {
			transition: none;
		}

		.item-reference.preview-visible {
			transform: none;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.item-reference-error {
			border-width: var(--border-width-medium);
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(var(--glass-blur-amount))) {
		.item-reference-error {
			background: color-mix(
				in srgb,
				var(--color-danger) calc(var(--opacity-10) * 100%),
				transparent
			);
		}

		:global(html.dark) .item-reference-error {
			background: color-mix(
				in srgb,
				var(--color-danger) calc(var(--opacity-15) * 100%),
				transparent
			);
		}
	}
</style>
