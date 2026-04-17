<script lang="ts">
	import { browser, dev } from '$app/environment';
	import Button from '$lib/components/atoms/Button.svelte';

	let showUpdatePrompt = $state(false);
	let updateAvailable = $state(false);
	let registration = $state<ServiceWorkerRegistration | null>(null);

	// Register service worker and handle updates (only in production)
	$effect(() => {
		if (!browser) return;

		if (!dev) {
			registerServiceWorker();
		} else {
			// In dev mode, unregister any existing service workers
			unregisterServiceWorkers();
		}
	});

	async function unregisterServiceWorkers() {
		if ('serviceWorker' in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations();
			for (const reg of registrations) {
				await reg.unregister();
			}
		}
	}

	async function registerServiceWorker() {
		if (!('serviceWorker' in navigator)) return;

		try {
			// Clear any old caches that might contain Workbox or old versions
			await clearOldCaches();

			const reg = await navigator.serviceWorker.register('/service-worker.js');
			registration = reg;

			// Check for updates
			reg.addEventListener('updatefound', () => {
				const newWorker = reg.installing;
				if (!newWorker) return;

				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						// New version available
						updateAvailable = true;
						showUpdatePrompt = true;
					}
				});
			});

			// Handle controller change (new SW took control)
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				// Reload to get the new version
				window.location.reload();
			});

			// Check for waiting service worker
			if (reg.waiting) {
				updateAvailable = true;
				showUpdatePrompt = true;
			}
		} catch {
			// Service worker registration failed — non-critical for static site
		}
	}

	async function clearOldCaches() {
		if (!('caches' in window)) return;

		try {
			const cacheNames = await caches.keys();
			const currentCachePrefix = 'cache-v';
			const runtimeCachePrefix = 'runtime-v';

			// Delete caches that don't match our naming convention or contain 'workbox'
			await Promise.all(
				cacheNames.map((cacheName) => {
					// Delete Workbox caches
					if (cacheName.includes('workbox')) {
						return caches.delete(cacheName);
					}

					// Delete any cache that doesn't start with our expected prefixes
					if (
						!cacheName.startsWith(currentCachePrefix) &&
						!cacheName.startsWith(runtimeCachePrefix)
					) {
						return caches.delete(cacheName);
					}
				})
			);
		} catch {
			// Cache cleanup failure is non-critical
		}
	}

	function updateApp() {
		if (registration?.waiting) {
			// Tell the waiting service worker to skip waiting and become active
			registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		}
		showUpdatePrompt = false;
	}

	function dismissUpdate() {
		showUpdatePrompt = false;
	}

	// Listen for skip waiting message from service worker (only in production)
	$effect(() => {
		if (!browser || dev || !('serviceWorker' in navigator)) return;

		const handleMessage = (event: MessageEvent) => {
			if (event.data?.type === 'SKIP_WAITING') {
				updateApp();
			}
		};

		navigator.serviceWorker.addEventListener('message', handleMessage);

		return () => {
			navigator.serviceWorker.removeEventListener('message', handleMessage);
		};
	});
</script>

{#if showUpdatePrompt && updateAvailable}
	<div
		class="pwa-update-prompt"
		role="dialog"
		aria-labelledby="update-title"
		aria-describedby="update-description"
	>
		<div class="update-content">
			<div class="update-icon">🔄</div>
			<div class="update-text">
				<h3 id="update-title">Update Available</h3>
				<p id="update-description">
					A new version of the site is available with improvements and fixes.
				</p>
			</div>
			<div class="update-actions">
				<Button
					variant="primary"
					size="sm"
					onclick={updateApp}
					ariaLabel="Update to new version"
					label="Update"
				/>
				<Button
					variant="ghost"
					size="sm"
					onclick={dismissUpdate}
					ariaLabel="Dismiss update notification"
					label="Later"
				/>
			</div>
		</div>
	</div>
{/if}

<style>
	.pwa-update-prompt {
		position: fixed;
		bottom: var(--space-md);
		left: var(--space-md);
		right: var(--space-md);
		max-width: 25rem; /* 400px */
		margin: 0 auto;
		background: color-mix(in srgb, var(--color-surface-elevated) 80%, transparent);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-xl);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-border) 50%, transparent);
		z-index: var(--z-modal);
		animation: slideUp var(--duration-moderate) var(--ease-out);
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.update-content {
		padding: var(--space-md);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.update-icon {
		font-size: var(--font-size-2xl);
		animation: rotate 2s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.update-text h3 {
		margin: 0 0 var(--space-xs) 0;
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	.update-text p {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		line-height: var(--line-height-relaxed);
	}

	.update-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-left: auto;
	}

	/* Desktop responsive */
	@media (--sm) {
		.pwa-update-prompt {
			bottom: var(--space-lg);
			left: var(--space-lg);
			right: var(--space-lg);
		}

		.update-content {
			padding: var(--space-lg);
			gap: var(--space-md);
		}

		.update-icon {
			font-size: var(--font-size-3xl);
		}

		.update-text h3 {
			font-size: var(--font-size-lg);
		}

		.update-text p {
			font-size: var(--font-size-sm);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.pwa-update-prompt {
			animation: none;
		}

		.update-icon {
			animation: none;
		}
	}
</style>
