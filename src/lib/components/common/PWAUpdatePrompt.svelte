<script lang="ts">
	import { base } from '$app/paths';
	import { browser, dev } from '$app/environment';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	let updateReady = $state(false);
	let deferredAt = $state<number | null>(null);
	let registration = $state<ServiceWorkerRegistration | null>(null);
	let updateAccepted = false;
	let isReloading = false;

	/* The prompt shows while an update is waiting and the reader has not put it
	 * off. `Later` is a deferral, not a refusal: the old code hid the prompt for
	 * the life of the tab, so a reader who dismissed it once kept running the old
	 * build until they closed the tab, which is the outcome the prompt exists to
	 * prevent. It comes back at the next route change, where the reader is
	 * between tasks and losing the current view costs least. */
	const showUpdatePrompt = $derived(updateReady && deferredAt === null);

	$effect(() => {
		// Reading the path is what subscribes this effect to navigation; the
		// deferral is read untracked so clearing it cannot re-trigger the effect
		// that clears it.
		void page.url.pathname;
		if (untrack(() => deferredAt) !== null) deferredAt = null;
	});

	function laterApp() {
		deferredAt = Date.now();
	}

	function handleKeydown(event: KeyboardEvent) {
		// Escape is the keyboard's "not now"; it does what Later does.
		if (event.key === 'Escape') laterApp();
	}

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
						updateReady = true;
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
			if (current.waiting) updateReady = true;

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
		updateReady = false;
	}
</script>

<svelte:window onkeydown={showUpdatePrompt ? handleKeydown : undefined} />

{#if showUpdatePrompt}
	<aside class="pwa-update-prompt" aria-labelledby="update-title">
		<div class="update-content">
			<!-- role="status" on the text pair alone. On the whole panel it made the
			     two buttons part of the announcement, so the reader heard the
			     controls read out before the sentence that explains them. -->
			<div class="update-text" role="status">
				<h3 id="update-title">Update available</h3>
				<p>A new version is ready. Reloading will lose the filters you have set.</p>
			</div>
			<div class="update-actions">
				<Button variant="primary" size="sm" onclick={updateApp} label="Reload" />
				<Button variant="ghost" size="sm" onclick={laterApp} label="Later" />
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
