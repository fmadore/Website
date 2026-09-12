<script lang="ts">
	import { tick } from 'svelte';
	import type { NavItem } from '$lib/types/navigation';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
	import MobileNavItem from '$lib/components/menu/MobileNavItem.svelte';
	import { resolve } from '$app/paths';

	let {
		navItems,
		isActive = false,
		onCloseMenu
	}: {
		navItems: NavItem[];
		isActive?: boolean;
		onCloseMenu: () => void;
	} = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let closeButtonEl: HTMLButtonElement | null = $state(null);
	let previouslyFocused: HTMLElement | null = null;

	// Move focus into the menu when it opens and restore it to the element
	// that triggered opening (the hamburger) when it closes.
	$effect(() => {
		if (isActive) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			tick().then(() => {
				closeButtonEl?.focus();
			});
		} else if (previouslyFocused) {
			previouslyFocused.focus?.();
			previouslyFocused = null;
		}
	});

	function getFocusable(): HTMLElement[] {
		if (!containerEl) return [];
		return Array.from(
			containerEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('aria-hidden'));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isActive) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			onCloseMenu();
			return;
		}

		if (event.key !== 'Tab') return;

		const focusable = getFocusable();
		if (focusable.length === 0) return;

		const first = focusable[0]!;
		const last = focusable[focusable.length - 1]!;
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
	id="mobile-menu"
	class="mobile-nav-container"
	class:active={isActive}
	bind:this={containerEl}
	inert={!isActive}
>
	<nav class="mobile-nav" aria-label="Mobile navigation">
		<!-- Masthead strip — the menu opens as the top of the press page. -->
		<div class="mobile-nav-header">
			<a href={resolve('/')} class="mobile-site-title" onclick={onCloseMenu}> Frédérick Madore </a>

			<div class="mobile-nav-controls">
				<ThemeToggle size={18} />

				<!-- Close button -->
				<button
					class="mobile-close-button"
					onclick={onCloseMenu}
					aria-label="Close navigation menu"
					bind:this={closeButtonEl}
				>
					<span class="mobile-close-line"></span>
					<span class="mobile-close-line"></span>
				</button>
			</div>
		</div>

		<span class="mobile-nav-eyebrow" aria-hidden="true">Navigation</span>

		<ul class="mobile-nav-list">
			{#each navItems as item (item.path)}
				<MobileNavItem {item} onnavigate={onCloseMenu} />
			{/each}
		</ul>
	</nav>
</div>

<style>
	/*
	 * Mobile menu — the masthead, full-bleed. Not an overlay panel with glass
	 * and shadow: it is the top of the press page pulled down over the body.
	 * Solid warm-paper ground (microfilm-dark in midnight, via tokens), square
	 * corners, no blur, no shadow. Hierarchy is drawn in rules.
	 *
	 * Per-entry markup and styling live in MobileNavItem.svelte; this file
	 * keeps the container and the masthead strip.
	 */
	.mobile-nav-container {
		position: fixed;
		top: 0;
		left: 0;
		/* Dynamic viewport height so the menu resizes as Firefox / Chrome /
		 * Safari show and hide their URL bar. Plain `100vh` is the largest
		 * viewport (URL bar collapsed), which clips the bottom items on
		 * Firefox Android and Safari iOS when the bar is visible. 100vh is
		 * kept as the fallback for browsers without dvh support. */
		height: 100vh;
		height: 100dvh;
		width: 100%;
		background: var(--color-background);
		z-index: var(--z-modal);
		/* The panel is the top of the page pulled down over the body: it is
		 * there or it is not. One short fade, no slide, no per-item cascade. */
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			visibility var(--duration-fast) var(--ease-out);
		overflow-y: auto;
		/* Respect the iOS home-indicator safe area so the last link never
		 * sits flush against the gesture zone. */
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	.mobile-nav-container.active {
		opacity: 1;
		visibility: visible;
	}

	/* `min-height`, not `height`: the panel's contents run past the viewport on a
	 * phone (1177px inside 812px), and a fixed 100% box strands its own bottom
	 * padding — and the container's `env(safe-area-inset-bottom)` — above the
	 * overflow. Measured at 375x812 scrolled to the end, the last row bottomed at
	 * 811.6px: the CV link sat inside the home-indicator gesture zone. */
	.mobile-nav {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		padding: 0 var(--space-5) var(--space-6);
	}

	/*
	 * Masthead strip — the wordmark left, controls right, closed by the 4px
	 * ink rule that opens every masthead on the site. Sticky so the nameplate
	 * and close control stay reachable while the contents scroll.
	 */
	.mobile-nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-4) 0 var(--space-3);
		border-bottom: var(--rule-masthead) solid var(--color-primary);
		background: var(--color-background);
		position: sticky;
		top: 0;
		z-index: var(--z-above);
	}

	.mobile-nav-controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	/* Wordmark — the compact nameplate, echoing the header masthead in
	 * miniature. Archivo, wide and heavy, uppercase; warms to pine. */
	:global(.mobile-site-title) {
		display: inline-flex;
		align-items: center;
		/* 44px — the home link inside the touch panel. */
		min-height: var(--space-11);
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-wordmark);
		font-size: clamp(1.15rem, 0.95rem + 0.9vw, 1.5rem);
		font-weight: 830;
		letter-spacing: var(--tracking-display-sm);
		text-transform: uppercase;
		line-height: 1;
		color: var(--color-text-emphasis);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	:global(.mobile-site-title:hover),
	:global(.mobile-site-title:focus-visible) {
		color: var(--color-accent);
	}

	:global(.mobile-site-title:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
		border-radius: 0;
	}

	/* Close control — a square ink glyph, two crossed rules; warms to
	 * pine. No tile, no radius. */
	.mobile-close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		/* 44px — the platform touch guideline. This panel is a touch surface by
		 * definition, so the close control takes it unconditionally. */
		width: var(--space-11);
		height: var(--space-11);
		position: relative;
		flex-shrink: 0;
	}

	.mobile-close-line {
		width: calc(var(--space-6) - var(--space-1));
		height: var(--border-width-medium);
		background-color: var(--color-text);
		position: absolute;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.mobile-close-line:first-child {
		transform: rotate(45deg);
	}

	.mobile-close-line:last-child {
		transform: rotate(-45deg);
	}

	.mobile-close-button:hover .mobile-close-line {
		background-color: var(--color-accent);
	}

	.mobile-close-button:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
		border-radius: 0;
	}

	/* Data-voice kicker labelling the contents — mono caps, quiet ink. */
	.mobile-nav-eyebrow {
		display: block;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--color-text-light);
		padding: var(--space-4) 0 var(--space-2);
	}

	/*
	 * Contents — a run of typeset lines separated by ink hairlines, opened by a
	 * 3px section rule. Not a stack of cards.
	 */
	.mobile-nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		border-top: var(--rule-section) solid var(--color-primary);
	}

	/* Hide the panel where the masthead nav takes over (--xl; see DesktopNav
	 * for the measurement that pins the breakpoint there). */
	@media (--xl) {
		.mobile-nav-container {
			display: none;
		}
	}

	/* ===== REDUCED MOTION SUPPORT ===== */
	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-container {
			transition: none;
		}

		.mobile-close-line {
			transition: none;
		}
	}

	/* The panel is a way of navigating, not part of the document. */
	@media print {
		.mobile-nav-container {
			display: none;
		}
	}
</style>
