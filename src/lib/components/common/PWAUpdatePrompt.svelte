<script lang="ts">
	import { base } from '$app/paths';
	import { browser, dev } from '$app/environment';
	import Button from '$lib/components/atoms/Button.svelte';

	let showUpdatePrompt = $state(false);
	let registration = $state<ServiceWorkerRegistration | null>(null);
	let updateAccepted = false;
	let isReloading = false;

	$effect(() => {
		if (!browser || !('serviceWorker' in navigator)) return;

		let disposed = false;
		let cleanup = () => {};

		async function setup(): Promise<() => void> {
			if (dev) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				await Promise.all(registrations.map((current) => current.unregister()));
				return () => {};
			}

			const current = await navigator.serviceWorker.register(`${base}/service-worker.js`);
			if (disposed) return () => {};
			registration = current;

			const workerListeners: Array<[ServiceWorker, () => void]> = [];
			const inspectWorker = (worker: ServiceWorker | null) => {
				if (!worker || workerListeners.some(([registered]) => registered === worker)) return;
				const handleStateChange = () => {
					if (worker.state === 'installed' && navigator.serviceWorker.controller) {
						showUpdatePrompt = true;
					}
				};
				worker.addEventListener('statechange', handleStateChange);
				workerListeners.push([worker, handleStateChange]);
			};

			const handleUpdateFound = () => inspectWorker(current.installing);
			const handleControllerChange = () => {
				if (!updateAccepted || isReloading) return;
				isReloading = true;
				window.location.reload();
			};

			current.addEventListener('updatefound', handleUpdateFound);
			navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
			inspectWorker(current.installing);
			if (current.waiting) showUpdatePrompt = true;

			return () => {
				current.removeEventListener('updatefound', handleUpdateFound);
				navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
				for (const [worker, listener] of workerListeners) {
					worker.removeEventListener('statechange', listener);
				}
			};
		}

		void setup()
			.then((teardown) => {
				if (disposed) teardown();
				else cleanup = teardown;
			})
			.catch(() => {
				// Service-worker support is an enhancement; the static site remains usable.
			});

		return () => {
			disposed = true;
			cleanup();
		};
	});

	function updateApp() {
		if (!registration?.waiting) return;
		updateAccepted = true;
		registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		showUpdatePrompt = false;
	}
</script>

{#if showUpdatePrompt}
	<aside
		class="pwa-update-prompt"
		aria-labelledby="update-title"
		aria-describedby="update-description"
		aria-live="polite"
	>
		<div class="update-content">
			<div class="update-text">
				<h3 id="update-title">Update available</h3>
				<p id="update-description">A new version is ready.</p>
			</div>
			<div class="update-actions">
				<Button variant="primary" size="sm" onclick={updateApp} label="Update" />
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (showUpdatePrompt = false)}
					label="Later"
				/>
			</div>
		</div>
	</aside>
{/if}

<style>
	.pwa-update-prompt {
		position: fixed;
		inset-inline: var(--space-md);
		bottom: var(--space-md);
		max-width: 25rem;
		margin-inline: auto;
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border-dark);
		border-top: var(--rule-section) solid var(--color-accent);
		z-index: var(--z-modal);
	}

	.update-content {
		padding: var(--space-md);
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.update-text {
		min-width: 0;
	}

	.update-text h3 {
		margin: 0 0 var(--space-xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-accent);
	}

	.update-text p {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
	}

	.update-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-inline-start: auto;
		flex: none;
	}

	@media (--sm) {
		.pwa-update-prompt {
			inset-inline: var(--space-lg);
			bottom: var(--space-lg);
		}

		.update-content {
			padding: var(--space-lg);
		}
	}
</style>
