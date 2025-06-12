<script lang="ts">
	let {
		isActive = false,
		onClick
	}: {
		isActive?: boolean;
		onClick: () => void;
	} = $props();
</script>

<button
	class="hamburger"
	class:active={isActive}
	onclick={onClick}
	aria-label="Toggle navigation menu"
	aria-expanded={isActive ? 'true' : 'false'}
	aria-controls="mobile-menu"
>
	<span class="hamburger-line"></span>
	<span class="hamburger-line"></span>
	<span class="hamburger-line"></span>
</button>

<style>
	.hamburger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: 150;
		position: relative;
		gap: 4px;
	}

	.hamburger-line {
		width: 100%;
		height: 2px;
		background-color: var(--color-text);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
	}

	/* Hamburger to X animation */
	.hamburger.active .hamburger-line:first-child {
		transform: translateY(6px) rotate(45deg);
	}

	.hamburger.active .hamburger-line:nth-child(2) {
		opacity: 0;
		transform: scaleX(0);
	}

	.hamburger.active .hamburger-line:last-child {
		transform: translateY(-6px) rotate(-45deg);
	}

	/* Hide hamburger on desktop */
	@media (min-width: 1024px) {
		.hamburger {
			display: none;
		}
	}

	.hamburger:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--border-radius-sm);
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.hamburger-line {
			height: 3px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.hamburger-line {
			transition: none;
		}
	}
</style>
