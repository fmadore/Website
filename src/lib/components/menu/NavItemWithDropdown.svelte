<script lang="ts">
	import { tick } from 'svelte';
	import NavLink from '$lib/components/menu/NavLink.svelte';
	import DropdownMenu from '$lib/components/menu/DropdownMenu.svelte';
	import type { NavItem } from '$lib/types/navigation';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	let {
		item,
		isActive = false,
		index,
		currentPath = '',
		onMouseEnter,
		onMouseLeave,
		onFocusIn,
		onFocusOut,
		onToggle,
		onClose,
		onDropdownItemClick
	}: {
		item: NavItem;
		isActive?: boolean;
		index: number;
		currentPath?: string;
		onMouseEnter: (index: number) => void;
		onMouseLeave: () => void;
		onFocusIn: (index: number) => void;
		onFocusOut: () => void;
		onToggle: (index: number) => void;
		onClose: () => void;
		onDropdownItemClick: () => void;
	} = $props();

	// A nav link is "active" when the current route matches its path or is
	// nested beneath it. Normalising trailing slashes and the root `/` avoids
	// matching every route against the home link.
	const normalize = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
	const isCurrent = $derived.by(() => {
		const itemPath = normalize(item.path);
		const current = normalize(currentPath);
		if (itemPath === '/') return current === '/';
		return current === itemPath || current.startsWith(`${itemPath}/`);
	});

	const hasDropdown = $derived(!!item.dropdown?.length);
	// Deterministic (SSR-stable) id so the trigger can point `aria-controls` at
	// the sheet it opens, the way the hamburger points at `#mobile-menu`.
	const dropdownId = $derived(
		`nav-submenu-${normalize(item.path)
			.replace(/[^a-z0-9]+/gi, '-')
			.replace(/^-+|-+$/g, '')}`
	);

	let wrapperEl: HTMLDivElement | null = $state(null);
	// Escape dismisses the sheet and hands focus back to the trigger — which
	// would immediately re-fire `focusin` and reopen it. Suppress that until
	// focus genuinely leaves the item.
	let escapeDismissed = $state(false);

	const triggerEl = () => wrapperEl?.querySelector<HTMLAnchorElement>('.nav-link') ?? null;
	const itemEls = () =>
		wrapperEl ? Array.from(wrapperEl.querySelectorAll<HTMLAnchorElement>('.dropdown-item')) : [];

	/**
	 * Open the sheet, then focus one of its entries. The `tick()` is load-bearing:
	 * a closed sheet is `display: none`, and `.focus()` on a hidden element is a
	 * no-op — so the open has to be committed to the DOM first.
	 */
	async function openAndFocus(pick: (entries: HTMLAnchorElement[]) => number) {
		escapeDismissed = false;
		onFocusIn(index);
		await tick();
		const entries = itemEls();
		entries[pick(entries)]?.focus();
	}

	function handleMouseEnter() {
		escapeDismissed = false;
		onMouseEnter(index);
	}

	function handleFocusIn() {
		if (escapeDismissed) return;
		onFocusIn(index);
	}

	function handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		// Moving between the trigger and its own items is not leaving.
		if (next && wrapperEl?.contains(next)) return;
		escapeDismissed = false;
		onFocusOut();
	}

	/**
	 * The keyboard contract of a disclosure, not of an ARIA menu: Enter follows
	 * the link (native), Space toggles the sheet, Escape closes it and returns
	 * focus to the trigger, and the arrows walk trigger → items → wrap.
	 */
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (!isActive) return;
			event.preventDefault();
			escapeDismissed = true;
			onClose();
			triggerEl()?.focus();
			return;
		}

		if (!hasDropdown) return;

		const items = itemEls();
		const active = document.activeElement as HTMLElement | null;
		const onTrigger = active !== null && active === triggerEl();
		const at = active ? items.indexOf(active as HTMLAnchorElement) : -1;

		switch (event.key) {
			case ' ':
				// Without preventDefault the browser pages the document down
				// behind the sheet the same keystroke just opened.
				if (!onTrigger) return;
				event.preventDefault();
				onToggle(index);
				break;
			case 'ArrowDown':
				// Last entry wraps back round to the first; the trigger is the
				// way out, and Shift+Tab / ArrowUp still reach it.
				event.preventDefault();
				void openAndFocus(() => (onTrigger || at === items.length - 1 ? 0 : at + 1));
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (at === 0) triggerEl()?.focus();
				else void openAndFocus((entries) => (at < 0 ? entries.length - 1 : at - 1));
				break;
			// Home/End only bind once focus is inside the sheet, so the trigger
			// keeps the document-level meaning of those keys.
			case 'Home':
				if (at < 0) return;
				event.preventDefault();
				void openAndFocus(() => 0);
				break;
			case 'End':
				if (at < 0) return;
				event.preventDefault();
				void openAndFocus((entries) => entries.length - 1);
				break;
		}
	}
</script>

<li class="nav-item dropdown-container">
	<div
		class="dropdown-hover-wrapper"
		role="presentation"
		bind:this={wrapperEl}
		onmouseenter={handleMouseEnter}
		onmouseleave={onMouseLeave}
		onfocusin={handleFocusIn}
		onfocusout={handleFocusOut}
		onkeydown={handleKeyDown}
	>
		<NavLink
			href={item.path}
			{hasDropdown}
			active={isCurrent}
			aria-expanded={hasDropdown ? (isActive ? 'true' : 'false') : undefined}
			aria-controls={hasDropdown ? dropdownId : undefined}
			aria-current={isCurrent ? 'page' : undefined}
		>
			{typesetQuotes(item.name)}
		</NavLink>
		{#if item.dropdown}
			<DropdownMenu
				id={dropdownId}
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
		bottom: calc(-1 * var(--space-3));
		left: 0;
		width: 100%;
		height: var(--space-3);
		background: transparent;
	}

	/* Ensure the nav item is properly positioned for its dropdown */
	.nav-item {
		position: relative;
		display: inline-block;
	}

	/* Dropdown icon rotation when active */
	.dropdown-hover-wrapper :global(.nav-link[aria-expanded='true'] .dropdown-icon) {
		transform: rotate(var(--rotate-180));
	}

	/* First dropdown menu positioning adjustment */
	.nav-item:first-child :global(.dropdown-menu) {
		left: 0;
	}
</style>
