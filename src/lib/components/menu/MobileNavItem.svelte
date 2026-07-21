<script lang="ts">
	// One entry of the mobile menu contents — the mono nav line plus its
	// optional sub-menu index. Split out of MobileMenu.svelte; the parent keeps
	// the container, masthead strip and the staggered reveal (which targets
	// `.mobile-nav-item` from the container's `.active` state).
	import type { NavItem } from '$lib/types/navigation';
	import { page } from '$app/state';

	let {
		item,
		onnavigate
	}: {
		item: NavItem;
		onnavigate: () => void;
	} = $props();

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

	const current = $derived(isCurrent(item.path));
</script>

<li class="mobile-nav-item">
	<!-- eslint-disable svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
	<a
		href={item.path}
		class="mobile-nav-link"
		class:current
		aria-current={current ? 'page' : undefined}
		onclick={onnavigate}
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
						onclick={onnavigate}
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

<style>
	/* Each entry sits over a hairline rule — ink-coloured, never gray. The
	 * reveal transition (opacity/transform + stagger) lives in MobileMenu,
	 * driven by the container's `.active` class. */
	.mobile-nav-item {
		border-bottom: var(--rule-hairline) solid var(--color-border);
	}

	/*
	 * Nav entries — the DATA voice: Spline Sans Mono, uppercase, letterspaced,
	 * muted ink. Matches the desktop NavLink. The current section is pine
	 * with a persistent square-cut accent marker on the left.
	 */
	.mobile-nav-link {
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
	.mobile-nav-link::before {
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

	.mobile-nav-link:hover,
	.mobile-nav-link:focus-visible {
		color: var(--color-accent);
	}

	.mobile-nav-link:hover::before,
	.mobile-nav-link:focus-visible::before,
	.mobile-nav-link.current::before {
		transform: translateY(-50%) scaleY(1);
	}

	/* Current section — pine, marker held open. */
	.mobile-nav-link.current {
		color: var(--color-accent);
	}

	.mobile-nav-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: calc(-1 * var(--border-width-medium));
		border-radius: 0;
	}

	/*
	 * Sub-menu — the quieter apparatus: mono, smaller, faint ink, indented under
	 * the parent with a hanging hairline. Sub-entries in a machine index, not
	 * prose links.
	 */
	.mobile-dropdown {
		list-style: none;
		padding: 0 0 var(--space-3) var(--space-4);
		margin: 0;
	}

	.mobile-dropdown-item {
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	.mobile-dropdown-item:first-child {
		border-top: none;
	}

	.mobile-dropdown-link {
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
	.mobile-dropdown-link::before {
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

	.mobile-dropdown-link:hover,
	.mobile-dropdown-link:focus-visible {
		color: var(--color-accent);
	}

	.mobile-dropdown-link:hover::before,
	.mobile-dropdown-link:focus-visible::before,
	.mobile-dropdown-link.current::before {
		background-color: var(--color-accent);
	}

	.mobile-dropdown-link.current {
		color: var(--color-accent);
	}

	.mobile-dropdown-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: calc(-1 * var(--border-width-medium));
		border-radius: 0;
	}

	/* Touch device optimizations — no lingering hover state. */
	@media (hover: none) {
		.mobile-nav-link:hover:not(.current) {
			color: var(--color-text-soft);
		}

		.mobile-nav-link:hover:not(.current)::before {
			transform: translateY(-50%) scaleY(0);
		}

		.mobile-dropdown-link:hover:not(.current) {
			color: var(--color-text-light);
		}

		.mobile-dropdown-link:hover:not(.current)::before {
			background-color: var(--color-border);
		}

		.mobile-nav-link:active {
			color: var(--color-accent);
		}

		.mobile-nav-link:active::before {
			transform: translateY(-50%) scaleY(1);
		}

		.mobile-dropdown-link:active {
			color: var(--color-accent);
		}
	}

	/* High contrast — thicken the current marker and rules. */
	@media (prefers-contrast: high) {
		.mobile-nav-link.current::before {
			width: calc(var(--border-width-thick) + var(--border-width-thin));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-link,
		.mobile-dropdown-link {
			transition: color var(--duration-instant) linear;
			will-change: auto;
		}

		.mobile-nav-link::before,
		.mobile-dropdown-link::before {
			transition: none;
		}
	}
</style>
