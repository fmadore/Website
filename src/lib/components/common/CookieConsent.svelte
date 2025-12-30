<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import { browser } from '$app/environment';
	import { cookieConsent } from '$lib/utils/cookieConsent';

	// Use $derived to determine if banner should show
	let showBanner = $state(browser ? cookieConsent.needsConsent() : false);

	function acceptCookies() {
		// Use the new cookie consent utility
		cookieConsent.setConsent(true);
		showBanner = false;

		// Enable Google Analytics tracking with manual page view
		if (typeof window !== 'undefined' && 'gtag' in window) {
			// Send a page view event for the current page after consent (SPA best practice)
			try {
				window.gtag('event', 'page_view', {
					page_title: document.title,
					page_location: window.location.href,
					page_path: window.location.pathname
				});
			} catch (error) {
				console.warn('Failed to send page view after cookie consent:', error);
			}
		}
	}

	function declineCookies() {
		// Use the new cookie consent utility
		cookieConsent.setConsent(false);
		showBanner = false;
	}
</script>

{#if showBanner}
	<div class="cookie-banner glass-card">
		<div class="cookie-content">
			<h3>Cookie Consent</h3>
			<p>This website uses cookies to improve your experience and analyse site traffic.</p>
			<div class="cookie-actions">
				<Button variant="primary" onclick={acceptCookies} label="Accept" />
				<Button variant="secondary" onclick={declineCookies} label="Decline" />
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: var(--space-sm);
		left: var(--space-sm);
		right: var(--space-sm);
		z-index: var(--z-fixed);
		padding: var(--space-md);
		max-width: var(--content-width-sm);
		margin: 0 auto;

		/* Enhanced glassmorphism following design system */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		border-radius: var(--border-radius-xl);
		box-shadow:
			0 var(--space-xs) var(--space-xl) 0 color-mix(in srgb, var(--color-primary) 20%, transparent),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);

		/* Smooth transitions */
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		animation: slideUp var(--anim-duration-base) var(--anim-ease-base);
	}

	.cookie-banner:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		box-shadow:
			0 var(--space-sm) var(--space-xl-tight) 0
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium) * 100%), transparent),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium-high) * 100%), transparent);
	}

	.cookie-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	h3 {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		margin: 0;
		color: var(--color-text-emphasis);
		line-height: var(--line-height-tight);
	}

	p {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-text-light);
		line-height: var(--line-height-normal);
	}

	.cookie-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		justify-content: flex-end;
		margin-top: var(--space-xs);
	}

	/* Dark mode adaptations */
	:global(html.dark) .cookie-banner {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-white) 10%, transparent);
		box-shadow:
			0 var(--space-xs) var(--space-xl) 0
				color-mix(in srgb, var(--color-black) calc(var(--opacity-medium-high) * 100%), transparent),
			inset 0 var(--border-width-thin) 0 color-mix(in srgb, var(--color-white) 10%, transparent);
	}

	:global(html.dark) .cookie-banner:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-low) * 100%), transparent) 50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		border-color: color-mix(in srgb, var(--color-white) 20%, transparent);
		box-shadow:
			0 var(--space-sm) var(--space-xl-tight) 0
				color-mix(in srgb, var(--color-black) calc(var(--opacity-high) * 100%), transparent),
			inset 0 var(--border-width-thin) 0 color-mix(in srgb, var(--color-white) 20%, transparent);
	}

	/* Slide up animation */
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive design */
	@media (--sm) {
		.cookie-banner {
			left: var(--space-md);
			right: var(--space-md);
			bottom: var(--space-md);
			padding: var(--space-lg);
		}

		.cookie-actions {
			flex-direction: row;
			gap: var(--space-sm);
		}

		h3 {
			font-size: var(--font-size-lg);
		}

		p {
			font-size: var(--font-size-sm);
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.cookie-banner {
			animation: none;
			transition: none;
		}

		.cookie-banner:hover {
			transform: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.cookie-banner {
			border-width: 2px;
		}
	}

	/* Fallback for browsers without backdrop-filter support */
	@supports not (backdrop-filter: blur(var(--glass-blur-amount))) {
		.cookie-banner {
			background: color-mix(in srgb, var(--color-white) 95%, transparent);
		}

		:global(html.dark) .cookie-banner {
			background: color-mix(in srgb, var(--color-black) 90%, transparent);
		}
	}
</style>
