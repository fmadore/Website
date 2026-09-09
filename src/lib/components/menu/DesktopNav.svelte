<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';
	import NavItemWithDropdown from '$lib/components/menu/NavItemWithDropdown.svelte';

	let {
		navItems,
		activeDropdown = null,
		currentPath = '',
		onMouseEnter,
		onMouseLeave,
		onFocusIn,
		onFocusOut,
		onToggle,
		onClose,
		onDropdownItemClick
	}: {
		navItems: NavItem[];
		activeDropdown?: number | null;
		currentPath?: string;
		onMouseEnter: (index: number) => void;
		onMouseLeave: () => void;
		onFocusIn: (index: number) => void;
		onFocusOut: () => void;
		onToggle: (index: number) => void;
		onClose: () => void;
		onDropdownItemClick: () => void;
	} = $props();
</script>

<nav class="desktop-nav" aria-label="Main navigation">
	<ul class="nav-list">
		{#each navItems as item, i (item.path)}
			<NavItemWithDropdown
				{item}
				isActive={activeDropdown === i}
				index={i}
				{currentPath}
				{onMouseEnter}
				{onMouseLeave}
				{onFocusIn}
				{onFocusOut}
				{onToggle}
				{onClose}
				{onDropdownItemClick}
			/>
		{/each}
	</ul>
</nav>

<style>
	.desktop-nav {
		display: none;
	}

	.nav-list {
		display: flex;
		list-style: none;
		padding: 0;
		margin: 0;
		gap: var(--space-4);
	}

	/* The masthead nav waits for --xl because that is where it fits: the seven
	 * mono labels plus the wordmark and the toggle measure 1105px of content
	 * on one line, so the row needs a 1180px viewport (2px short at 1170) and
	 * overflows a 1024px one by 105px. The 13" laptop keeps the panel until
	 * the label set itself gets shorter. */
	@media (--xl) {
		.desktop-nav {
			display: block;
		}

		.nav-list {
			gap: var(--space-6); /* Wider spacing on larger screens */
		}
	}

	/* Navigation item styles are defined in NavItemWithDropdown.svelte */
	/* Focus styles are defined in their respective components (NavLink.svelte, DropdownMenu.svelte) */
	/* Touch and reduced-motion handling lives with the rules it guards, in
	 * NavLink.svelte and DropdownMenu.svelte. */
</style>
