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
	let isLoading = $state(false);
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

	// Handle progress bar click
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

	// Media event handlers
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
				
				<!-- Audio visualization -->
				<div class="audio-visualization">
					<!-- Animated waveform bars -->
					<div class="waveform">
						{#each Array(24) as _, i}
							<div 
								class="wave-bar" 
								style="animation-delay: {i * 50}ms; height: {20 + Math.sin(i * 0.5) * 15}px;"
							></div>
						{/each}
					</div>
					
					<!-- Central audio icon -->
					<div class="audio-icon-container">
						<div class="audio-icon-backdrop"></div>
						<div class="audio-icon">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
								<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
								<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
							</svg>
						</div>
					</div>
					
					{#if title}
						<div class="audio-content">
							<h4 class="audio-title">{title}</h4>
							<p class="audio-description">Listen to this AI-generated podcast discussion</p>
						</div>
					{/if}
					
					<!-- Subtle floating particles -->
					<div class="particles">
						{#each Array(6) as _, i}
							<div 
								class="particle" 
								style="
									left: {10 + i * 15}%; 
									animation-delay: {i * 200}ms;
									animation-duration: {3000 + i * 500}ms;
								"
							></div>
						{/each}
					</div>
				</div>
			{/if}

			{#if isLoading}
				<div class="loading-overlay">
					<div class="loading-spinner"></div>
				</div>
			{/if}
		</div>

		{#if showControls}
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
										<rect x="6" y="4" width="4" height="16"/>
										<rect x="14" y="4" width="4" height="16"/>
									</svg>
								{:else}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
										<path d="M8 5v14l11-7z"/>
									</svg>
								{/if}
							</div>
						{/snippet}
					</Button>

					<!-- Volume Controls Container -->
					<div class="volume-controls">
						<Button
							variant="ghost"
							size="sm"
							onclick={toggleMute}
							ariaLabel={isMuted ? 'Unmute' : 'Mute'}
							class="control-btn"
						>
							{#snippet icon()}
								<div class="control-icon control-icon--fixed {isMuted ? 'control-icon--muted' : ''}">
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
								oninput={(e) => setVolume(parseFloat(e.currentTarget.value))}
								class="volume-slider"
								data-muted={isMuted}
								style="--volume-percentage: {(isMuted ? 0 : volume) * 100}"
								aria-label="Volume"
							/>
						</div>
					</div>

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
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
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
	.media-player {
		padding: var(--spacing-6);
		border-radius: var(--border-radius-xl);
		margin-bottom: var(--spacing-8);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		outline: none;
		position: relative;
		
		/* Enhanced glassmorphism for "layers of knowledge" */
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg,
				rgba(var(--color-primary-rgb), var(--opacity-5)) 0%,
				transparent 50%,
				rgba(var(--color-accent-rgb), var(--opacity-5)) 100%);
			border-radius: var(--border-radius-xl);
			pointer-events: none;
			opacity: 0;
			transition: opacity var(--anim-duration-base) var(--anim-ease-base);
		}
		
		&:hover::before {
			opacity: 1;
		}
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
		background: rgba(var(--color-danger-rgb), var(--opacity-5));
		border: var(--border-width-thin) solid var(--color-danger);
		border-radius: var(--border-radius);
		padding: var(--spacing-4);
		margin-bottom: var(--spacing-4);
		color: var(--color-danger);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
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
		padding: var(--spacing-12);
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), var(--opacity-5)) 0%, 
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%);
		min-height: 280px;
		border-radius: var(--border-radius-lg);
		position: relative;
		overflow: hidden;
		
		/* Enhanced academic paper texture */
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: 
				radial-gradient(circle at 25% 25%, rgba(var(--color-white-rgb), var(--opacity-5)) 0%, transparent 50%),
				radial-gradient(circle at 75% 75%, rgba(var(--color-highlight-rgb), var(--opacity-5)) 0%, transparent 50%),
				linear-gradient(45deg, transparent 30%, rgba(var(--color-accent-rgb), var(--opacity-very-low)) 70%);
			pointer-events: none;
		}
		
		/* Subtle hover elevation */
		&:hover {
			transform: translateY(-3px);
			box-shadow: 
				var(--shadow-lg),
				0 0 40px rgba(var(--color-primary-rgb), var(--opacity-10));
		}
	}

	/* Animated waveform */
	.waveform {
		display: flex;
		align-items: end;
		gap: 3px;
		margin-bottom: var(--spacing-8);
		height: 60px;
	}

	.wave-bar {
		width: 4px;
		background: linear-gradient(to top, 
			var(--color-primary), 
			var(--color-accent));
		border-radius: var(--border-radius-full);
		animation: wave 2s ease-in-out infinite;
		opacity: 0.7;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.audio-visualization:hover .wave-bar {
		opacity: 1;
		animation-duration: 1.5s;
	}

	@keyframes wave {
		0%, 100% { 
			transform: scaleY(0.3);
			opacity: 0.5;
		}
		50% { 
			transform: scaleY(1);
			opacity: 1;
		}
	}

	/* Central audio icon */
	.audio-icon-container {
		position: relative;
		margin-bottom: var(--spacing-6);
		z-index: 2;
	}

	.audio-icon-backdrop {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80px;
		height: 80px;
		background: radial-gradient(circle, 
			rgba(var(--color-primary-rgb), var(--opacity-10)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-5)) 70%,
			transparent 100%);
		border-radius: var(--border-radius-full);
		animation: pulse 3s ease-in-out infinite;
	}

	.audio-icon {
		position: relative;
		color: var(--color-primary);
		background: rgba(var(--color-white-rgb), var(--opacity-90));
		border-radius: var(--border-radius-full);
		padding: var(--spacing-4);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(var(--color-primary-rgb), var(--opacity-20));
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		box-shadow: 
			var(--shadow-sm),
			0 0 20px rgba(var(--color-primary-rgb), var(--opacity-10));
	}

	.audio-icon:hover {
		transform: scale(1.1);
		color: var(--color-accent);
		box-shadow: 
			var(--shadow-lg),
			0 0 30px rgba(var(--color-accent-rgb), var(--opacity-20));
	}

	@keyframes pulse {
		0%, 100% { 
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.5;
		}
		50% { 
			transform: translate(-50%, -50%) scale(1.2);
			opacity: 0.8;
		}
	}

	/* Content styling */
	.audio-content {
		text-align: center;
		z-index: 2;
		position: relative;
	}

	.audio-title {
		color: var(--color-text);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--spacing-2) 0;
		line-height: var(--line-height-tight);
	}

	.audio-description {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		margin: 0;
		font-style: italic;
		opacity: 0.8;
	}

	/* Floating particles */
	.particles {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
	}

	.particle {
		position: absolute;
		width: 6px;
		height: 6px;
		background: radial-gradient(circle, 
			var(--color-highlight), 
			transparent);
		border-radius: var(--border-radius-full);
		animation: float linear infinite;
		opacity: 0.6;
	}

	@keyframes float {
		0% {
			transform: translateY(100%) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 0.6;
		}
		90% {
			opacity: 0.6;
		}
		100% {
			transform: translateY(-20px) rotate(360deg);
			opacity: 0;
		}
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
		background: rgba(var(--color-black-rgb), var(--opacity-50));
		backdrop-filter: blur(var(--glass-blur-amount));
		border-radius: var(--border-radius-lg);
	}

	.loading-spinner {
		width: var(--spacing-10);
		height: var(--spacing-10);
		border: var(--border-width-thick) solid rgba(var(--color-primary-rgb), var(--opacity-10));
		border-top: var(--border-width-thick) solid var(--color-primary);
		border-radius: var(--border-radius-full);
		animation: spin var(--anim-duration-slow) linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.player-controls {
		position: relative;
		
		/* Modern control panel design */
		background: rgba(var(--color-surface-rgb), var(--opacity-95));
		backdrop-filter: blur(20px);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-20));
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-5);
		margin: var(--spacing-2) 0 0 0;
		
		/* Elegant shadow system */
		box-shadow: 
			0 4px 20px rgba(var(--color-black-rgb), var(--opacity-5)),
			0 1px 3px rgba(var(--color-black-rgb), var(--opacity-10)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-10));
		
		/* Subtle academic refinement */
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: var(--spacing-6);
			right: var(--spacing-6);
			height: 1px;
			background: linear-gradient(90deg,
				transparent 0%,
				rgba(var(--color-accent-rgb), var(--opacity-20)) 50%,
				transparent 100%);
		}
		
		/* Smooth transitions */
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		
		&:hover {
			background: rgba(var(--color-surface-rgb), var(--opacity-98));
			box-shadow: 
				0 8px 32px rgba(var(--color-black-rgb), var(--opacity-10)),
				0 2px 8px rgba(var(--color-black-rgb), var(--opacity-15)),
				inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-15));
		}
	}

	.progress-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
		margin-bottom: var(--spacing-4);
	}

	.progress-bar {
		position: relative;
		height: 6px;
		background: rgba(var(--color-text-rgb), var(--opacity-10));
		border-radius: var(--border-radius-full);
		cursor: pointer;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		overflow: hidden;
		
		/* Subtle inner glow */
		box-shadow: inset 0 1px 2px rgba(var(--color-black-rgb), var(--opacity-10));
	}

	.progress-bar:hover {
		height: 8px;
		background: rgba(var(--color-text-rgb), var(--opacity-15));
		box-shadow: 
			inset 0 1px 3px rgba(var(--color-black-rgb), var(--opacity-15)),
			0 2px 8px rgba(var(--color-primary-rgb), var(--opacity-20));
	}

	.progress-bar:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--spacing-1);
	}

	.progress-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, 
			var(--color-primary), 
			var(--color-accent));
		border-radius: var(--border-radius-full);
		transition: width 0.1s ease;
		
		/* Elegant glow effect */
		box-shadow: 
			0 0 8px rgba(var(--color-primary-rgb), var(--opacity-30)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-20));
	}

	.progress-thumb {
		position: absolute;
		top: 50%;
		width: var(--spacing-4);
		height: var(--spacing-4);
		background: var(--color-primary);
		border: var(--border-width-medium) solid var(--color-white);
		border-radius: var(--border-radius-full);
		transform: translate(-50%, -50%);
		opacity: 0;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		box-shadow: 
			var(--shadow-sm),
			0 0 0 4px rgba(var(--color-primary-rgb), var(--opacity-20));
	}

	.progress-bar:hover .progress-thumb {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1.1);
		box-shadow: 
			var(--shadow-primary),
			0 0 0 6px rgba(var(--color-primary-rgb), var(--opacity-30));
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
		transition: opacity var(--anim-duration-base) var(--anim-ease-base);
	}
	
	.progress-container:hover .time-display {
		opacity: 1;
		color: var(--color-text);
	}

	.control-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-6);
		
		/* Refined layout */
		padding: var(--spacing-2) 0;
	}

	/* Modern control button styling */
	:global(.control-btn) {
		/* Fixed sizing to prevent layout shifts */
		min-width: 44px !important;
		min-height: 44px !important;
		
		/* Proper cursor */
		cursor: pointer !important;
		
		/* Modern glassmorphism design */
		background: rgba(var(--color-surface-rgb), var(--opacity-90)) !important;
		backdrop-filter: blur(12px) !important;
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-30)) !important;
		border-radius: var(--border-radius-lg) !important;
		
		/* Elegant shadows */
		box-shadow: 
			0 2px 8px rgba(var(--color-black-rgb), var(--opacity-5)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-15)) !important;
		
		/* Smooth interactions */
		transition: all var(--anim-duration-base) var(--anim-ease-base) !important;
		
		&:hover {
			background: rgba(var(--color-surface-rgb), var(--opacity-95)) !important;
			border-color: rgba(var(--color-primary-rgb), var(--opacity-40)) !important;
			transform: translateY(-1px) scale(1.02) !important;
			box-shadow: 
				0 4px 16px rgba(var(--color-black-rgb), var(--opacity-10)),
				0 2px 8px rgba(var(--color-primary-rgb), var(--opacity-20)),
				inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-20)) !important;
		}
		
		&:active {
			transform: translateY(0) scale(0.98) !important;
		}
	}

	/* Fixed icon container to prevent layout shifts */
	.control-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text);
		transition: color var(--anim-duration-base) var(--anim-ease-base);
	}

	.control-icon--fixed {
		/* Fixed dimensions for volume icon to prevent layout shifts */
		width: 20px;
		height: 20px;
	}

	/* Muted state styling */
	.control-icon--muted {
		color: #dc2626;
	}

	:global(.control-btn:hover) .control-icon {
		color: var(--color-primary);
	}

	:global(.control-btn:hover) .control-icon--muted {
		color: #ef4444;
	}

	.volume-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		
		/* Refined container */
		background: rgba(var(--color-surface-rgb), var(--opacity-50));
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-20));
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2) var(--spacing-3);
		backdrop-filter: blur(8px);
		
		/* Subtle inner glow */
		box-shadow: inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-10));
		
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.volume-controls:hover {
		background: rgba(var(--color-surface-rgb), var(--opacity-70));
		border-color: rgba(var(--color-accent-rgb), var(--opacity-30));
		box-shadow: 
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-15)),
			0 2px 8px rgba(var(--color-accent-rgb), var(--opacity-10));
	}

	.volume-slider-container {
		display: flex;
		align-items: center;
		padding: var(--spacing-1);
	}

	.volume-slider {
		width: var(--spacing-20);
		height: 6px;
		background: rgba(var(--color-surface-rgb), var(--opacity-70));
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-20));
		border-radius: var(--border-radius-full);
		outline: none;
		appearance: none;
		cursor: pointer;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		
		/* Enhanced track styling with glassmorphism */
		backdrop-filter: blur(4px);
		box-shadow: 
			inset 0 1px 3px rgba(var(--color-black-rgb), var(--opacity-10)),
			0 1px 2px rgba(var(--color-white-rgb), var(--opacity-10));
	}

	/* Default state - volume slider with blue color for sound */
	.volume-slider {
		background-image: linear-gradient(
			to right,
			var(--color-primary) 0%,
			var(--color-primary) calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) 100%
		);
	}

	/* Muted state - red color to indicate no sound */
	.volume-slider[data-muted="true"] {
		background-image: linear-gradient(
			to right,
			#dc2626 0%,
			#dc2626 calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) 100%
		);
	}

	.volume-slider:hover {
		background: rgba(var(--color-surface-rgb), var(--opacity-85));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-30));
		box-shadow: 
			inset 0 1px 3px rgba(var(--color-black-rgb), var(--opacity-15)),
			0 2px 4px rgba(var(--color-primary-rgb), var(--opacity-10)),
			0 1px 2px rgba(var(--color-white-rgb), var(--opacity-15));
		transform: scaleY(1.2);
	}

	/* Hover state for unmuted slider */
	.volume-slider:hover:not([data-muted="true"]) {
		background-image: linear-gradient(
			to right,
			var(--color-accent) 0%,
			var(--color-accent) calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) 100%
		);
	}

	/* Hover state for muted slider */
	.volume-slider:hover[data-muted="true"] {
		background-image: linear-gradient(
			to right,
			#ef4444 0%,
			#ef4444 calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) calc(var(--volume-percentage, 100%) * 1%),
			rgba(var(--color-text-rgb), var(--opacity-15)) 100%
		);
	}

	.volume-slider::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: 2px solid var(--color-white);
		box-shadow: 
			0 2px 4px rgba(var(--color-black-rgb), var(--opacity-20)),
			0 0 0 2px rgba(var(--color-primary-rgb), var(--opacity-20));
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.volume-slider::-webkit-slider-thumb:hover {
		background: var(--color-accent);
		transform: scale(1.1);
		box-shadow: 
			0 4px 8px rgba(var(--color-black-rgb), var(--opacity-30)),
			0 0 0 3px rgba(var(--color-accent-rgb), var(--opacity-30));
	}

	.volume-slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: 2px solid var(--color-white);
		box-shadow: 
			0 2px 4px rgba(var(--color-black-rgb), var(--opacity-20)),
			0 0 0 2px rgba(var(--color-primary-rgb), var(--opacity-20));
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.volume-slider::-moz-range-thumb:hover {
		background: var(--color-accent);
		transform: scale(1.1);
		box-shadow: 
			0 4px 8px rgba(var(--color-black-rgb), var(--opacity-30)),
			0 0 0 3px rgba(var(--color-accent-rgb), var(--opacity-30));
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.media-player {
			padding: var(--spacing-4);
		}

		.player-controls {
			padding: var(--spacing-4);
		}

		.control-buttons {
			flex-wrap: wrap;
			gap: var(--spacing-4);
		}

		.volume-controls {
			order: 1;
			width: 100%;
			justify-content: center;
			margin-top: var(--spacing-3);
		}

		.volume-slider {
			width: var(--spacing-32);
		}
		
		.audio-visualization {
			padding: var(--spacing-8);
			min-height: 240px;
		}
		
		.waveform {
			margin-bottom: var(--spacing-6);
		}
		
		.audio-title {
			font-size: var(--font-size-lg);
		}
		
		.audio-description {
			font-size: var(--font-size-xs);
		}

		/* Ensure buttons remain touchable on mobile */
		:global(.control-btn) {
			min-width: 48px !important;
			min-height: 48px !important;
		}
	}

	/* Enhanced responsiveness for larger screens */
	@media (min-width: 768px) {
		.volume-slider {
			width: var(--spacing-24);
		}
		
		.control-buttons {
			gap: var(--spacing-8);
		}

		.player-controls {
			padding: var(--spacing-6);
		}

		/* More refined spacing on larger screens */
		.progress-container {
			margin-bottom: var(--spacing-5);
		}
	}

	/* Extra large screens get even more refinement */
	@media (min-width: 1024px) {
		.volume-slider {
			width: var(--spacing-28);
		}

		.control-buttons {
			gap: var(--spacing-10);
		}

		/* Enhanced hover effects for desktop */
		:global(.control-btn:hover) {
			transform: translateY(-2px) scale(1.05) !important;
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
			background: rgba(var(--color-text-rgb), var(--opacity-50));
		}
		
		.progress-fill {
			background: var(--color-text-emphasis);
		}
		
		.audio-visualization {
			background: var(--color-surface-alt);
			border: var(--border-width-thin) solid var(--color-border);
		}
	}

	/* Dark mode enhancements for "paper-like to modern focused" experience */
	:global(html.dark) .media-player {
		/* Enhanced glassmorphism in dark mode */
		&::before {
			background: linear-gradient(135deg,
				rgba(var(--color-primary-rgb), var(--opacity-10)) 0%,
				transparent 50%,
				rgba(var(--color-accent-rgb), var(--opacity-10)) 100%);
		}
	}

	:global(html.dark) .player-controls {
		background: rgba(var(--color-surface-rgb), var(--opacity-90));
		border-color: rgba(var(--color-border-rgb), var(--opacity-30));
		
		&:hover {
			background: rgba(var(--color-surface-rgb), var(--opacity-95));
		}
	}

	:global(html.dark) .audio-visualization {
		/* More vibrant and energetic in dark mode */
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), var(--opacity-10)) 0%, 
			rgba(var(--color-accent-rgb), var(--opacity-10)) 100%);
			
		&::before {
			background: 
				radial-gradient(circle at 25% 25%, rgba(var(--color-accent-rgb), var(--opacity-5)) 0%, transparent 60%),
				radial-gradient(circle at 75% 75%, rgba(var(--color-highlight-rgb), var(--opacity-10)) 0%, transparent 60%),
				linear-gradient(45deg, transparent 30%, rgba(var(--color-primary-rgb), var(--opacity-very-low)) 70%);
		}
	}

	:global(html.dark) .audio-icon {
		background: rgba(var(--color-surface-rgb), var(--opacity-90));
		border-color: rgba(var(--color-accent-rgb), var(--opacity-30));
	}

	:global(html.dark) .progress-fill {
		/* More vibrant gradient in dark mode */
		background: linear-gradient(90deg, 
			var(--color-accent), 
			var(--color-highlight));
	}

	:global(html.dark .control-btn) {
		background: rgba(var(--color-surface-rgb), var(--opacity-80)) !important;
		border-color: rgba(var(--color-border-rgb), var(--opacity-40)) !important;
		
		&:hover {
			background: rgba(var(--color-surface-rgb), var(--opacity-95)) !important;
			border-color: rgba(var(--color-accent-rgb), var(--opacity-50)) !important;
		}
	}

	:global(html.dark) .volume-controls {
		background: rgba(var(--color-surface-rgb), var(--opacity-60));
		border-color: rgba(var(--color-border-rgb), var(--opacity-30));
		
		&:hover {
			background: rgba(var(--color-surface-rgb), var(--opacity-80));
			border-color: rgba(var(--color-accent-rgb), var(--opacity-40));
		}
	}
</style>