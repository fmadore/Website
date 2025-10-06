<script lang="ts">
	import { getGlobalState } from '$lib/stores/globalState.svelte';

	const globalState = getGlobalState();
	let showOfflineMessage = $state(false);
	let hideTimeout: ReturnType<typeof setTimeout> | null = null;

	// Show offline message when connection is lost
	$effect(() => {
		if (!globalState.isOnline) {
			showOfflineMessage = true;
			// Auto-hide after 3 seconds
			if (hideTimeout) clearTimeout(hideTimeout);
			hideTimeout = setTimeout(() => {
				showOfflineMessage = false;
			}, 3000);
		} else if (showOfflineMessage) {
			// Connection restored - show briefly then hide
			if (hideTimeout) clearTimeout(hideTimeout);
			hideTimeout = setTimeout(() => {
				showOfflineMessage = false;
			}, 2000);
		}

		return () => {
			if (hideTimeout) clearTimeout(hideTimeout);
		};
	});

	function dismissMessage() {
		showOfflineMessage = false;
		if (hideTimeout) clearTimeout(hideTimeout);
	}
</script>

{#if showOfflineMessage}
	<div
		class="network-status-indicator {globalState.isOnline ? 'online' : 'offline'}"
		role="status"
		aria-live="polite"
	>
		<div class="status-content">
			<div class="status-icon">
				{#if globalState.isOnline}
					🟢
				{:else}
					🔴
				{/if}
			</div>
			<div class="status-text">
				{#if globalState.isOnline}
					<span>Back online! Content updated.</span>
				{:else}
					<span>You're offline. Cached content available.</span>
				{/if}
			</div>
			<button
				class="dismiss-btn"
				onclick={dismissMessage}
				aria-label="Dismiss network status message"
			>
				×
			</button>
		</div>
	</div>
{/if}

<style>
	.network-status-indicator {
		position: fixed;
		top: var(--space-md);
		left: 50%;
		transform: translateX(-50%);
		max-width: 320px;
		border-radius: var(--border-radius-3xl);
		z-index: var(--z-popover);
		animation: slideIn var(--anim-duration-base) var(--anim-ease-out);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		box-shadow: var(--shadow-lg);
	}

	.network-status-indicator.offline {
		background: rgba(var(--color-danger-rgb), var(--opacity-95));
		color: var(--color-white);
		border: var(--border-width-thin) solid rgba(var(--color-danger-rgb), var(--opacity-30));
	}

	.network-status-indicator.online {
		background: rgba(var(--color-success-rgb), var(--opacity-95));
		color: var(--color-white);
		border: var(--border-width-thin) solid rgba(var(--color-success-rgb), var(--opacity-30));
	}

	@keyframes slideIn {
		from {
			transform: translateX(-50%) translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(-50%) translateY(0);
			opacity: 1;
		}
	}

	.status-content {
		display: flex;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		gap: var(--space-sm);
	}

	.status-icon {
		font-size: var(--font-size-base);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: var(--opacity-100);
		}
		50% {
			opacity: var(--opacity-70);
		}
	}

	.status-text {
		flex: 1;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: inherit;
		font-size: var(--font-size-xl);
		cursor: pointer;
		padding: 0;
		width: var(--space-md-tight);
		height: var(--space-md-tight);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-full);
		transition: background-color var(--anim-duration-fast) var(--anim-ease-base);
	}

	.dismiss-btn:hover {
		background: rgba(var(--color-white-rgb), var(--opacity-20));
	}

	/* Mobile responsive */
	@media (max-width: var(--breakpoint-sm)) {
		.network-status-indicator {
			left: var(--space-xs);
			right: var(--space-xs);
			max-width: none;
			transform: none;
		}

		.status-content {
			padding: var(--space-xs) var(--space-sm);
			gap: var(--space-xs);
		}

		.status-text {
			font-size: var(--font-size-xs);
		}

		.status-icon {
			font-size: var(--font-size-sm);
		}
	}

	/* Reduce animations for users who prefer reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.network-status-indicator {
			animation: none;
		}

		.status-icon {
			animation: none;
		}
	}
</style>
