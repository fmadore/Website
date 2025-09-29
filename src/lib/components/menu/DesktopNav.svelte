<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';
	import NavItemWithDropdown from '$lib/components/menu/NavItemWithDropdown.svelte';

	let {
		navItems,
		activeDropdown = null,
		onMouseEnter,
		onMouseLeave,
		onFocusIn,
		onFocusOut,
		onKeyDown,
		onDropdownItemClick
	}: {
		navItems: NavItem[];
		activeDropdown?: number | null;
		onMouseEnter: (index: number) => void;
		onMouseLeave: () => void;
		onFocusIn: (index: number) => void;
		onFocusOut: () => void;
		onKeyDown: (event: KeyboardEvent, index: number) => void;
		onDropdownItemClick: () => void;
	} = $props();
</script>

<nav class="desktop-nav" aria-label="Main navigation">
	<ul class="nav-list">
		{#each navItems as item, i}
			<NavItemWithDropdown
				{item}
				isActive={activeDropdown === i}
				index={i}
				{onMouseEnter}
				{onMouseLeave}
				{onFocusIn}
				{onFocusOut}
				{onKeyDown}
				{onDropdownItemClick}
			/>
		{/each}
	</ul>
</nav>

<style>
	.desktop-nav {
		display: none;
		height: 100%;
	}

	.nav-list {
		display: flex;
		align-items: center;
		list-style: none;
		padding: 0;
		margin: 0;
		gap: var(--spacing-4);
		height: 100%;
	}

	@media (--mq-lg) {
		.desktop-nav {
			display: block;
		}

		.nav-list {
			gap: var(--spacing-6); /* Wider spacing on larger screens */
		}
	}

	/* Navigation item styles */
	:global(.nav-item) {
		position: relative;
		display: inline-block;
	}

	/* Focus and accessibility */
	:global(.nav-link:focus-visible),
	:global(.dropdown-item:focus-visible) {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--border-radius-sm);
	}

	/* Touch device optimizations */
	@media (hover: none) {
		/* Styles handled in navigation-links.css */
	}

	/* Reduced motion support */
	@media (--prefers-reduced-motion) {
		:global(.nav-link),
		:global(.dropdown-icon),
		:global(.dropdown-menu) {
			transition: none;
		}
	}
</style>
