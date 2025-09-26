<script lang="ts">
	import { browser } from '$app/environment';
	import { getGlobalState } from '$lib/stores/globalState.svelte';

	const globalState = getGlobalState();
	let showInstallPrompt = $state(false);

	// Listen for install prompt events
	$effect(() => {
		if (browser) {
			// Listen for the beforeinstallprompt event
			window.addEventListener('beforeinstallprompt', (e) => {
				// Prevent the default install prompt
				e.preventDefault();
				
				// Store the event for later use
				globalState.deferredPrompt = e;
				globalState.isInstallable = true;
				showInstallPrompt = true;
			});

			// Listen for the app being installed
			window.addEventListener('appinstalled', () => {
				console.log('[PWA] App was installed');
				globalState.deferredPrompt = null;
				globalState.isInstallable = false;
				showInstallPrompt = false;
			});

			// Check if app is already installed
			if (window.matchMedia('(display-mode: standalone)').matches) {
				showInstallPrompt = false;
			}
		}
	});

	async function installApp() {
		await globalState.installApp();
		showInstallPrompt = false;
	}

	function dismissInstall() {
		showInstallPrompt = false;
		// Hide for the session
		sessionStorage.setItem('pwa-install-dismissed', 'true');
	}

	// Check if install was dismissed this session
	$effect(() => {
		if (browser && sessionStorage.getItem('pwa-install-dismissed')) {
			showInstallPrompt = false;
		}
	});
</script>

{#if showInstallPrompt && globalState.isInstallable}
	<div class="pwa-install-prompt" role="dialog" aria-labelledby="install-title" aria-describedby="install-description">
		<div class="install-content">
			<div class="install-icon">📱</div>
			<div class="install-text">
				<h3 id="install-title">Install App</h3>
				<p id="install-description">
					Add this academic portfolio to your home screen for quick access and offline reading.
				</p>
			</div>
			<div class="install-actions">
				<button 
					class="install-btn primary" 
					onclick={installApp}
					aria-label="Install the academic portfolio app"
				>
					Install
				</button>
				<button 
					class="install-btn secondary" 
					onclick={dismissInstall}
					aria-label="Dismiss install prompt"
				>
					Not Now
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.pwa-install-prompt {
		position: fixed;
		top: 1rem;
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
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.install-content {
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.install-icon {
		font-size: 2rem;
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	.install-text h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.install-text p {
		margin: 0;
		font-size: 0.9rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.install-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-left: auto;
	}

	.install-btn {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		min-width: 80px;
	}

	.install-btn.primary {
		background: #10b981;
		color: white;
	}

	.install-btn.primary:hover {
		background: #047857;
		transform: translateY(-1px);
	}

	.install-btn.secondary {
		background: #f3f4f6;
		color: #6b7280;
	}

	.install-btn.secondary:hover {
		background: #e5e7eb;
		color: #4b5563;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.pwa-install-prompt {
			background: #1f2937;
			border-color: #374151;
		}

		.install-text h3 {
			color: #f9fafb;
		}

		.install-text p {
			color: #d1d5db;
		}

		.install-btn.secondary {
			background: #374151;
			color: #d1d5db;
		}

		.install-btn.secondary:hover {
			background: #4b5563;
			color: #f3f4f6;
		}
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.pwa-install-prompt {
			left: 0.5rem;
			right: 0.5rem;
		}

		.install-content {
			padding: 1rem;
			gap: 0.75rem;
		}

		.install-icon {
			font-size: 1.5rem;
		}

		.install-text h3 {
			font-size: 1rem;
		}

		.install-text p {
			font-size: 0.85rem;
		}

		.install-btn {
			font-size: 0.85rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>