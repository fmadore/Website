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
	aria-label={isActive ? 'Close navigation menu' : 'Open navigation menu'}
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
		/* 44px — the platform touch guideline. This is the primary navigation
		 * affordance on small viewports, so it takes the larger target
		 * unconditionally rather than only on coarse pointers. */
		width: var(--space-11);
		height: var(--space-11);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: var(--z-fixed);
		position: relative;
		gap: var(--space-1);
	}

	.hamburger-line {
		width: calc(var(--space-6) + var(--space-1));
		align-self: center;
		height: var(--border-width-medium);
		background-color: var(--color-text);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	/* The open panel carries its own close control, so this one steps aside.
	 * (There is no hamburger-to-X transform: the button is already hidden by
	 * the time `.active` applies, so the crossed lines were never seen.) */
	.hamburger.active {
		opacity: var(--opacity-0);
		pointer-events: none;
	}

	/* Hide hamburger where the masthead nav takes over (--xl). */
	@media (--xl) {
		.hamburger {
			display: none;
		}
	}

	.hamburger:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
		border-radius: 0;
	}

	.hamburger:hover .hamburger-line {
		background-color: var(--color-accent);
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.hamburger-line {
			height: calc(var(--border-width-medium) + var(--border-width-thin));
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.hamburger-line {
			transition: none;
		}
	}

	/* A control that opens a panel is nothing on paper. */
	@media print {
		.hamburger {
			display: none;
		}
	}
</style>
