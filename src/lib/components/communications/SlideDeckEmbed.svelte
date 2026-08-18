<script lang="ts">
	import Icon from '@iconify/svelte';
	import { base } from '$app/paths';
	import { imageVariantManifest } from '$lib/data/imageVariants.generated';
	import { buildSrcset, resolveImagePath } from '$lib/utils/imageVariants';

	interface Props {
		/** Embeddable deck URL (e.g. https://slides.frederickmadore.com/talks/<slug>/). */
		src: string;
		/** Talk title — used for the iframe's accessible name. */
		title: string;
	}

	let { src, title }: Props = $props();

	// The reveal.js runtime (CSS + fonts + JS) is heavy, so the iframe is not
	// mounted until the reader asks for it. The deck's own cover slide stands in
	// until then — keeps the detail page light and lets the deck load on intent.
	let activated = $state(false);
	let stageEl = $state<HTMLDivElement | null>(null);

	// Host for the faux-chrome bar (echoes the .site-frame motif used in decks).
	const host = $derived.by(() => {
		try {
			return new URL(src).host;
		} catch {
			return 'Slides';
		}
	});

	// The deck site renders a 1280x720 shot of every cover slide;
	// scripts/generate-slide-posters.mjs mirrors it into static/images, so the
	// facade opens on the actual title slide rather than an empty stage.
	// Presence in the variant manifest is the existence check — a deck whose
	// poster was never mirrored simply falls back to the plain facade, and
	// `npm run check:slides` is what reports it.
	const posterPath = $derived.by(() => {
		let slug: string | undefined;
		try {
			const segments = new URL(src).pathname.split('/').filter(Boolean);
			if (segments[0] === 'talks') slug = segments[1];
		} catch {
			return undefined;
		}
		if (!slug) return undefined;
		const key = `communications/slides/${slug}.webp`;
		return key in imageVariantManifest ? `images/${key}` : undefined;
	});
	const posterSrc = $derived(resolveImagePath(posterPath, base));
	const posterSrcset = $derived(buildSrcset(posterSrc));
	// Measured against the detail page's content column: the stage caps at
	// 1150px and sits at roughly 85vw below that. Overstating a slot only costs
	// bytes; understating it picks a candidate too small and renders soft.
	const POSTER_SIZES = '(min-width: 1200px) 1150px, 85vw';

	function activate() {
		activated = true;
	}

	function enterFullscreen() {
		activated = true;
		// stageEl is already in the DOM, so requesting fullscreen stays inside the
		// click gesture even though the iframe mounts on the next tick.
		stageEl?.requestFullscreen?.().catch(() => {
			/* fullscreen may be blocked; fall back to the inline view */
		});
	}
</script>

<figure class="deck-embed" class:is-active={activated}>
	<div class="deck-chrome">
		<span class="deck-chrome-host">
			<Icon icon="lucide:presentation" width="13" height="13" aria-hidden="true" />
			<span>{host}</span>
		</span>
		<span class="deck-chrome-actions">
			<button type="button" class="deck-chrome-btn" onclick={enterFullscreen}>
				<Icon icon="lucide:maximize" width="13" height="13" aria-hidden="true" />
				<span>Fullscreen</span>
			</button>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external deck on the slides subdomain -->
			<a class="deck-chrome-btn" href={src} target="_blank" rel="noopener noreferrer">
				<span>Open deck</span>
				<Icon icon="lucide:arrow-up-right" width="13" height="13" aria-hidden="true" />
			</a>
		</span>
	</div>

	<div class="deck-stage" bind:this={stageEl}>
		{#if activated}
			<iframe
				class="deck-frame"
				{src}
				title="Slides — {title}"
				loading="lazy"
				allow="fullscreen"
				allowfullscreen
			></iframe>
		{:else}
			<button
				type="button"
				class="deck-facade"
				onclick={activate}
				aria-label="Load and view the slide deck for {title}"
			>
				<span class="deck-facade-plate">
					{#if posterSrc}
						<!-- Decorative: the button's aria-label already names the deck. -->
						<img
							class="deck-poster"
							src={posterSrc}
							srcset={posterSrcset}
							sizes={posterSrcset ? POSTER_SIZES : undefined}
							alt=""
							width="1280"
							height="720"
							loading="lazy"
							decoding="async"
						/>
					{/if}
				</span>
				<!-- Caption strip, the plate idiom: the affordance sits below the
				     image on its own ground rather than washing over it. -->
				<span class="deck-facade-bar">
					<span class="deck-facade-play"><Icon icon="lucide:play" width="16" height="16" /></span>
					<span class="deck-facade-label">View slides</span>
					<span class="deck-facade-hint">Loads the interactive deck</span>
				</span>
			</button>
		{/if}
	</div>
</figure>

<style>
	/* Flat film plate — square, hairline border, no shadow, no blur. */
	.deck-embed {
		margin: 0;
		border-radius: 0;
		overflow: hidden;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
	}

	/* Faux-chrome bar — a quiet frame strip; its labels are the data voice. */
	.deck-chrome {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-2xs) var(--space-sm);
		background: var(--color-surface-alt);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	.deck-chrome-host {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		min-width: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.deck-chrome-host span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.deck-chrome-actions {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	/* Chrome buttons — flat square mono chips. */
	.deck-chrome-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-soft);
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		cursor: pointer;
		text-decoration: none;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.deck-chrome-btn:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.deck-chrome-btn:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: 2px;
	}

	.deck-stage {
		position: relative;
		aspect-ratio: 16 / 9;
		width: 100%;
		background: var(--color-surface);
	}

	.deck-frame {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	/* Facade: the deck's own cover slide as a plate, with the affordance on a
	 * caption strip beneath it — no heavy iframe until the reader opts in. */
	.deck-facade {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: 1fr auto;
		padding: 0;
		border: 0;
		cursor: pointer;
		text-align: left;
		background: var(--color-surface-alt);
	}

	.deck-facade:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: -4px;
	}

	/* The plate itself. min-height:0 lets the row shrink instead of overflowing. */
	.deck-facade-plate {
		position: relative;
		min-height: 0;
		overflow: hidden;
		background: var(--color-surface-alt);
	}

	/* A faithful reproduction: the cover is not tinted, dimmed or theme-flipped
	 * in midnight — a plate reads the same in both, like every other scan on
	 * the site. */
	.deck-poster {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
	}

	/* Caption strip — ledger-like: play plate, display-voice label, mono hint. */
	.deck-facade-bar {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-alt);
		border-top: var(--border-width-thin) solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.deck-facade:hover .deck-facade-bar {
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-alt));
	}

	/* Play glyph — a square accent-bordered plate, no circle, no scale. */
	.deck-facade-play {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: var(--space-xl);
		height: var(--space-xl);
		border-radius: 0;
		color: var(--color-accent);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-accent);
	}

	/* Label — the display voice; hint — the data voice. */
	.deck-facade-label {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-base);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-text-emphasis);
	}

	.deck-facade-hint {
		margin-left: auto;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	/* The hint is a nicety; the label carries the meaning. */
	@media (--sm-down) {
		.deck-facade-hint {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.deck-chrome-btn,
		.deck-facade-bar {
			transition: none;
		}
	}
</style>
