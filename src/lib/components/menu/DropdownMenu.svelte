<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';

	let {
		items,
		isActive = false,
		parentName = '',
		onItemClick = () => {}
	}: {
		items: NavItem[];
		isActive?: boolean;
		parentName?: string;
		onItemClick?: () => void;
	} = $props();
</script>

<div
	class="dropdown-menu"
	class:active={isActive}
	role="menu"
	tabindex="-1"
	aria-label={`${parentName} submenu`}
>
	<ul>
		{#each items as item (item.path)}
			<li role="none">
				<a
					href={item.path}
					class="dropdown-item"
					onclick={onItemClick}
					role="menuitem"
					target={item.path.startsWith('http') ? '_blank' : null}
					rel={item.path.startsWith('http') ? 'noopener noreferrer' : null}
				>
					{item.name}
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.dropdown-menu {
		position: absolute;
		top: calc(100% + 12px);
		left: 0;
		z-index: 1000;
		min-width: 280px;
		width: max-content;
		max-width: 400px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: var(--border-radius-lg);
		box-shadow:
			0 20px 60px 0 rgba(31, 38, 135, 0.15),
			0 8px 32px 0 rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			inset 0 -1px 0 rgba(255, 255, 255, 0.2);
		padding: var(--spacing-3);
		opacity: 0;
		visibility: hidden;
		transform: translateY(-12px) scale(0.95);
		transition:
			opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.dropdown-menu.active {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(1);
		pointer-events: auto;
	}

	.dropdown-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	:global(.dropdown-item) {
		display: block;
		padding: var(--spacing-3) var(--spacing-4);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: 500;
		border-radius: var(--border-radius-md);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: var(--spacing-2);
		position: relative;
		overflow: hidden;
	}

	:global(.dropdown-item::before) {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.5s ease;
	}

	:global(.dropdown-item:hover),
	:global(.dropdown-item:focus) {
		background: rgba(var(--color-primary-rgb), 0.1);
		color: var(--color-primary);
		transform: translateX(6px) scale(1.02);
		box-shadow:
			0 4px 16px 0 rgba(var(--color-primary-rgb), 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	:global(.dropdown-item:hover::before) {
		left: 100%;
	}

	:global(.dropdown-item:last-child) {
		margin-bottom: 0;
	}

	/* Dark mode */
	:global(html.dark) .dropdown-menu {
		background: rgba(var(--color-dark-surface-rgb), 0.9);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 20px 60px 0 rgba(0, 0, 0, 0.4),
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark .dropdown-item::before) {
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	}

	/* Touch device optimizations */
	@media (hover: none) {
		:global(.dropdown-item:hover) {
			background-color: transparent;
			color: var(--color-text);
			transform: none;
		}

		:global(.dropdown-item:active) {
			background-color: var(--color-primary);
			color: var(--color-background);
		}
	}

	/* Animation keyframes */
	@keyframes dropdownFadeIn {
		from {
			opacity: 0;
			transform: translateY(-12px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.dropdown-menu.active {
		animation: dropdownFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	/* Staggered item animation */
	:global(.dropdown-item) {
		opacity: 0;
		transform: translateX(-10px);
		animation: dropdownItemFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(1)) {
		animation-delay: 0.05s;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(2)) {
		animation-delay: 0.1s;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(3)) {
		animation-delay: 0.15s;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(4)) {
		animation-delay: 0.2s;
	}

	@keyframes dropdownItemFadeIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
