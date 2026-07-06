<script lang="ts">
	import { tick } from 'svelte';
	import type { NavItem } from '$lib/types/navigation';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

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

	// Current pathname, used for highlighting the active nav entry — mirrors the
	// desktop NavLink active treatment (pine text + accent marker).
	const currentPath = $derived(page.url.pathname);

	// A nav entry is "current" when the route matches its path or is nested
	// beneath it. Normalising trailing slashes and the root `/` keeps every
	// route from matching the home link. Same logic as NavItemWithDropdown.
	const normalize = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
	function isCurrent(path: string): boolean {
		// External links (dropdown children) are never "current".
		if (path.startsWith('http')) return false;
		const itemPath = normalize(path);
		const current = normalize(currentPath);
		if (itemPath === '/') return current === '/';
		return current === itemPath || current.startsWith(`${itemPath}/`);
	}

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

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
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
				{@const current = isCurrent(item.path)}
				<li class="mobile-nav-item">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
					<a
						href={item.path}
						class="mobile-nav-link"
						class:current
						aria-current={current ? 'page' : undefined}
						onclick={onCloseMenu}
					>
						{item.name}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->

					{#if item.dropdown}
						<ul class="mobile-dropdown">
							{#each item.dropdown as subItem (subItem.path)}
								{@const subCurrent = isCurrent(subItem.path)}
								<li class="mobile-dropdown-item">
									<!-- eslint-disable svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
									<a
										href={subItem.path}
										class="mobile-dropdown-link"
										class:current={subCurrent}
										aria-current={subCurrent ? 'page' : undefined}
										onclick={onCloseMenu}
										target={subItem.path.startsWith('http') ? '_blank' : null}
										rel={subItem.path.startsWith('http')
											? `noopener noreferrer${subItem.rel ? ` ${subItem.rel}` : ''}`
											: null}
									>
										{subItem.name}
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								</li>
							{/each}
						</ul>
					{/if}
				</li>
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
		transform: translateY(-100%);
		transition: transform var(--duration-moderate) var(--ease-in-out);
		overflow-y: auto;
		/* Respect the iOS home-indicator safe area so the last link never
		 * sits flush against the gesture zone. */
		padding-bottom: env(safe-area-inset-bottom, 0);
		will-change: transform;
	}

	.mobile-nav-container.active {
		transform: translateY(0);
	}

	.mobile-nav {
		height: 100%;
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
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-wordmark);
		font-size: clamp(1.15rem, 0.95rem + 0.9vw, 1.5rem);
		font-weight: 830;
		letter-spacing: -0.01em;
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
		width: calc(var(--space-8) + var(--space-1));
		height: calc(var(--space-8) + var(--space-1));
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
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-text-light);
		padding: var(--space-4) 0 var(--space-2);
	}

	/*
	 * Contents — a run of typeset lines separated by ink hairlines, opened by a
	 * 3px section rule. Not a stack of cards.
	 */
	:global(.mobile-nav-list) {
		list-style: none;
		padding: 0;
		margin: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		border-top: var(--rule-section) solid var(--color-primary);
	}

	/* Each entry sits over a hairline rule — ink-coloured, never gray. */
	:global(.mobile-nav-item) {
		border-bottom: var(--rule-hairline) solid var(--color-border);
		opacity: 0;
		transform: translateX(calc(-1 * var(--transform-distance-lg)));
		transition:
			transform var(--duration-moderate) var(--ease-out),
			opacity var(--duration-moderate) var(--ease-out);
		will-change: opacity, transform;
	}

	.mobile-nav-container.active :global(.mobile-nav-item) {
		opacity: 1;
		transform: translateX(0);
	}

	/* Staggered reveal for mobile nav items — modern stagger tokens. */
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(1)) {
		transition-delay: var(--stagger-1);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(2)) {
		transition-delay: var(--stagger-2);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(3)) {
		transition-delay: var(--stagger-3);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(4)) {
		transition-delay: var(--stagger-4);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(5)) {
		transition-delay: var(--stagger-5);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(6)) {
		transition-delay: var(--stagger-6);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(n + 7)) {
		transition-delay: calc(var(--stagger-6) + var(--stagger-1));
	}

	/*
	 * Nav entries — the DATA voice: Spline Sans Mono, uppercase, letterspaced,
	 * muted ink. Matches the desktop NavLink. The current section is pine
	 * with a persistent square-cut accent marker on the left.
	 */
	:global(.mobile-nav-link) {
		display: grid;
		place-items: center start;
		min-height: 3rem;
		padding: var(--space-3) 0 var(--space-3) var(--space-4);
		color: var(--color-text-soft);
		text-decoration: none;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		line-height: var(--line-height-snug);
		position: relative;
		transition: color var(--duration-fast) var(--ease-out);
	}

	/* Left marker — a square-cut pine rule, hidden until hover/current. */
	:global(.mobile-nav-link::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%) scaleY(0);
		transform-origin: center;
		width: var(--border-width-thick);
		height: 1.4em;
		background-color: var(--color-accent);
		transition: transform var(--duration-fast) var(--ease-out);
	}

	:global(.mobile-nav-link:hover),
	:global(.mobile-nav-link:focus-visible) {
		color: var(--color-accent);
	}

	:global(.mobile-nav-link:hover::before),
	:global(.mobile-nav-link:focus-visible::before),
	:global(.mobile-nav-link.current::before) {
		transform: translateY(-50%) scaleY(1);
	}

	/* Current section — pine, marker held open. */
	:global(.mobile-nav-link.current) {
		color: var(--color-accent);
	}

	:global(.mobile-nav-link:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: calc(-1 * var(--border-width-medium));
		border-radius: 0;
	}

	/*
	 * Sub-menu — the quieter apparatus: mono, smaller, faint ink, indented under
	 * the parent with a hanging hairline. Sub-entries in a machine index, not
	 * prose links.
	 */
	:global(.mobile-dropdown) {
		list-style: none;
		padding: 0 0 var(--space-3) var(--space-4);
		margin: 0;
	}

	:global(.mobile-dropdown-item) {
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	:global(.mobile-dropdown-item:first-child) {
		border-top: none;
	}

	:global(.mobile-dropdown-link) {
		display: flex;
		align-items: center;
		min-height: 2.5rem;
		padding: var(--space-2) 0 var(--space-2) var(--space-4);
		color: var(--color-text-light);
		text-decoration: none;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		line-height: var(--line-height-snug);
		position: relative;
		transition: color var(--duration-fast) var(--ease-out);
	}

	/* Hanging index tick — a short accent rule at the indent, on hover/current. */
	:global(.mobile-dropdown-link::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: var(--space-2);
		height: var(--rule-hairline);
		background-color: var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	:global(.mobile-dropdown-link:hover),
	:global(.mobile-dropdown-link:focus-visible) {
		color: var(--color-accent);
	}

	:global(.mobile-dropdown-link:hover::before),
	:global(.mobile-dropdown-link:focus-visible::before),
	:global(.mobile-dropdown-link.current::before) {
		background-color: var(--color-accent);
	}

	:global(.mobile-dropdown-link.current) {
		color: var(--color-accent);
	}

	:global(.mobile-dropdown-link:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: calc(-1 * var(--border-width-medium));
		border-radius: 0;
	}

	/* Hide mobile nav on desktop */
	@media (--xl) {
		.mobile-nav-container {
			display: none;
		}
	}

	/* Touch device optimizations — no lingering hover state. */
	@media (hover: none) {
		:global(.mobile-nav-link:hover:not(.current)) {
			color: var(--color-text-soft);
		}

		:global(.mobile-nav-link:hover:not(.current)::before) {
			transform: translateY(-50%) scaleY(0);
		}

		:global(.mobile-dropdown-link:hover:not(.current)) {
			color: var(--color-text-light);
		}

		:global(.mobile-dropdown-link:hover:not(.current)::before) {
			background-color: var(--color-border);
		}

		:global(.mobile-nav-link:active) {
			color: var(--color-accent);
		}

		:global(.mobile-nav-link:active::before) {
			transform: translateY(-50%) scaleY(1);
		}

		:global(.mobile-dropdown-link:active) {
			color: var(--color-accent);
		}
	}

	/* High contrast — thicken the current marker and rules. */
	@media (prefers-contrast: high) {
		:global(.mobile-nav-link.current::before) {
			width: calc(var(--border-width-thick) + var(--border-width-thin));
		}
	}

	/* ===== MODERN ANIMATION SYSTEM ===== */
	/* Panel slide-in. The per-item reveal is the staggered transition declared
	 * above (opacity + translateX with per-item transition-delay) — one
	 * mechanism, so items keep their one-after-another cascade. */
	@keyframes mobileNavSlideIn {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.mobile-nav-container.active {
		animation: mobileNavSlideIn var(--duration-moderate) var(--ease-out) forwards;
	}

	/* ===== REDUCED MOTION SUPPORT =====
	 * Fully disable transitions/keyframes for users who ask for it. The
	 * !important flags are intentional: they override the staggered transition
	 * delays and the keyframe animations declared above. */
	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-container {
			transition: none;
			transform: translateY(-100%);
		}

		.mobile-nav-container.active {
			animation: none !important;
			transform: translateY(0);
		}

		:global(.mobile-nav-item),
		.mobile-nav-container.active :global(.mobile-nav-item) {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
			transition-delay: 0ms !important;
			will-change: auto;
		}

		:global(.mobile-nav-link),
		:global(.mobile-dropdown-link) {
			transition: color var(--duration-instant) linear;
			will-change: auto;
		}

		:global(.mobile-nav-link::before),
		:global(.mobile-dropdown-link::before) {
			transition: none;
		}

		.mobile-close-line {
			transition: none;
		}
	}

	/* ===== PERFORMANCE OPTIMIZATION ===== */
	/* Remove will-change when menu is closed */
	.mobile-nav-container:not(.active) {
		will-change: auto;
	}

	.mobile-nav-container:not(.active) :global(.mobile-nav-item) {
		will-change: auto;
	}
</style>
