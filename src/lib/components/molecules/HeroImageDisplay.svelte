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

</script>

{#if displayImage}
    <figure class={figureClass}>
        <img 
            src="{base}{displayImage.src}" 
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