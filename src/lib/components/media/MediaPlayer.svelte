<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import AudioVisualization from './AudioVisualization.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import VolumeControl from './VolumeControl.svelte';

	// Props using Svelte 5 $props rune
	let {
		src,
		type = 'audio', // 'audio' | 'video'
		title = '',
		poster = undefined, // For video thumbnail
		autoplay = false,
		loop = false,
		muted = false,
		surface = 'surface-card',
		showControls = true,
		width = undefined,
		height = undefined
	}: {
		src: string;
		type?: 'audio' | 'video';
		title?: string;
		poster?: string;
		autoplay?: boolean;
		loop?: boolean;
		muted?: boolean;
		surface?: string;
		showControls?: boolean;
		width?: string | number;
		height?: string | number;
	} = $props();

	// State using Svelte 5 $state rune
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(1);
	// eslint-disable-next-line svelte/prefer-writable-derived -- also written by toggleMute()
	let isMuted = $state(false);
	let isFullscreen = $state(false);
	let error = $state<string>('');
	let isLoading = $state(true);

	// Sync isMuted with the muted prop
	$effect(() => {
		isMuted = muted;
	});

	// DOM element reference
	let mediaElement: HTMLVideoElement | HTMLAudioElement | null = $state(null);

	// Media event handlers
	const handleLoadedMetadata = () => {
		const el = mediaElement;
		if (!el) return;
		duration = Number.isFinite(el.duration) ? el.duration : 0;
		isLoading = false;
	};

	const handleTimeUpdate = () => {
		const el = mediaElement;
		if (!el) return;
		currentTime = el.currentTime || 0;
	};

	const handlePlay = () => {
		isPlaying = true;
	};

	const handlePause = () => {
		isPlaying = false;
	};

	const handleEnded = () => {
		isPlaying = false;
		if (!loop) currentTime = 0;
	};

	const handleError = () => {
		error = 'Failed to load media file';
		isLoading = false;
	};

	const handleFullscreenChange = () => {
		isFullscreen = !!document.fullscreenElement;
	};

	// Use $effect to properly handle media element events
	$effect(() => {
		const el = mediaElement;
		if (!el) return; // will rerun once bound

		isLoading = true;
		el.addEventListener('loadedmetadata', handleLoadedMetadata);
		el.addEventListener('timeupdate', handleTimeUpdate);
		el.addEventListener('play', handlePlay);
		el.addEventListener('pause', handlePause);
		el.addEventListener('ended', handleEnded);
		el.addEventListener('error', handleError);

		if (el.readyState >= 1) handleLoadedMetadata();

		return () => {
			el.removeEventListener('loadedmetadata', handleLoadedMetadata);
			el.removeEventListener('timeupdate', handleTimeUpdate);
			el.removeEventListener('play', handlePlay);
			el.removeEventListener('pause', handlePause);
			el.removeEventListener('ended', handleEnded);
			el.removeEventListener('error', handleError);
		};
	});

	// Toggle play/pause
	const togglePlayPause = () => {
		const el = mediaElement;
		if (!el) return;
		void (isPlaying ? el.pause() : el.play());
	};

	// Seek to specific time
	const seekTo = (time: number) => {
		const el = mediaElement;
		// Need metadata (duration > 0) and element
		if (!el || !duration || duration === Infinity) return;
		const clamped = Math.max(0, Math.min(duration, time));
		// Setting currentTime after metadata (readyState >= 1) is allowed
		el.currentTime = clamped;
		currentTime = clamped;
	};

	// Toggle mute
	const toggleMute = () => {
		const el = mediaElement;
		if (!el) return;
		isMuted = !isMuted;
		el.muted = isMuted;
	};

	// Set volume
	const setVolume = (newVolume: number) => {
		volume = Math.max(0, Math.min(1, newVolume));
		void (mediaElement && (mediaElement.volume = volume));
	};

	// Toggle fullscreen (for video)
	const toggleFullscreen = async () => {
		const el = mediaElement;
		if (type !== 'video' || !el) return;
		try {
			void (!isFullscreen ? await el.requestFullscreen() : await document.exitFullscreen());
		} catch {
			// Fullscreen request can fail silently (e.g. permissions)
		}
	};

	// Keyboard controls
	const handleKeydown = (event: KeyboardEvent) => {
		if (!showControls) return;

		switch (event.code) {
			case 'Space':
				event.preventDefault();
				togglePlayPause();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				seekTo(currentTime - 10);
				break;
			case 'ArrowRight':
				event.preventDefault();
				seekTo(currentTime + 10);
				break;
			case 'KeyM':
				event.preventDefault();
				toggleMute();
				break;
			case 'KeyF':
				if (type === 'video') {
					event.preventDefault();
					toggleFullscreen();
				}
				break;
		}
	};
</script>

