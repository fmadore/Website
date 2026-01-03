<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		class?: string;
		sizes?: string;
		loading?: 'lazy' | 'eager';
		fetchpriority?: 'high' | 'low' | 'auto';
		decoding?: 'sync' | 'async' | 'auto';
		placeholder?: string;
	}

	let {
		src,
		alt,
		width,
		height,
		class: className = '',
		sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
		loading = 'lazy',
		fetchpriority = 'auto',
		decoding = 'async',
		placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FhYSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNHB4Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=='
	}: Props = $props();

	let isLoaded = $state(false);
	let hasError = $state(false);
	let imgElement = $state<HTMLImageElement | null>(null);

	// Generate WebP and fallback sources
	const getWebPSrc = (originalSrc: string) => {
		if (originalSrc.endsWith('.webp')) return originalSrc;
		const lastDot = originalSrc.lastIndexOf('.');
		return originalSrc.substring(0, lastDot) + '.webp';
	};

	const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'original' = 'original') => {
		if (format === 'webp') {
			return getWebPSrc(originalSrc);
		}
		return originalSrc;
	};

	// Intersection Observer for lazy loading enhancement
	let observer: IntersectionObserver | null = null;

	$effect(() => {
		if (browser && imgElement && loading === 'lazy') {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const img = entry.target as HTMLImageElement;
							if (img.dataset.src) {
								img.src = img.dataset.src;
								img.removeAttribute('data-src');
							}
							observer?.unobserve(img);
						}
					});
				},
				{
					rootMargin: '50px'
				}
			);

			if (imgElement) {
				observer.observe(imgElement);
			}
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});

	function handleLoad() {
		isLoaded = true;
	}

	function handleError() {
		hasError = true;
		console.warn(`Failed to load image: ${src}`);
	}

	// Generate responsive sizes for common breakpoints
	const responsiveSizes = $derived(
		width && height
			? `(max-width: 640px) ${Math.min(width, 640)}px, (max-width: 1024px) ${Math.min(width, 1024)}px, ${width}px`
			: sizes
	);
</script>

<div class="optimized-image-container {className}" class:loaded={isLoaded} class:error={hasError}>
	{#if hasError}
		<div class="error-placeholder" role="img" aria-label={alt}>
			<span>⚠️ Image failed to load</span>
		</div>
	{:else}
		<picture>
			<!-- WebP format for modern browsers -->
			<source srcset={getOptimizedSrc(src, 'webp')} type="image/webp" {sizes} />

			<!-- Fallback for older browsers -->
			<img
				bind:this={imgElement}
				src={loading === 'lazy' ? placeholder : src}
				data-src={loading === 'lazy' ? src : undefined}
				{alt}
				{width}
				{height}
				{loading}
				{fetchpriority}
				{decoding}
				sizes={responsiveSizes}
				class="responsive-image"
				onload={handleLoad}
				onerror={handleError}
			/>
		</picture>

		{#if !isLoaded}
			<div class="loading-placeholder" aria-hidden="true">
				<div class="loading-shimmer"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.optimized-image-container {
		position: relative;
		overflow: hidden;
		background-color: var(--color-surface);
		transition: opacity var(--anim-duration-base) var(--anim-ease-base);
	}

	.responsive-image {
		width: 100%;
		height: auto;
		object-fit: cover;
		transition: opacity var(--anim-duration-base) var(--anim-ease-base);
	}

	.optimized-image-container:not(.loaded) .responsive-image {
		opacity: var(--opacity-0);
	}

	.optimized-image-container.loaded .responsive-image {
		opacity: var(--opacity-100);
	}

	.loading-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			var(--color-surface-alt) 25%,
			var(--color-border) 50%,
			var(--color-surface-alt) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	/* Dark mode shimmer adjustment */
	:global(html.dark) .loading-placeholder {
		background: linear-gradient(
			90deg,
			var(--color-surface) 25%,
			var(--color-surface-elevated) 50%,
			var(--color-surface) 75%
		);
		background-size: 200% 100%;
	}

	.optimized-image-container.loaded .loading-placeholder {
		display: none;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.error-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--space-18);
		background-color: var(--color-surface);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		border: var(--border-width-thin) dashed var(--color-border);
		border-radius: var(--border-radius-lg);
	}

	/* Reduce animations for users who prefer reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.responsive-image,
		.optimized-image-container {
			transition: none;
		}

		.loading-placeholder {
			animation: none;
			background: var(--color-surface-alt);
		}

		:global(html.dark) .loading-placeholder {
			background: var(--color-surface);
		}
	}
</style>
