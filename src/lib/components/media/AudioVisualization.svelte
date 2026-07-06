<script lang="ts">
	let { title = '' }: { title?: string } = $props();
</script>

<div class="audio-visualization">
	<!-- Animated waveform bars -->
	<div class="waveform">
		{#each Array(24), i (i)}
			<div
				class="wave-bar"
				style="animation-delay: {i * 50}ms; height: {10 + Math.sin(i * 0.5) * 8}px;"
			></div>
		{/each}
	</div>
	<!-- Central audio icon -->
	<div class="audio-icon-container">
		<div class="audio-icon-backdrop"></div>
		<div class="audio-icon">
			<svg
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
				<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
				<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
			</svg>
		</div>
	</div>

	{#if title}
		<div class="audio-content">
			<h4 class="audio-title">{title}</h4>
			<p class="audio-description">
				<a href="https://notebooklm.google/audio" target="_blank" rel="noopener noreferrer"
					>Google NotebookLM</a
				>
				is an AI-powered research assistant that can generate podcast-style discussions from uploaded
				documents. All the publications from this research project were fed into NotebookLM to create
				this AI-generated conversation.
			</p>
		</div>
	{/if}

	<!-- Subtle floating particles -->
	<div class="particles">
		{#each Array(6), i (i)}
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

<style>
	/* Ink + Signal: a flat archival panel — warm paper ground, hairline rule,
	   square corners, no gradient wash, no glass, no shadow. */
	.audio-visualization {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border-light);
		min-height: 120px;
		border-radius: 0;
		position: relative;
		overflow: hidden;
	}

	/* Animated waveform */
	.waveform {
		display: flex;
		align-items: end;
		gap: 3px;
		margin-bottom: var(--space-3);
		height: 30px;
	}

	.wave-bar {
		width: var(--space-1);
		background: linear-gradient(to top, var(--color-text-emphasis), var(--color-accent));
		border-radius: 0;
		animation: wave var(--duration-slower) var(--ease-in-out) infinite;
		opacity: 0.75;
		transition: all var(--duration-normal) var(--ease-out);
	}

	.audio-visualization:hover .wave-bar {
		opacity: 1;
		animation-duration: var(--duration-slow);
	}

	@keyframes wave {
		0%,
		100% {
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
		margin-bottom: var(--space-2);
		z-index: 2;
	}

	.audio-icon-backdrop {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 50px;
		height: 50px;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-10) * 100%), transparent) 0%,
			transparent 70%
		);
		border-radius: 0;
		animation: pulse 3s ease-in-out infinite;
	}

	/* Flat ink plate with a hairline rule — no glass, no shadow. */
	.audio-icon {
		position: relative;
		color: var(--color-accent);
		background: var(--color-surface);
		border-radius: 0;
		padding: var(--space-2);
		border: var(--border-width-thin) solid var(--color-border);
		transition:
			color var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out);
	}

	.audio-icon:hover {
		color: var(--color-accent-dark);
		border-color: var(--color-accent);
	}

	@keyframes pulse {
		0%,
		100% {
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
		color: var(--color-text-emphasis);
		font-family: var(--font-family-display);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--space-2) 0;
		line-height: var(--line-height-tight);
	}

	.audio-description {
		color: var(--color-text-soft);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		margin: 0;
		line-height: var(--line-height-normal);
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.audio-description a {
		color: var(--color-primary);
		text-decoration: underline;
		font-weight: var(--font-weight-semibold);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.audio-description a:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-shadow: 0 1px 3px color-mix(in srgb, var(--color-black) 80%, transparent);
		transform: translateY(-1px);
	}

	/* Dark mode — use warm paper foreground (resolves to a bright off-white
	 * tinted toward the brand warmth, not pure cool white). Link hover
	 * picks up the rare primary accent rather than amber. */
	:global(html.dark) .audio-description {
		color: var(--color-text-emphasis);
		text-shadow: 0 1px 3px color-mix(in srgb, var(--color-black) 70%, transparent);
	}

	:global(html.dark) .audio-description a {
		color: var(--color-text-emphasis);
		text-shadow: 0 1px 3px color-mix(in srgb, var(--color-black) 80%, transparent);
	}

	:global(html.dark) .audio-description a:hover {
		color: var(--color-primary-light);
		text-shadow: 0 1px 4px color-mix(in srgb, var(--color-black) 90%, transparent);
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
		width: var(--space-1-5);
		height: var(--space-1-5);
		background: radial-gradient(circle, var(--color-highlight), transparent);
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

	/* Dark mode: warm near-black microfilm ground, same flat treatment. */
	:global(html.dark) .audio-visualization {
		background: var(--color-surface-elevated);
		border-color: var(--color-border);
	}

	:global(html.dark) .audio-icon {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.wave-bar,
		.audio-icon-backdrop,
		.particle,
		.audio-visualization,
		.audio-icon {
			transition: none;
			animation: none;
		}

		.wave-bar {
			transform: scaleY(0.6);
			opacity: 0.7;
		}

		.audio-visualization:hover {
			transform: none;
		}

		.audio-icon:hover {
			transform: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.audio-visualization {
			background: var(--color-surface-alt);
			border: var(--border-width-thin) solid var(--color-border);
		}
	}

	/* Responsive design */
	@media (--sm-down) {
		.audio-visualization {
			padding: var(--space-8);
			min-height: 240px;
		}

		.waveform {
			margin-bottom: var(--space-6);
		}

		.audio-title {
			font-size: var(--font-size-lg);
		}

		.audio-description {
			font-size: var(--font-size-xs);
		}
	}
</style>
