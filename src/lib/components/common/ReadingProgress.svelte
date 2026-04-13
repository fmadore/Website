<script lang="ts">
	import { browser } from '$app/environment';

	/**
	 * A slim reading-progress bar pinned to the top of the viewport.
	 *
	 * Uses CSS scroll-driven animations (`animation-timeline: scroll()`)
	 * where supported, and falls back to a lightweight JS-driven update
	 * (rAF-throttled scroll listener) everywhere else. Respects
	 * `prefers-reduced-motion` — the bar still tracks scroll position, but
	 * without transition smoothing.
	 */
	let progress = $state(0);
	let supportsScrollTimeline = $state(true);

	$effect(() => {
		if (!browser) return;

		// Feature-detect scroll-driven animations. When unsupported, fall
		// back to a rAF-throttled scroll listener.
		supportsScrollTimeline = CSS.supports('animation-timeline: scroll()');

		if (supportsScrollTimeline) return;

		let ticking = false;
		const update = () => {
			const doc = document.documentElement;
			const max = doc.scrollHeight - doc.clientHeight;
			progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
			ticking = false;
		};

		const onScroll = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<div
	class="reading-progress"
	class:reading-progress--js={!supportsScrollTimeline}
	role="progressbar"
	aria-label="Reading progress"
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={Math.round(progress * 100)}
>
	<div class="reading-progress__bar" style:--reading-progress={progress}></div>
</div>

<style>
	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--space-0-5);
		z-index: calc(var(--z-sticky) + 1);
		pointer-events: none;
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	.reading-progress__bar {
		height: 100%;
		width: 100%;
		transform-origin: 0 50%;
		transform: scaleX(var(--reading-progress, 0));
		background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-highlight) 100%);
		box-shadow: 0 0 8px
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-medium) * 100%), transparent);
	}

	/* Modern browsers: drive the transform from scroll position directly,
	 * no JS needed. */
	@supports (animation-timeline: scroll()) {
		.reading-progress:not(.reading-progress--js) .reading-progress__bar {
			animation: readingProgressScroll linear;
			animation-timeline: scroll(root block);
			transform: scaleX(0);
		}
	}

	@keyframes readingProgressScroll {
		to {
			transform: scaleX(1);
		}
	}

	/* JS fallback path uses the inline --reading-progress custom property
	 * updated from the $effect above. Keep a short smoothing transition so
	 * rAF-driven updates feel cohesive without lagging the scroll. */
	.reading-progress--js .reading-progress__bar {
		transition: transform 80ms linear;
	}

	@media (prefers-reduced-motion: reduce) {
		.reading-progress--js .reading-progress__bar {
			transition: none;
		}

		@supports (animation-timeline: scroll()) {
			.reading-progress:not(.reading-progress--js) .reading-progress__bar {
				/* Scroll-linked animation itself is not a "motion" animation,
				 * but keep the visual in sync without extra smoothing. */
				animation-duration: 1ms;
			}
		}
	}

	@media print {
		.reading-progress {
			display: none;
		}
	}
</style>
