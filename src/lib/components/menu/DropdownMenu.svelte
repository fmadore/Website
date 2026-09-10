<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	let {
		id,
		items,
		isActive = false,
		parentName = '',
		onItemClick = () => {}
	}: {
		id: string;
		items: NavItem[];
		isActive?: boolean;
		parentName?: string;
		onItemClick?: () => void;
	} = $props();
</script>

<!--
	A disclosure, not an ARIA menu. `role="menu"`/`menuitem` promised arrow-key
	and typeahead semantics the component never implemented, and stripped the
	link role from every entry; these are plain links in a labelled list, and
	the trigger walks them with the arrows.
-->
<div {id} class="dropdown-menu" class:active={isActive}>
	<ul aria-label={`${parentName} submenu`}>
		{#each items as item (item.path)}
			{@const isExternal = item.path.startsWith('http')}
			<li>
				<!-- eslint-disable svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
				<a
					href={item.path}
					class="dropdown-item"
					data-sveltekit-preload-code="hover"
					onclick={onItemClick}
					target={isExternal ? '_blank' : null}
					rel={isExternal ? `noopener noreferrer${item.rel ? ` ${item.rel}` : ''}` : null}
				>
					{typesetQuotes(item.name)}{#if isExternal}<span class="external-mark" aria-hidden="true">
							&nbsp;↗</span
						><span class="sr-only"> (opens in new tab)</span>{/if}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</li>
		{/each}
	</ul>
</div>

<style>
	/*
	 * Dropdown popover — a flat warm-paper sheet (Ink + Signal): solid surface,
	 * 1px border, square corners, no blur and no shadow. It is drawn or it is
	 * not: no reveal, no stagger, no nudge. Separation comes from the border
	 * and ground contrast, not chrome.
	 */
	.dropdown-menu {
		display: none;
		position: absolute;
		top: calc(100% + var(--space-3));
		left: 0;
		z-index: var(--z-dropdown);
		min-width: min(90vw, var(--content-width-xs));
		width: max-content;
		max-width: min(100vw, var(--content-width-sm));
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border-dark);
		border-radius: 0;
		box-shadow: none;
		padding: var(--space-2);
	}

	.dropdown-menu.active {
		display: block;
	}

	.dropdown-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/*
	 * Dropdown items — an editorial index, not dashboard chips. A record title
	 * inside chrome keeps the document voice, so these are Archivo at the text
	 * tier while the top-level nav stays in the mono data voice.
	 */
	:global(.dropdown-item) {
		display: block;
		padding: var(--space-2-5) var(--space-3);
		color: var(--color-text);
		text-decoration: none;
		font-family: var(--font-family-display);
		font-variation-settings: normal;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: normal;
		border-radius: 0;
		position: relative;
	}

	:global(.dropdown-item:hover),
	:global(.dropdown-item:focus) {
		color: var(--color-accent);
	}

	:global(.dropdown-item:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
		border-radius: 0;
	}

	:global(.dropdown-item:last-child) {
		margin-bottom: 0;
	}

	/* Leaves the site — the same ↗ the ledger actions and the footer use. */
	.external-mark {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		color: var(--color-text-light);
	}

	:global(.dropdown-item:hover) .external-mark,
	:global(.dropdown-item:focus) .external-mark {
		color: var(--color-accent);
	}

	/* Dark mode — flat film surface matching the masthead. */
	:global(html.dark) .dropdown-menu {
		background: var(--color-surface-alt);
		border: var(--border-width-thin) solid var(--color-border-dark);
		box-shadow: none;
	}

	/* Touch device optimizations */
	@media (hover: none) {
		:global(.dropdown-item:hover) {
			color: var(--color-text);
		}

		:global(.dropdown-item:active) {
			background-color: var(--color-primary);
			color: var(--color-background);
		}
	}
</style>
