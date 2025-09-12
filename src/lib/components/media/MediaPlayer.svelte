<script lang="ts">
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import Button from '$lib/components/atoms/Button.svelte';

	// Props using Svelte 5 $props rune
	let {
		src,
		type = 'audio', // 'audio' | 'video'
		title = '',
		poster = undefined, // For video thumbnail
		autoplay = false,
		loop = false,
		muted = false,
		glassEffect = 'glass-card',
		animationDelay = 0,
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
		glassEffect?: string;
		animationDelay?: number;
		showControls?: boolean;
		width?: string | number;
		height?: string | number;
	} = $props();

	// State using Svelte 5 $state rune
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(1);
	let isMuted = $state(muted);
	let isFullscreen = $state(false);
	let isLoading = $state(true);
	let error = $state<string>('');

	// DOM element references
	let mediaElement: HTMLVideoElement | HTMLAudioElement | undefined = $state();
	let progressBar: HTMLDivElement | undefined = $state();

	// Timer
	let updateInterval: number;

	// Format time for display (derived computation)
	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	// Toggle play/pause
	const togglePlayPause = () => {
		if (!mediaElement) return;
		
		if (isPlaying) {
			mediaElement.pause();
		} else {
			mediaElement.play();
		}
	};

	// Seek to specific time
	const seekTo = (time: number) => {
		if (mediaElement) {
			mediaElement.currentTime = time;
		}
	};

	// Handle progress bar click using Svelte 5 event syntax
	const handleProgressClick = (event: MouseEvent) => {
		if (!progressBar || !mediaElement || duration === 0) return;
		
		const rect = progressBar.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const percentage = clickX / rect.width;
		const newTime = percentage * duration;
		
		seekTo(newTime);
	};

	// Handle progress bar keyboard navigation
	const handleProgressKeydown = (event: KeyboardEvent) => {
		if (!mediaElement || duration === 0) return;

		switch (event.code) {
			case 'ArrowLeft':
				event.preventDefault();
				seekTo(Math.max(0, currentTime - 10));
				break;
			case 'ArrowRight':
				event.preventDefault();
				seekTo(Math.min(duration, currentTime + 10));
				break;
			case 'Home':
				event.preventDefault();
				seekTo(0);
				break;
			case 'End':
				event.preventDefault();
				seekTo(duration);
				break;
		}
	};

	// Toggle mute
	const toggleMute = () => {
		if (mediaElement) {
			isMuted = !isMuted;
			mediaElement.muted = isMuted;
		}
	};

	// Set volume
	const setVolume = (newVolume: number) => {
		volume = Math.max(0, Math.min(1, newVolume));
		if (mediaElement) {
			mediaElement.volume = volume;
		}
	};

	// Toggle fullscreen (for video)
	const toggleFullscreen = async () => {
		if (type !== 'video' || !mediaElement) return;

		try {
			if (!isFullscreen) {
				await mediaElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch (err) {
			console.error('Fullscreen error:', err);
		}
	};

	// Media event handlers using Svelte 5 syntax
	const handleLoadedMetadata = () => {
		duration = mediaElement?.duration || 0;
		isLoading = false;
	};

	const handleTimeUpdate = () => {
		currentTime = mediaElement?.currentTime || 0;
	};

	const handlePlay = () => {
		isPlaying = true;
	};

	const handlePause = () => {
		isPlaying = false;
	};

	const handleEnded = () => {
		isPlaying = false;
		if (!loop) {
			currentTime = 0;
		}
	};

	const handleError = () => {
		error = 'Failed to load media file';
		isLoading = false;
	};

	const handleFullscreenChange = () => {
		isFullscreen = !!document.fullscreenElement;
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

<div 
	class="media-player {glassEffect}"
	use:scrollAnimate={{ delay: animationDelay, animationClass: 'fade-in-up' }}
	role="region"
	aria-label="Media Player"
>
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
					onloadedmetadata={handleLoadedMetadata}
					ontimeupdate={handleTimeUpdate}
					onplay={handlePlay}
					onpause={handlePause}
					onended={handleEnded}
					onerror={handleError}
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
					class="media-element"
					onloadedmetadata={handleLoadedMetadata}
					ontimeupdate={handleTimeUpdate}
					onplay={handlePlay}
					onpause={handlePause}
					onended={handleEnded}
					onerror={handleError}
					onkeydown={handleKeydown}
					tabindex="0"
				></audio>
				
				<!-- Audio visualization placeholder -->
				<div class="audio-visualization">
					<div class="audio-icon">
						<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 14.5c-0.83 0-1.5-0.67-1.5-1.5s0.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5-0.67 1.5-1.5 1.5zM5 9l1.5-1.5c0.39 0.39 0.39 1.03 0 1.42L5 9zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-0.8 2.04-2.78 3.5-5.11 3.5zM14.5 14.5c-0.83 0-1.5-0.67-1.5-1.5s0.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5-0.67 1.5-1.5 1.5zM18.5 9l-1.5 1.5c-0.39-0.39-0.39-1.03 0-1.42L18.5 9z"/>
						</svg>
					</div>
					{#if title}
						<p class="audio-title">{title}</p>
					{/if}
				</div>
			{/if}

			{#if isLoading}
				<div class="loading-overlay">
					<div class="loading-spinner"></div>
				</div>
			{/if}
		</div>

		{#if showControls && !isLoading}
			<div class="player-controls">
				<!-- Progress Bar -->
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

				<!-- Control Buttons -->
				<div class="control-buttons">
					<Button
						variant="ghost"
						size="sm"
						onclick={togglePlayPause}
						ariaLabel={isPlaying ? 'Pause' : 'Play'}
					>
						{#snippet icon()}
							{#if isPlaying}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<rect x="6" y="4" width="4" height="16"/>
									<rect x="14" y="4" width="4" height="16"/>
								</svg>
							{:else}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8 5v14l11-7z"/>
								</svg>
							{/if}
						{/snippet}
					</Button>

					<!-- Volume Controls -->
					<div class="volume-controls">
						<Button
							variant="ghost"
							size="sm"
							onclick={toggleMute}
							ariaLabel={isMuted ? 'Unmute' : 'Mute'}
						>
							{#snippet icon()}
								{#if isMuted || volume === 0}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
									</svg>
								{:else if volume < 0.5}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
									</svg>
								{:else}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
									</svg>
								{/if}
							{/snippet}
						</Button>

						<input
							type="range"
							min="0"
							max="1"
							step="0.1"
							value={isMuted ? 0 : volume}
							oninput={(e) => setVolume(parseFloat(e.currentTarget.value))}
							class="volume-slider"
							aria-label="Volume"
						/>
					</div>

					{#if type === 'video'}
						<Button
							variant="ghost"
							size="sm"
							onclick={toggleFullscreen}
							ariaLabel="Fullscreen"
						>
							{#snippet icon()}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
								</svg>
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
	.media-player {
		padding: var(--spacing-6);
		border-radius: var(--border-radius-xl);
		margin-bottom: var(--spacing-8);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		outline: none;
	}

	.player-header {
		margin-bottom: var(--spacing-4);
	}

	.player-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin: 0;
	}

	.error-message {
		background: rgba(var(--color-danger-rgb), 0.1);
		border: var(--border-width-thin) solid var(--color-danger);
		border-radius: var(--border-radius);
		padding: var(--spacing-4);
		margin-bottom: var(--spacing-4);
		color: var(--color-danger);
		font-size: var(--font-size-sm);
	}

	.media-container {
		position: relative;
		margin-bottom: var(--spacing-6);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		background: var(--color-black);
	}

	.media-element {
		width: 100%;
		height: auto;
		display: block;
		background: var(--color-black);
	}

	.audio-visualization {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-8);
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), 0.1) 0%, 
			rgba(var(--color-accent-rgb), 0.05) 100%);
		min-height: 200px;
	}

	.audio-icon {
		color: var(--color-primary);
		margin-bottom: var(--spacing-4);
		opacity: 0.7;
	}

	.audio-title {
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
		text-align: center;
		margin: 0;
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
		background: rgba(var(--color-black-rgb), 0.5);
		backdrop-filter: blur(4px);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(var(--color-primary-rgb), 0.3);
		border-top: 4px solid var(--color-primary);
		border-radius: var(--border-radius-full);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.player-controls {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	.progress-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.progress-bar {
		position: relative;
		height: 6px;
		background: rgba(var(--color-text-rgb), 0.2);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.progress-bar:hover {
		height: 8px;
	}

	.progress-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
		border-radius: var(--border-radius-full);
		transition: width 0.1s ease;
	}

	.progress-thumb {
		position: absolute;
		top: 50%;
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border: 2px solid var(--color-white);
		border-radius: var(--border-radius-full);
		transform: translate(-50%, -50%);
		opacity: 0;
		transition: opacity var(--anim-duration-base) var(--anim-ease-base);
		box-shadow: var(--shadow-sm);
	}

	.progress-bar:hover .progress-thumb {
		opacity: 1;
	}

	.time-display {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.control-buttons {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		justify-content: center;
	}

	.volume-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.volume-slider {
		width: 80px;
		height: 4px;
		background: rgba(var(--color-text-rgb), 0.2);
		border-radius: var(--border-radius-full);
		outline: none;
		appearance: none;
		cursor: pointer;
	}

	.volume-slider::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: 2px solid var(--color-white);
		box-shadow: var(--shadow-sm);
	}

	.volume-slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: 2px solid var(--color-white);
		box-shadow: var(--shadow-sm);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.media-player {
			padding: var(--spacing-4);
		}

		.control-buttons {
			flex-wrap: wrap;
			gap: var(--spacing-2);
		}

		.volume-controls {
			order: 1;
			width: 100%;
			justify-content: center;
		}

		.volume-slider {
			width: 120px;
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.media-player,
		.progress-bar,
		.progress-fill,
		.progress-thumb,
		.loading-spinner {
			transition: none;
			animation: none;
		}
	}

	/* Focus states for accessibility */
	.media-player:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--spacing-1);
	}

	.progress-bar:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--spacing-1);
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.progress-bar {
			background: rgba(var(--color-text-rgb), 0.5);
		}
		
		.progress-fill {
			background: var(--color-text);
		}
	}
</style>