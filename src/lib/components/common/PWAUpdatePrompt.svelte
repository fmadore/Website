<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';

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
	<div class="pwa-update-prompt" role="dialog" aria-labelledby="update-title" aria-describedby="update-description">
		<div class="update-content">
			<div class="update-icon">🔄</div>
			<div class="update-text">
				<h3 id="update-title">Update Available</h3>
				<p id="update-description">
					A new version of the site is available with improvements and fixes.
				</p>
			</div>
			<div class="update-actions">
				<button 
					class="update-btn primary" 
					onclick={updateApp}
					aria-label="Update to new version"
				>
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
		bottom: 1rem;
		left: 1rem;
		right: 1rem;
		max-width: 400px;
		margin: 0 auto;
		background: white;
		border-radius: 12px;
		box-shadow: 
			0 10px 25px rgba(0, 0, 0, 0.1),
			0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
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
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.update-icon {
		font-size: 2rem;
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
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.update-text p {
		margin: 0;
		font-size: 0.9rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.update-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-left: auto;
	}

	.update-btn {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		min-width: 80px;
	}

	.update-btn.primary {
		background: #3b82f6;
		color: white;
	}

	.update-btn.primary:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.update-btn.secondary {
		background: #f3f4f6;
		color: #6b7280;
	}

	.update-btn.secondary:hover {
		background: #e5e7eb;
		color: #4b5563;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.pwa-update-prompt {
			background: #1f2937;
			border-color: #374151;
		}

		.update-text h3 {
			color: #f9fafb;
		}

		.update-text p {
			color: #d1d5db;
		}

		.update-btn.secondary {
			background: #374151;
			color: #d1d5db;
		}

		.update-btn.secondary:hover {
			background: #4b5563;
			color: #f3f4f6;
		}
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.pwa-update-prompt {
			left: 0.5rem;
			right: 0.5rem;
		}

		.update-content {
			padding: 1rem;
			gap: 0.75rem;
		}

		.update-icon {
			font-size: 1.5rem;
		}

		.update-text h3 {
			font-size: 1rem;
		}

		.update-text p {
			font-size: 0.85rem;
		}

		.update-btn {
			font-size: 0.85rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>