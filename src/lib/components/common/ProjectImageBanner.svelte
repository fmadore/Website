<script lang="ts">
	let {
		src,
		alt,
		width = 800,
		height = 600,
		caption = undefined,
		additionalClasses = '',
		scrollAnimation = true
	}: {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		/** Optional caption rendered beneath the plate in Spectral italic. */
		caption?: string | undefined;
		additionalClasses?: string;
		scrollAnimation?: boolean;
	} = $props();

	const animationClass = $derived(scrollAnimation ? 'scroll-reveal-scale' : '');
	const combinedClasses = $derived(
		`project-image-banner ${animationClass} ${additionalClasses}`.trim()
	);
</script>

<figure class={combinedClasses}>
	<img {src} {alt} {width} {height} loading="lazy" decoding="async" class="project-image" />
	{#if caption}
		<figcaption class="project-image-caption">{caption}</figcaption>
	{/if}
</figure>

<style>
	/*
	 * Documentary plate. The photograph is presented clean: square corners, a
	 * single hairline frame, no shadow, no glass scrim, gradient sheen, glow,
	 * hover lift, or image zoom — a scan mounted flat on the page. Where it
	 * needs labelling, it takes a plain serif-italic caption beneath.
	 */
	.project-image-banner {
		margin: 0 0 var(--space-6);
		display: block;
	}

	.project-image {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 0;
		border: var(--border-width-thin) solid var(--color-border-dark);
	}

	.project-image-caption {
		margin-top: var(--space-2);
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
	}

	@media (--sm) {
		.project-image-banner {
			margin-bottom: var(--space-8);
		}
	}
</style>
