<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
	import Icon from '@iconify/svelte';
	import { base } from '$app/paths';

	let {
		navItems,
		isActive = false,
		onCloseMenu
	}: {
		navItems: NavItem[];
		isActive?: boolean;
		onCloseMenu: () => void;
	} = $props();
</script>

<div id="mobile-menu" class="mobile-nav-container" class:active={isActive}>
	<nav class="mobile-nav" aria-label="Mobile navigation">
		<!-- Mobile Menu Header -->
		<div class="mobile-nav-header">
			<ThemeToggle size={20} />

			<a href="{base}/" class="mobile-site-title" onclick={onCloseMenu}> Frédérick Madore </a>

			<!-- Close button -->
			<button class="mobile-close-button" onclick={onCloseMenu} aria-label="Close navigation menu">
				<span class="mobile-close-line"></span>
				<span class="mobile-close-line"></span>
			</button>
		</div>

		<ul class="mobile-nav-list">
			{#each navItems as item}
				<li class="mobile-nav-item">
					<a href={item.path} class="mobile-nav-link" onclick={onCloseMenu}>
						{item.name}
					</a>

					{#if item.dropdown}
						<ul class="mobile-dropdown">
							{#each item.dropdown as subItem}
								<li class="mobile-dropdown-item">
									<a
										href={subItem.path}
										class="mobile-dropdown-link"
										onclick={onCloseMenu}
										target={subItem.path.startsWith('http') ? '_blank' : null}
										rel={subItem.path.startsWith('http') ? 'noopener noreferrer' : null}
									>
										{subItem.name}
									</a>
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
	.mobile-nav-container {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100%;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(32px) saturate(180%);
		-webkit-backdrop-filter: blur(32px) saturate(180%);
		z-index: 200;
		transform: translateY(-100%);
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		overflow-y: auto;
		box-shadow: 
			0 0 60px rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	.mobile-nav-container.active {
		transform: translateY(0);
	}

	.mobile-nav {
		padding: var(--spacing-6) var(--spacing-4);
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.mobile-nav-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-8);
		padding-bottom: var(--spacing-6);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-4);
		margin: var(--spacing-4);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.mobile-close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-1);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 24px;
		height: 24px;
		position: relative;
	}

	.mobile-close-line {
		width: 20px;
		height: 2px;
		background-color: var(--color-text);
		position: absolute;
		transition: all 0.3s ease;
	}

	.mobile-close-line:first-child {
		transform: rotate(45deg);
	}

	.mobile-close-line:last-child {
		transform: rotate(-45deg);
	}

	.mobile-close-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--border-radius-sm);
	}

	:global(.mobile-nav-header .theme-toggle) {
		margin-right: auto;
	}

	:global(.mobile-site-title) {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	:global(.mobile-site-title:hover) {
		color: var(--color-primary);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	:global(.mobile-nav-list) {
		list-style: none;
		padding: 0;
		margin: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	:global(.mobile-nav-item) {
		opacity: 0;
		transform: translateX(-20px);
		transition: all 0.3s ease;
	}

	.mobile-nav-container.active :global(.mobile-nav-item) {
		opacity: 1;
		transform: translateX(0);
	}

	/* Staggered animation for mobile nav items */
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(1)) {
		transition-delay: 0.1s;
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(2)) {
		transition-delay: 0.15s;
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(3)) {
		transition-delay: 0.2s;
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(4)) {
		transition-delay: 0.25s;
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(5)) {
		transition-delay: 0.3s;
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(6)) {
		transition-delay: 0.35s;
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(7)) {
		transition-delay: 0.4s;
	}

	:global(.mobile-nav-item:last-child) {
		margin-top: auto;
		padding-top: var(--spacing-4);
	}

	:global(.mobile-nav-link) {
		display: block;
		padding: var(--spacing-4) var(--spacing-6);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--font-size-lg);
		font-weight: 600;
		border-radius: var(--border-radius-lg);
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		margin: var(--spacing-2) var(--spacing-4);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	:global(.mobile-nav-link::before) {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		transition: left 0.6s ease;
	}

	:global(.mobile-nav-link:hover),
	:global(.mobile-nav-link:focus) {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		transform: translateX(8px) scale(1.02);
		box-shadow: 
			0 8px 32px 0 rgba(var(--color-primary-rgb), 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	:global(.mobile-nav-link:hover::before) {
		left: 100%;
	}

	:global(.mobile-dropdown) {
		list-style: none;
		padding: var(--spacing-3);
		margin: var(--spacing-3) var(--spacing-6);
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--border-radius-md);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	:global(.mobile-dropdown-link) {
		display: block;
		padding: var(--spacing-3) var(--spacing-4);
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: var(--font-size-base);
		font-weight: 500;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: var(--border-radius-sm);
		margin-bottom: var(--spacing-1);
		position: relative;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	:global(.mobile-dropdown-link::before) {
		content: '→';
		position: absolute;
		left: -var(--spacing-3);
		opacity: 0;
		transition: all 0.2s ease;
	}

	:global(.mobile-dropdown-link:hover),
	:global(.mobile-dropdown-link:focus) {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.08);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		transform: translateX(var(--spacing-3)) scale(1.02);
		box-shadow: 
			0 4px 16px 0 rgba(var(--color-primary-rgb), 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	:global(.mobile-dropdown-link:hover::before),
	:global(.mobile-dropdown-link:focus::before) {
		opacity: 1;
	}

	/* Hide mobile nav on desktop */
	@media (min-width: 1024px) {
		.mobile-nav-container {
			display: none;
		}
	}

	/* Dark mode */
	:global(html.dark) .mobile-nav-container {
		background: rgba(0, 0, 0, 0.95);
		box-shadow: 
			0 0 60px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .mobile-nav-header {
		background: rgba(0, 0, 0, 0.2);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark .mobile-nav-link) {
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	:global(html.dark .mobile-nav-link::before) {
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
	}

	:global(html.dark .mobile-dropdown) {
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark .mobile-dropdown-link) {
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.03);
	}

	/* Touch device optimizations */
	@media (hover: none) {
		:global(.mobile-dropdown-link:hover) {
			color: var(--color-text-secondary);
			transform: none;
		}

		:global(.mobile-dropdown-link:active) {
			color: var(--color-primary);
			transform: translateX(var(--spacing-2));
		}
	}

	/* Animation keyframes */
	@keyframes mobileNavSlideIn {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.mobile-nav-container.active {
		animation: mobileNavSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes mobileNavItemFadeIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.mobile-nav-container.active :global(.mobile-nav-item) {
		animation: mobileNavItemFadeIn 0.3s ease forwards;
	}
</style>
