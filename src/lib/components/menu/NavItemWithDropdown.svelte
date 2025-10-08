<script lang="ts">
	import NavLink from '$lib/components/menu/NavLink.svelte';
	import DropdownMenu from '$lib/components/menu/DropdownMenu.svelte';
	import type { NavItem } from '$lib/types/navigation';

	let {
		item,
		isActive = false,
		index,
		onMouseEnter,
		onMouseLeave,
		onFocusIn,
		onFocusOut,
		onKeyDown,
		onDropdownItemClick
	}: {
		item: NavItem;
		isActive?: boolean;
		index: number;
		onMouseEnter: (index: number) => void;
		onMouseLeave: () => void;
		onFocusIn: (index: number) => void;
		onFocusOut: () => void;
		onKeyDown: (event: KeyboardEvent, index: number) => void;
		onDropdownItemClick: () => void;
	} = $props();
</script>

<li class="nav-item dropdown-container">
	<div
		class="dropdown-hover-wrapper"
		role="presentation"
		onmouseenter={() => onMouseEnter(index)}
		onmouseleave={onMouseLeave}
		onfocusin={() => onFocusIn(index)}
		onfocusout={onFocusOut}
	>
		<NavLink
			href={item.path}
			hasDropdown={!!item.dropdown}
			aria-expanded={isActive ? 'true' : 'false'}
			onkeydown={(e) => onKeyDown(e, index)}
		>
			{item.name}
		</NavLink>
		{#if item.dropdown}
			<DropdownMenu
				items={item.dropdown}
				{isActive}
				parentName={item.name}
				onItemClick={onDropdownItemClick}
			/>
		{/if}
	</div>
</li>

<style>
	.dropdown-hover-wrapper {
		display: inline-block;
		position: relative;
		height: 100%;
	}

	/* Add a buffer zone below the nav link to prevent accidental dropdown closing */
        .dropdown-hover-wrapper::after {
                content: '';
                position: absolute;
                bottom: calc(-1 * var(--spacing-3));
                left: 0;
                width: 100%;
                height: var(--spacing-3);
                background: transparent;
        }

	/* Ensure the nav item is properly positioned for its dropdown */
	.nav-item {
		position: relative;
		display: inline-block;
	}

	/* Dropdown icon rotation when active */
	.dropdown-hover-wrapper :global(.nav-link[aria-expanded='true'] .dropdown-icon) {
		transform: rotate(180deg);
	}

	/* First dropdown menu positioning adjustment */
	.nav-item:first-child :global(.dropdown-menu) {
		left: 0;
	}
</style>
