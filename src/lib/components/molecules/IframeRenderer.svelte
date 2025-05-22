<script lang="ts">
    import type { IframeEmbed } from '$lib/types/digitalHumanities';

    let {
        id,
        src,
        title = undefined,
        height = undefined,
        aspectRatio = undefined,
        containerClass = undefined,
        scrolling = 'auto',
        allowfullscreen = true
    }: IframeEmbed = $props();

    let finalContainerClass = $derived((() => {
        let baseClass = 'iframe-container'; // Default base class
        if (containerClass) {
            return containerClass; // Use provided class if available
        } else if (aspectRatio) {
            return `iframe-container-aspect iframe-container-aspect-${aspectRatio}`;
        } else if (height && !height.endsWith('px') && !height.endsWith('%') && !height.endsWith('vh') && !height.endsWith('em') && !height.endsWith('rem')) {
            // If height is a class name like iframe-container-sm
            return height;
        }
        return baseClass;
    })());

    let style = $derived((() => {
        let s = '';
        if (height && (height.endsWith('px') || height.endsWith('%') || height.endsWith('vh') || height.endsWith('em') || height.endsWith('rem'))) {
            // If height is a direct CSS value and not a class reference for the container
            if (containerClass && containerClass.includes('iframe-container-aspect')) {
                // If it's an aspect ratio container, height on iframe itself is usually 100%
                s = 'height: 100%;';
            } else {
                s = `height: ${height};`;
            }
        } else if (!height && !aspectRatio && !containerClass) {
            // Default height if nothing else is specified, ensures iframe is visible
            s = 'height: 600px;'; // Default from iframes.css for .iframe-container
        }
        return s;
    })());

</script>

<div class="{finalContainerClass}">
    <iframe
        {id}
        {src}
        title={title || 'Embedded content'}
        {style}
        frameborder="0"
        scrolling={scrolling}
        allowfullscreen={allowfullscreen}
        loading="lazy"
    ></iframe>
</div>

<!-- 
    Potential classes from iframes.css to consider for props/logic:
    - iframe-container (base, fixed height)
    - iframe-container-aspect (base, aspect ratio)
    - iframe-container-aspect-16-9, 4-3, 1-1, 21-9
    - iframe-container-xs, sm, md, lg, xl, fullheight (size variations for fixed height)
    - iframe-container-no-margin
    - iframe-container-loading (JS handled)
    - iframe-loaded (JS handled)
    - iframe-container-lightweight
    - iframe-interactive
    - iframe-container-bordered, -accent, -highlight
    - iframe-with-header (complex, might need its own component or more props)
-->