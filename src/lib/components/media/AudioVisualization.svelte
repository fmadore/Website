<script lang="ts">
	let { title = '' }: { title?: string } = $props();
</script>

<div class="audio-visualization">
	<!-- Static waveform figure — a typeset diagram, not an animation -->
	<div class="waveform" aria-hidden="true">
		{#each Array(24), i (i)}
			<div class="wave-bar" style="height: {10 + Math.sin(i * 0.5) * 8}px;"></div>
		{/each}
	</div>
	<!-- Central audio icon -->
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
</div>

<style>
	/* Ink + Signal: a flat archival panel — warm paper ground, hairline rule,
	   square corners, no gradient, no glow, no ambient motion. */
	.audio-visualization {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border-light);
		min-height: 120px;
		position: relative;
		overflow: hidden;
	}

	/* Static waveform — flat ink bars, accent-free by default */
	.waveform {
		display: flex;
		align-items: end;
		gap: 3px;
		margin-bottom: var(--space-3);
		height: 30px;
	}

	.wave-bar {
		width: var(--space-1);
		background: var(--color-text-emphasis);
		opacity: 0.75;
	}

	/* Flat ink plate with a hairline rule — no glass, no shadow. */
	.audio-icon {
		position: relative;
		margin-bottom: var(--space-2);
		color: var(--color-accent);
		background: var(--color-surface);
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

	/* Content styling */
	.audio-content {
		text-align: center;
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
		transition: color var(--duration-fast) var(--ease-out);
	}

	.audio-description a:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	/* Dark mode — warm microfilm negative: cream type on near-black ground. */
	:global(html.dark) .audio-visualization {
		background: var(--color-surface-elevated);
		border-color: var(--color-border);
	}

	:global(html.dark) .audio-icon {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .audio-description {
		color: var(--color-text-emphasis);
	}

	:global(html.dark) .audio-description a {
		color: var(--color-text-emphasis);
	}

	:global(html.dark) .audio-description a:hover {
		color: var(--color-primary-light);
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