<div class="media-player {surface} scroll-reveal" role="region" aria-label="Media Player">
	{#if title}
		<div class="player-header">
			<h3 class="player-title">{title}</h3>
		</div>
	{/if}

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{:else}
		<div class="media-container">
			{#if type === 'video'}
				<video
					bind:this={mediaElement}
					{src}
					{poster}
					{autoplay}
					{loop}
					{muted}
					{width}
					{height}
					class="media-element"
					onkeydown={handleKeydown}
					tabindex="0"
					playsinline
				></video>
			{:else}
				<audio
					bind:this={mediaElement}
					{src}
					{autoplay}
					{loop}
					{muted}
					preload="metadata"
					class="media-element"
					onkeydown={handleKeydown}
					tabindex="0"
				></audio>

				<AudioVisualization {title} />
			{/if}

			{#if isLoading}
				<div class="loading-overlay">
					<div class="loading-spinner"></div>
				</div>
			{/if}
		</div>

		{#if showControls}
			<div class="player-controls">
				<ProgressBar {currentTime} {duration} onseek={seekTo} />

				<!-- Control Buttons -->
				<div class="control-buttons">
					<!-- Play/Pause Button -->
					<Button
						variant="ghost"
						size="sm"
						onclick={togglePlayPause}
						ariaLabel={isPlaying ? 'Pause' : 'Play'}
						class="control-btn"
					>
						{#snippet icon()}
							<div class="control-icon">
								{#if isPlaying}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<rect x="6" y="4" width="4" height="16" />
										<rect x="14" y="4" width="4" height="16" />
									</svg>
								{:else}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<path d="M8 5v14l11-7z" />
									</svg>
								{/if}
							</div>
						{/snippet}
					</Button>

					<VolumeControl {volume} {isMuted} onvolumechange={setVolume} onmutetoggle={toggleMute} />

					{#if type === 'video'}
						<Button
							variant="ghost"
							size="sm"
							onclick={toggleFullscreen}
							ariaLabel="Fullscreen"
							class="control-btn control-btn--fullscreen"
						>
							{#snippet icon()}
								<div class="control-icon">
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
										/>
									</svg>
								</div>
							{/snippet}
						</Button>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<svelte:document onfullscreenchange={handleFullscreenChange} />

<style>
	/* Ink + Signal: flat archival player shell. Square, hairline, no glass,
	   no shadow, no gradient wash — overrides the .surface-card global. */
	.media-player {
		padding: var(--space-6);
		border-radius: 0;
		margin-bottom: var(--space-8);
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
		transition: border-color var(--duration-normal) var(--ease-out);
		outline: none;
		position: relative;
	}

	.player-header {
		margin-bottom: var(--space-4);
	}

	.player-title {
		font-family: var(--font-family-display);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin: 0;
	}

	.error-message {
		background: color-mix(in srgb, var(--color-danger) calc(var(--opacity-5) * 100%), transparent);
		border: var(--border-width-thin) solid var(--color-danger);
		border-radius: var(--border-radius);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		color: var(--color-danger);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.media-container {
		position: relative;
		margin-bottom: var(--space-6);
		border-radius: 0;
		overflow: hidden;
		background: var(--color-surface-alt);
	}

	.media-element {
		width: 100%;
		height: auto;
		display: block;
		background: var(--color-black);
	}

	audio.media-element {
		display: none;
	}

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-black) calc(var(--opacity-50) * 100%), transparent);
		border-radius: 0;
	}

	.loading-spinner {
		width: var(--space-10);
		height: var(--space-10);
		border: var(--border-width-thick) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		border-top: var(--border-width-thick) solid var(--color-primary);
		border-left: var(--border-width-thick) solid var(--color-primary);
		border-bottom: var(--border-width-thick) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		border-right: var(--border-width-thick) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		border-radius: var(--border-radius-full);
		animation: spin var(--duration-slow) linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Flat control panel: elevated paper, hairline top rule, square. */
	.player-controls {
		position: relative;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		padding: var(--space-3);
		margin: var(--space-1) 0 0 0;
		transition: border-color var(--duration-normal) var(--ease-out);
	}

	.control-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-6);

		/* Refined layout */
		padding: var(--space-2) 0;
	}

	/* Flat square control buttons — no glass, no shadow, hairline border. */
	:global(.control-btn) {
		/* Fixed sizing to prevent layout shifts */
		min-width: var(--space-11) !important;
		min-height: var(--space-11) !important;

		cursor: pointer !important;

		background: var(--color-surface-elevated) !important;
		border: var(--border-width-thin) solid var(--color-border) !important;
		border-radius: 0 !important;
		box-shadow: none !important;
		color: var(--color-text-soft) !important;

		transition:
			background-color var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out) !important;

		&:hover {
			background: var(--color-accent) !important;
			border-color: var(--color-accent) !important;
			color: var(--color-text-inverted) !important;
		}

		&:active {
			background: var(--color-accent-dark) !important;
		}
	}

	/* Fixed icon container to prevent layout shifts */
	.control-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
		transition: color var(--duration-fast) var(--ease-out);
	}

	/* Responsive design */
	@media (--sm-down) {
		.media-player {
			padding: var(--space-4);
		}

		.player-controls {
			padding: var(--space-4);
		}

		.control-buttons {
			flex-wrap: wrap;
			gap: var(--space-4);
		}

		/* Ensure buttons remain touchable on mobile */
		:global(.control-btn) {
			min-width: var(--space-12) !important;
			min-height: var(--space-12) !important;
		}
	}

	@media (--md) {
		.control-buttons {
			gap: var(--space-8);
		}

		.player-controls {
			padding: var(--space-6);
		}
	}

	@media (--lg) {
		.control-buttons {
			gap: var(--space-10);
		}

		:global(.control-btn:hover) {
			transform: translateY(-2px) scale(1.05) !important;
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.media-player,
		.loading-spinner {
			transition: none;
			animation: none;
		}

		/* Ensure content is visible when animations are disabled */
		.media-player {
			opacity: 1;
			transform: none;
		}
	}

	/* Focus states for accessibility */
	.media-player:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-1);
	}

	/* Dark mode: warm near-black film ground, same flat treatment. */
	:global(html.dark) .player-controls {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark .control-btn) {
		background: var(--color-surface-elevated) !important;
		border-color: var(--color-border) !important;

		&:hover {
			background: var(--color-accent) !important;
			border-color: var(--color-accent) !important;
			color: var(--color-text-inverted) !important;
		}
	}
</style>
