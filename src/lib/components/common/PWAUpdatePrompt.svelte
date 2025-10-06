<script lang="ts">
	import { browser, dev } from '$app/environment';

	let showUpdatePrompt = $state(false);
	let updateAvailable = $state(false);
	let registration: ServiceWorkerRegistration | null = null;

	// Register service worker and handle updates (only in production)
	$effect(() => {
		if (browser) {
			if (!dev) {
				registerServiceWorker();
			} else {
				// In dev mode, unregister any existing service workers
				unregisterServiceWorkers();
			}
		}
	});

	async function unregisterServiceWorkers() {
		if ('serviceWorker' in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations();
			for (const registration of registrations) {
				await registration.unregister();
				console.log('[PWA] Service Worker unregistered (dev mode)');
			}
		}
	}

	async function registerServiceWorker() {
		if ('serviceWorker' in navigator) {
			try {
				registration = await navigator.serviceWorker.register('/service-worker.js');

				// Check for updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration?.installing;
					if (newWorker) {
						newWorker.addEventListener('statechange', () => {
							if (newWorker.state === 'installed') {
								if (navigator.serviceWorker.controller) {
									// New version available
									updateAvailable = true;
									showUpdatePrompt = true;
								}
							}
						});
					}
				});

				// Handle controller change (new SW took control)
				navigator.serviceWorker.addEventListener('controllerchange', () => {
					// Reload to get the new version
					window.location.reload();
				});

				// Check for waiting service worker
				if (registration.waiting) {
					updateAvailable = true;
					showUpdatePrompt = true;
				}

				console.log('[PWA] Service Worker registered');
			} catch (error) {
				console.warn('[PWA] Service Worker registration failed:', error);
			}
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
		if (browser && !dev && 'serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data?.type === 'SKIP_WAITING') {
					updateApp();
				}
			});
		}
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
				<button class="update-btn primary" onclick={updateApp} aria-label="Update to new version">
					Update
				</button>
				<button
					class="update-btn secondary"
					onclick={dismissUpdate}
					aria-label="Dismiss update notification"
				>
					Later
				</button>
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
		max-width: 400px;
		margin: 0 auto;
		background: var(--color-white);
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-xl);
		border: var(--border-width-thin) solid rgba(var(--color-black-rgb), var(--opacity-10));
		z-index: var(--z-modal);
		animation: slideUp var(--anim-duration-base) var(--anim-ease-out);
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
		padding: var(--space-lg);
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.update-icon {
		font-size: var(--font-size-3xl);
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
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	.update-text p {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: var(--line-height-relaxed);
	}

	.update-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-left: auto;
	}

	.update-btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		border: none;
		min-width: 80px;
	}

	.update-btn.primary {
		background: var(--color-primary);
		color: var(--color-white);
	}

	.update-btn.primary:hover {
		background: var(--color-primary-dark);
		transform: var(--transform-lift-sm);
	}

	.update-btn.secondary {
		background: var(--color-surface);
		color: var(--color-text-muted);
	}

	.update-btn.secondary:hover {
		background: var(--color-surface-alt);
		color: var(--color-text-light);
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.pwa-update-prompt {
			background: var(--color-dark-surface);
			border-color: var(--color-dark-border);
		}

		.update-text h3 {
			color: var(--color-dark-text-emphasis);
		}

		.update-text p {
			color: var(--color-dark-text-muted);
		}

		.update-btn.secondary {
			background: var(--color-dark-surface-alt);
			color: var(--color-dark-text-muted);
		}

		.update-btn.secondary:hover {
			background: var(--color-dark-surface-elevated);
			color: var(--color-dark-text);
		}
	}

	/* Mobile responsive */
	@media (max-width: var(--breakpoint-sm)) {
		.pwa-update-prompt {
			left: var(--space-xs);
			right: var(--space-xs);
		}

		.update-content {
			padding: var(--space-md);
			gap: var(--space-sm);
		}

		.update-icon {
			font-size: var(--font-size-2xl);
		}

		.update-text h3 {
			font-size: var(--font-size-base);
		}

		.update-text p {
			font-size: var(--font-size-xs);
		}

		.update-btn {
			font-size: var(--font-size-xs);
			padding: var(--space-2xs) var(--space-sm);
		}
	}
</style>
