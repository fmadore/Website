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
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		max-width: 320px;
		border-radius: 25px;
		z-index: 999;
		animation: slideIn 0.3s ease-out;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.network-status-indicator.offline {
		background: rgba(239, 68, 68, 0.95);
		color: white;
		border: 1px solid rgba(220, 38, 38, 0.3);
	}

	.network-status-indicator.online {
		background: rgba(34, 197, 94, 0.95);
		color: white;
		border: 1px solid rgba(22, 163, 74, 0.3);
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
		padding: 0.75rem 1rem;
		gap: 0.75rem;
	}

	.status-icon {
		font-size: 1rem;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.status-text {
		flex: 1;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s ease;
	}

	.dismiss-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.network-status-indicator {
			left: 0.5rem;
			right: 0.5rem;
			max-width: none;
			transform: none;
		}

		.status-content {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}

		.status-text {
			font-size: 0.85rem;
		}

		.status-icon {
			font-size: 0.9rem;
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
