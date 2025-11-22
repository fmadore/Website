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
		z-index: 1000;
		padding: var(--space-md);
		max-width: 24rem;
		margin: 0 auto;

		/* Enhanced glassmorphism following design system */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-medium));
		border-radius: var(--border-radius-xl);
		box-shadow:
			0 var(--space-xs) var(--space-xl) 0 rgba(var(--color-primary-rgb), var(--opacity-20)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium));

		/* Smooth transitions */
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		animation: slideUp var(--anim-duration-base) var(--anim-ease-base);
	}

	.cookie-banner:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium-high));
		box-shadow:
			0 var(--space-sm) var(--space-xl-tight) 0 rgba(var(--color-primary-rgb), var(--opacity-medium)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium-high));
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
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-10));
		box-shadow:
			0 var(--space-xs) var(--space-xl) 0 rgba(var(--color-black-rgb), var(--opacity-medium-high)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-10));
	}

	:global(html.dark) .cookie-banner:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-20));
		box-shadow:
			0 var(--space-sm) var(--space-xl-tight) 0 rgba(var(--color-black-rgb), var(--opacity-high)),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-20));
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
			background: rgba(var(--color-white-rgb), var(--opacity-95));
		}

		:global(html.dark) .cookie-banner {
			background: rgba(var(--color-black-rgb), var(--opacity-90));
		}
	}
</style>
