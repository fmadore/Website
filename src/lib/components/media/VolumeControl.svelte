<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';

	let {
		volume,
		isMuted,
		onvolumechange,
		onmutetoggle
	}: {
		volume: number;
		isMuted: boolean;
		onvolumechange: (volume: number) => void;
		onmutetoggle: () => void;
	} = $props();

	const volumePercentage = $derived((isMuted ? 0 : volume) * 100);
	const sliderColor = $derived(isMuted ? 'var(--color-danger)' : 'var(--color-primary)');
</script>

<div class="volume-controls">
	<Button
		variant="ghost"
		size="sm"
		onclick={onmutetoggle}
		ariaLabel={isMuted ? 'Unmute' : 'Mute'}
		class="control-btn"
	>
		{#snippet icon()}
			<div class="control-icon control-icon--fixed {isMuted ? 'control-icon--muted' : ''}">
				{#if isMuted || volume === 0}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
						/>
					</svg>
				{:else if volume < 0.5}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
						/>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
						/>
					</svg>
				{/if}
			</div>
		{/snippet}
	</Button>

	<div class="volume-slider-container">
		<input
			type="range"
			min="0"
			max="1"
			step="0.1"
			value={isMuted ? 0 : volume}
			oninput={(e) => onvolumechange(parseFloat(e.currentTarget.value))}
			class="volume-slider"
			data-muted={isMuted}
			style="
				--volume-percentage: {volumePercentage}%;
				--slider-color: {sliderColor};
				background: linear-gradient(to right, var(--slider-color) 0%, var(--slider-color) var(--volume-percentage), color-mix(in srgb, var(--color-text) 20%, transparent) var(--volume-percentage), color-mix(in srgb, var(--color-text) 20%, transparent) 100%);
			"
			aria-label="Volume"
		/>
	</div>
</div>

<style>
	.volume-controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);

		/* Refined container */
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-50) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-lg);
		padding: var(--space-2) var(--space-3);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		backdrop-filter: blur(var(--glass-blur-amount));

		/* Subtle inner glow */
		box-shadow: inset 0 1px 0
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);

		transition: all var(--duration-normal) var(--ease-out);
	}

	.volume-controls:hover {
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-70) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-30) * 100%),
			transparent
		);
		box-shadow:
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent),
			0 2px 8px color-mix(in srgb, var(--color-accent) calc(var(--opacity-10) * 100%), transparent);
	}

	.volume-slider-container {
		display: flex;
		align-items: center;
		padding: var(--space-1);
	}

	.volume-slider {
		width: var(--space-20);
		height: var(--space-1-5);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-full);
		outline: none;
		appearance: none;
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);

		/* Enhanced styling with glassmorphism */
		-webkit-backdrop-filter: blur(var(--space-1));
		backdrop-filter: blur(var(--space-1));
		box-shadow:
			inset 0 1px 3px
				color-mix(in srgb, var(--color-black) calc(var(--opacity-10) * 100%), transparent),
			0 1px 2px color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	.volume-slider:hover {
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-40) * 100%),
			transparent
		);
		box-shadow:
			inset 0 1px 3px
				color-mix(in srgb, var(--color-black) calc(var(--opacity-15) * 100%), transparent),
			0 2px 4px color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent),
			0 1px 2px color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
		transform: scaleY(1.2);
	}

	.volume-slider::-webkit-slider-thumb {
		appearance: none;
		width: var(--space-4);
		height: var(--space-4);
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: var(--border-width-medium) solid var(--color-white);
		box-shadow:
			0 2px 4px color-mix(in srgb, var(--color-black) calc(var(--opacity-20) * 100%), transparent),
			0 0 0 2px color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.volume-slider::-webkit-slider-thumb:hover {
		background: var(--color-accent);
		transform: scale(1.1);
		box-shadow:
			0 4px 8px color-mix(in srgb, var(--color-black) calc(var(--opacity-30) * 100%), transparent),
			0 0 0 3px color-mix(in srgb, var(--color-accent) calc(var(--opacity-30) * 100%), transparent);
	}

	.volume-slider::-moz-range-thumb {
		width: var(--space-4);
		height: var(--space-4);
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: var(--border-width-medium) solid var(--color-white);
		box-shadow:
			0 2px 4px color-mix(in srgb, var(--color-black) calc(var(--opacity-20) * 100%), transparent),
			0 0 0 2px color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.volume-slider::-moz-range-thumb:hover {
		background: var(--color-accent);
		transform: scale(1.1);
		box-shadow:
			0 4px 8px color-mix(in srgb, var(--color-black) calc(var(--opacity-30) * 100%), transparent),
			0 0 0 3px color-mix(in srgb, var(--color-accent) calc(var(--opacity-30) * 100%), transparent);
	}

	/* Fixed icon container to prevent layout shifts */
	.control-icon--fixed {
		/* Fixed dimensions for volume icon to prevent layout shifts */
		width: var(--space-5);
		height: var(--space-5);
	}

	/* Muted state styling */
	.control-icon--muted {
		color: var(--color-danger);
	}

	:global(.control-btn:hover) .control-icon--muted {
		color: var(--color-danger);
	}

	/* Responsive design */
	@media (--sm-down) {
		.volume-controls {
			order: 1;
			width: 100%;
			justify-content: center;
			margin-top: var(--space-3);
		}

		.volume-slider {
			width: var(--space-32);
		}
	}

	/* Enhanced responsiveness for larger screens */
	@media (--md) {
		.volume-slider {
			width: var(--space-24);
		}
	}

	/* Extra large screens get even more refinement */
	@media (--lg) {
		.volume-slider {
			width: var(--space-28);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.volume-slider,
		.volume-slider::-webkit-slider-thumb,
		.volume-slider::-moz-range-thumb {
			transition: none;
			animation: none;
		}
	}

	/* Dark mode enhancements */
	:global(html.dark) .volume-controls {
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-60) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-border) calc(var(--opacity-30) * 100%),
			transparent
		);

		&:hover {
			background: color-mix(
				in srgb,
				var(--color-surface) calc(var(--opacity-80) * 100%),
				transparent
			);
			border-color: color-mix(
				in srgb,
				var(--color-accent) calc(var(--opacity-40) * 100%),
				transparent
			);
		}
	}
</style>
