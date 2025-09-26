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
	const responsiveSizes = width && height 
		? `(max-width: 640px) ${Math.min(width, 640)}px, (max-width: 1024px) ${Math.min(width, 1024)}px, ${width}px`
		: sizes;
</script>

<div class="optimized-image-container {className}" class:loaded={isLoaded} class:error={hasError}>
	{#if hasError}
		<div class="error-placeholder" role="img" aria-label={alt}>
			<span>⚠️ Image failed to load</span>
		</div>
	{:else}
		<picture>
			<!-- WebP format for modern browsers -->
			<source 
				srcset={getOptimizedSrc(src, 'webp')} 
				type="image/webp"
				{sizes}
			/>
			
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
		background-color: #f7f7f7;
		transition: opacity 0.3s ease;
	}

	.responsive-image {
		width: 100%;
		height: auto;
		object-fit: cover;
		transition: opacity 0.3s ease;
	}

	.optimized-image-container:not(.loaded) .responsive-image {
		opacity: 0;
	}

	.optimized-image-container.loaded .responsive-image {
		opacity: 1;
	}

	.loading-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
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
		min-height: 200px;
		background-color: #f3f4f6;
		color: #6b7280;
		font-size: 0.9rem;
		border: 1px dashed #d1d5db;
		border-radius: 8px;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.optimized-image-container {
			background-color: #374151;
		}

		.loading-placeholder {
			background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
			background-size: 200% 100%;
		}

		.error-placeholder {
			background-color: #374151;
			color: #d1d5db;
			border-color: #4b5563;
		}
	}

	/* Reduce animations for users who prefer reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.responsive-image,
		.optimized-image-container {
			transition: none;
		}

		.loading-placeholder {
			animation: none;
			background: #f0f0f0;
		}

		@media (prefers-color-scheme: dark) {
			.loading-placeholder {
				background: #374151;
			}
		}
	}
</style>