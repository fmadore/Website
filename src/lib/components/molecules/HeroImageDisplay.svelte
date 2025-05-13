<script lang="ts">
    import { base } from '$app/paths';

    export let heroImage: { src: string; alt?: string; caption?: string } | undefined | null = undefined;
    export let fallbackImage: string | undefined | null = undefined;
    export let defaultAlt: string = 'Hero image';
    export let imageClass: string = 'w-full max-w-md h-auto rounded-md mx-auto'; // Default class, can be overridden
    export let figureClass: string = 'mb-6';
    export let figcaptionClass: string = 'text-text-muted text-sm mt-2 italic text-center';

    $: displayImage = heroImage?.src ? heroImage : fallbackImage ? { src: fallbackImage, alt: defaultAlt } : null;
    $: altText = (displayImage === heroImage ? heroImage?.alt : '') || defaultAlt;
    $: captionText = displayImage === heroImage ? heroImage?.caption : null;

    let absoluteSrc: string | null = null;
    $: {
        if (displayImage && displayImage.src) {
            if (displayImage.src.startsWith('http://') || displayImage.src.startsWith('https://')) {
                absoluteSrc = displayImage.src;
            } else {
                // Ensure it's treated as relative to the base path, removing any leading slash from src itself
                const path = displayImage.src.startsWith('/') ? displayImage.src.substring(1) : displayImage.src;
                absoluteSrc = `${base}/${path}`.replace(/\/\//g, '/'); // Replace double slashes just in case
            }
        } else {
            absoluteSrc = null;
        }
    }

</script>

{#if displayImage && absoluteSrc}
    <figure class={figureClass}>
        <img 
            src={absoluteSrc} 
            alt={altText}
            class={imageClass}
        >
        {#if captionText}
            <figcaption class={figcaptionClass}>
                {captionText}
            </figcaption>
        {/if}
    </figure>
{/if} 