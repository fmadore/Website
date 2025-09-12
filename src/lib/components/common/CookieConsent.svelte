<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import { browser } from '$app/environment';
	import { cookieConsent } from '$lib/utils/cookieConsent';

	let showBanner = $state(false);
	let hasCheckedStorage = $state(false);

	$effect(() => {
		// Only run in browser environment
		if (!browser) return;
		
		// Prevent multiple checks
		if (hasCheckedStorage) return;
		
		// Use the new cookie consent utility
		showBanner = cookieConsent.needsConsent();
		hasCheckedStorage = true;
	});

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
				<Button variant="primary" onclick={acceptCookies}>Accept</Button>
				<Button variant="secondary" onclick={declineCookies}>Decline</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: var(--spacing-4);
		left: var(--spacing-4);
		right: var(--spacing-4);
		z-index: 1000;
		padding: var(--spacing-6);
		max-width: 24rem;
		margin: 0 auto;
		
		/* Enhanced glassmorphism following design system */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--border-radius-xl);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		
		/* Smooth transitions */
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.cookie-banner:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.cookie-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin: 0;
		color: var(--color-text-emphasis);
		line-height: var(--line-height-tight);
	}

	p {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		line-height: var(--line-height-normal);
	}

	.cookie-actions {
		display: flex;
		gap: var(--spacing-3);
		justify-content: flex-end;
		margin-top: var(--spacing-2);
	}

	/* Dark mode adaptations */
	:global(html.dark) .cookie-banner {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .cookie-banner:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
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
	@media (max-width: 640px) {
		.cookie-banner {
			left: var(--spacing-3);
			right: var(--spacing-3);
			bottom: var(--spacing-3);
			padding: var(--spacing-4);
		}

		.cookie-actions {
			flex-direction: column;
			gap: var(--spacing-2);
		}

		h3 {
			font-size: var(--font-size-base);
		}

		p {
			font-size: var(--font-size-xs);
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
	@supports not (backdrop-filter: blur(10px)) {
		.cookie-banner {
			background: rgba(255, 255, 255, 0.95);
		}
		
		:global(html.dark) .cookie-banner {
			background: rgba(0, 0, 0, 0.9);
		}
	}
</style>
