<script lang="ts">
	let {
		currentTime,
		duration,
		onseek
	}: {
		currentTime: number;
		duration: number;
		onseek: (time: number) => void;
	} = $props();

	// DOM element reference
	let progressBar: HTMLDivElement | undefined = $state();

	// Format time for display
	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	// Handle progress bar click
	const handleProgressClick = (event: MouseEvent) => {
		if (!progressBar || !duration) return;
		const rect = progressBar.getBoundingClientRect();
		if (rect.width <= 0) return;
		const clickX = event.clientX - rect.left;
		const pct = Math.max(0, Math.min(1, clickX / rect.width));
		onseek(pct * duration);
	};

	// Handle progress bar keyboard navigation
	const handleProgressKeydown = (event: KeyboardEvent) => {
		if (duration === 0) return;

		switch (event.code) {
			case 'ArrowLeft':
				event.preventDefault();
				onseek(Math.max(0, currentTime - 10));
				break;
			case 'ArrowRight':
				event.preventDefault();
				onseek(Math.min(duration, currentTime + 10));
				break;
			case 'Home':
				event.preventDefault();
				onseek(0);
				break;
			case 'End':
				event.preventDefault();
				onseek(duration);
				break;
		}
	};
</script>

<div class="progress-container">
	<div
		class="progress-bar"
		bind:this={progressBar}
		onclick={handleProgressClick}
		onkeydown={handleProgressKeydown}
		role="slider"
		tabindex="0"
		aria-label="Seek"
		aria-valuemin="0"
		aria-valuemax={duration}
		aria-valuenow={currentTime}
	>
		<div
			class="progress-fill"
			style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"
		></div>
		<div
			class="progress-thumb"
			style="left: {duration > 0 ? (currentTime / duration) * 100 : 0}%"
		></div>
	</div>
	<div class="time-display">
		<span class="current-time">{formatTime(currentTime)}</span>
		<span class="duration">{formatTime(duration)}</span>
	</div>
</div>

<style>
	.progress-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.progress-bar {
		position: relative;
		height: var(--space-1-5);
		background: color-mix(in srgb, var(--color-text) calc(var(--opacity-10) * 100%), transparent);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
		overflow: hidden;

		/* Subtle inner glow */
		box-shadow: inset 0 1px 2px
			color-mix(in srgb, var(--color-black) calc(var(--opacity-10) * 100%), transparent);
	}

	.progress-bar:hover {
		height: var(--space-2);
		background: color-mix(in srgb, var(--color-text) calc(var(--opacity-15) * 100%), transparent);
		box-shadow:
			inset 0 1px 3px
				color-mix(in srgb, var(--color-black) calc(var(--opacity-15) * 100%), transparent),
			0 2px 8px color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
	}

	.progress-bar:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-1);
	}

	.progress-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
		border-radius: var(--border-radius-full);
		transition: width var(--duration-instant) ease;

		/* Elegant glow effect */
		box-shadow:
			0 0 8px color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-20) * 100%), transparent);
	}

	.progress-thumb {
		position: absolute;
		top: 50%;
		width: var(--space-4);
		height: var(--space-4);
		background: var(--color-primary);
		border: var(--border-width-medium) solid var(--color-white);
		border-radius: var(--border-radius-full);
		transform: translate(-50%, -50%);
		opacity: 0;
		transition: all var(--duration-normal) var(--ease-out);
		box-shadow:
			var(--shadow-sm),
			0 0 0 4px color-mix(in srgb, var(--color-primary) calc(var(--opacity-20) * 100%), transparent);
	}

	.progress-bar:hover .progress-thumb {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1.1);
		box-shadow:
			var(--shadow-primary),
			0 0 0 6px color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent);
	}

	.time-display {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);

		/* Academic precision aesthetic */
		letter-spacing: var(--letter-spacing-wide);
		font-weight: var(--font-weight-medium);

		/* Enhanced typography */
		line-height: 1;

		/* Subtle reveal animation */
		opacity: 0.8;
		transition: opacity var(--duration-normal) var(--ease-out);
	}

	.progress-container:hover .time-display {
		opacity: 1;
		color: var(--color-text);
	}

	/* Responsive design */
	@media (--md) {
		.progress-container {
			margin-bottom: var(--space-5);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.progress-bar,
		.progress-fill,
		.progress-thumb {
			transition: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.progress-bar {
			background: color-mix(in srgb, var(--color-text) calc(var(--opacity-50) * 100%), transparent);
		}

		.progress-fill {
			background: var(--color-text-emphasis);
		}
	}

	/* Dark mode enhancements */
	:global(html.dark) .progress-fill {
		/* More vibrant gradient in dark mode */
		background: linear-gradient(90deg, var(--color-accent), var(--color-highlight));
	}
</style>
