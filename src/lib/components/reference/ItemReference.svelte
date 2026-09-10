<script lang="ts">
	/**
	 * ItemReference.svelte  ─────────────────────────────────────────────
	 * Inline reference that shows a hover/click‑activated preview card.
	 * Re‑written for improved readability, accessibility, and maintainability.
	 * Migrated to Svelte 5 with improved mobile support; flat Ink + Signal styling.
	 * ────────────────────────────────────────────────────────────────────
	 * Usage: <ItemReference id="my‑item‑id" />. When a historical id exists in
	 * both datasets, use `publication:id` or `communication:id` explicitly.
	 */

	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { crossfade, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { referenceIndex } from '$lib/data/referenceIndex.generated';

	import ReferenceLink from './ReferenceLink.svelte';
	import ReferencePreviewCard from './ReferencePreviewCard.svelte';
	import { portal } from '$lib/actions/portal';
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
	// Resolve the referenced item from the slim, build-time reference index. This
	// avoids importing the full publications/communications datasets (~117 KiB)
	// just to render a handful of inline citations. Historical cross-dataset
	// collisions are stored under explicit `publication:` / `communication:` keys.
	const entry = $derived(referenceIndex[id]);
	const item = $derived(entry);
	const itemType = $derived(entry?.itemType);

	/**
	 * An id the index cannot resolve is an authoring fault, not a reader's
	 * problem: the reader gets the citation as plain prose and the fault goes to
	 * the console, where the person who can fix it will see it. It should never
	 * reach production at all — `npm run gen:refs -- --check` resolves every
	 * `<ItemReference id>` in the source and fails CI on an unknown one.
	 */
	$effect(() => {
		if (!entry && import.meta.env.DEV) {
			console.error(`ItemReference: no record in the reference index for id "${id}"`);
		}
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
		if (!spanEl || !showPreview || !viaClick) return;
		const target = event.target as Node;
		// The preview card is portaled to document.body, so a click inside it
		// is NOT inside spanEl. Check the portaled wrapper by id so clicks on
		// the card don't dismiss the preview before its own handler runs.
		const previewEl = document.getElementById(`item-preview-${id}`);
		if (spanEl.contains(target)) return;
		if (previewEl && previewEl.contains(target)) return;
		togglePreview(false);
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

	/* Dismiss the preview before any navigation so it never lingers
	 * over the destination page. */
	beforeNavigate(() => {
		if (showPreview) togglePreview(false);
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
	<!-- Non-interactive positioning wrapper. The single interactive control is
	     the <a> inside ReferenceLink, which carries the popup role, ARIA state,
	     and all interaction handlers — so no button nests a link (WCAG 4.1.2). -->
	<!-- Whitespace is significant here: this <span> sits inline in running prose,
	     immediately followed by punctuation ("… (Madore, 2025), examines"). Any
	     newline between the last child and </span> renders as a space before that
	     comma, so the tags below deliberately abut. Do not reflow. -->
	<span bind:this={spanEl} class="item-reference {showPreview ? 'preview-visible' : ''}"
		><ReferenceLink
			{item}
			{itemType}
			{label}
			hasPopup
			isActive={showPreview}
			ariaExpanded={showPreview}
			ariaControls={showPreview ? `item-preview-${id}` : undefined}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			onfocus={handleFocus}
			onblur={handleBlur}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					togglePreview();
				}
				if (e.key === 'Escape') togglePreview(false);
			}}
			onclick={handleLinkClick}
		/>{#if showPreview}<div
				use:portal
				id="item-preview-{id}"
				class="reference-preview-wrapper"
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
					onclose={() => togglePreview(false)}
				/>
			</div>{/if}</span
	>
	<!-- Unresolved: the sentence keeps its citation, set as the prose around it.
	     No stamp, no brackets, no `--color-danger` — that ink is reserved for
	     form validation, and a citation the reader cannot act on is not their
	     error. The console carries the id; see the effect above. Written tight
	     for the same reason the branch above is: this sits inline in running
	     prose and any newline renders as a space before the next comma. -->
{:else}{label ?? id}{/if}

<style>
	.item-reference {
		position: relative;
		display: inline;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent; /* iOS */
		border-radius: 0;
		/* Explicit transition properties for better performance */
		transition: z-index var(--duration-moderate) var(--ease-in-out);
	}

	.item-reference.preview-visible {
		/* Preview visible — raise stacking context so popup card sits above siblings */
		z-index: var(--z-popover, 1060);
	}

	/* The wrapper uses `display: contents` so the popup card (position: fixed)
	 * doesn't inject a block-level box into the surrounding paragraph text and
	 * shove characters around when it appears. */
	.reference-preview-wrapper {
		display: contents;
	}

	/* Focus states */
	.item-reference:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-medium);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.item-reference {
			transition: none;
		}
	}
</style>
