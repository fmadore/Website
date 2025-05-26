<script lang="ts">
	import { base } from '$app/paths';

	let {
		heroImage = undefined,
		fallbackImage = undefined,
		defaultAlt = 'Hero image',
		imageClass = 'w-full max-w-md h-auto rounded-md mx-auto', // Default class, can be overridden
		figureClass = 'mb-6',
		figcaptionClass = 'text-text-muted text-sm mt-2 italic text-center'
	}: {
		heroImage?: { src: string; alt?: string; caption?: string } | undefined | null;
		fallbackImage?: string | undefined | null;
		defaultAlt?: string;
		imageClass?: string;
		figureClass?: string;
		figcaptionClass?: string;
	} = $props();

	const displayImage = $derived(
		heroImage?.src ? heroImage : fallbackImage ? { src: fallbackImage, alt: defaultAlt } : null
	);
	const altText = $derived((displayImage === heroImage ? heroImage?.alt : '') || defaultAlt);
	const captionText = $derived(displayImage === heroImage ? heroImage?.caption : null);
	const absoluteSrc = $derived(
		displayImage && displayImage.src
			? displayImage.src.startsWith('http://') || displayImage.src.startsWith('https://')
				? displayImage.src
				: (() => {
						// Ensure it's treated as relative to the base path, removing any leading slash from src itself
						const path = displayImage.src.startsWith('/')
							? displayImage.src.substring(1)
							: displayImage.src;
						return `${base}/${path}`.replace(/\/\//g, '/'); // Replace double slashes just in case
					})()
			: null
	);
</script>

{#if displayImage && absoluteSrc}
	<figure class={figureClass}>
		<img 
			src={absoluteSrc} 
			alt={altText} 
			class={imageClass}
			width="600"
			height="400"
			loading="lazy"
			decoding="async"
		/>
		{#if captionText}
			<figcaption class={figcaptionClass}>
				{captionText}
			</figcaption>
		{/if}
	</figure>
{/if}
