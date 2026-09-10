<script lang="ts">
	import { getGlobalState } from '$lib/stores/globalState.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	/*
	 * The connection strip. It sits in flow directly under the masthead rather
	 * than floating over the page: a notice about what the reader can still do
	 * is part of the record, and a toast that covers the first line of it is not.
	 *
	 * Two states, deliberately asymmetric. Offline is a standing condition, so it
	 * is a solid ink strip that persists for as long as it is true (the old
	 * three-second auto-hide removed the notice while the fact remained, which is
	 * the one thing a status message must not do); the reader may dismiss it.
	 * Back online is an event, so it is quiet pine on the page ground and clears
	 * itself after two seconds. Neither uses --color-danger: offline is a state
	 * of the network, not a validation failure.
	 *
	 * One element carries role="status" for the life of the layout, so the text
	 * that appears inside it is announced. Mounting the live region together with
	 * its text is the classic way to have nothing announced at all.
	 */

	const globalState = getGlobalState();

	const BACK_ONLINE_MS = 2000;

	// Plain, not `$state`: the effect below both reads and writes it, and a
	// reactive read would re-run the effect on its own write — which tore down
	// the auto-hide timer in the same tick it was set, so `Back online.` never
	// cleared. Nothing renders from it, so it needs no reactivity.
	let wasOffline = false;
	let dismissed = $state(false);
	let showBackOnline = $state(false);

	const isOffline = $derived(!globalState.isOnline);
	const showOffline = $derived(isOffline && !dismissed);

	$effect(() => {
		if (isOffline) {
			wasOffline = true;
			showBackOnline = false;
			dismissed = false;
			return;
		}

		if (!wasOffline) return;

		wasOffline = false;
		showBackOnline = true;
		const timeout = setTimeout(() => {
			showBackOnline = false;
		}, BACK_ONLINE_MS);

		return () => clearTimeout(timeout);
	});
</script>

<div
	class="network-status"
	class:is-offline={showOffline}
	class:is-online={!showOffline && showBackOnline}
	role="status"
>
	{#if showOffline}
		<p class="network-status-text">Offline. Cached pages remain available.</p>
		<Button
			bare
			class="network-status-dismiss"
			ariaLabel="Dismiss the connection notice"
			onclick={() => (dismissed = true)}
		>
			<span aria-hidden="true">✕</span>
		</Button>
	{:else if showBackOnline}
		<p class="network-status-text">Back online.</p>
	{/if}
</div>

<style>
	/* Nothing is drawn until there is something to say: the element stays in the
	 * DOM so the live region is registered, but an empty strip has no box. */
	.network-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
	}

	.network-status-text {
		margin: 0;
	}

	/* Full-bleed ink strip: opaque, square, no animation of any kind. */
	.network-status.is-offline,
	.network-status.is-online {
		padding: var(--space-2) var(--space-4);
	}

	.network-status.is-offline {
		background-color: var(--color-primary);
		color: var(--color-background);
	}

	/* The transient reads as a note on the page, not as a second bar. */
	.network-status.is-online {
		background-color: var(--color-background);
		color: var(--color-accent);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	.network-status :global(.network-status-dismiss) {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-6);
		height: var(--space-6);
		color: inherit;
		font-size: var(--font-size-xs);
		line-height: 1;
	}

	.network-status :global(.network-status-dismiss:hover) {
		color: var(--color-accent);
	}
</style>
