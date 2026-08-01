<script lang="ts">
	import type { IframeEmbed } from '$lib/types/digitalHumanities';

	const DEFAULT_SANDBOX =
		'allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts';

	let {
		id,
		src,
		title = 'Embedded content',
		height = undefined,
		variant = 'responsive',
		allowfullscreen = true,
		sandbox = DEFAULT_SANDBOX
	}: Omit<IframeEmbed, 'type'> = $props();
</script>

<div class="iframe-frame iframe-frame--{variant}" style:--iframe-height={height}>
	<iframe
		{id}
		{src}
		{title}
		allow={allowfullscreen ? 'fullscreen' : undefined}
		{allowfullscreen}
		sandbox={sandbox ?? undefined}
		referrerpolicy="strict-origin-when-cross-origin"
		loading="lazy"
	></iframe>
</div>

<style>
	.iframe-frame {
		position: relative;
		width: 100%;
		margin-block-end: var(--space-8);
		border: var(--border-width-thin) solid var(--color-border);
		background: var(--color-surface);
		overflow: hidden;
	}

	.iframe-frame--responsive {
		aspect-ratio: 16 / 9;
		min-height: 24rem;
	}

	.iframe-frame--fixed,
	.iframe-frame--document {
		height: var(--iframe-height, var(--iframe-height-default));
	}

	iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}

	@media (--sm-down) {
		.iframe-frame--responsive {
			aspect-ratio: 3 / 4;
			min-height: 28rem;
		}
	}

	@media print {
		.iframe-frame {
			break-inside: avoid;
			height: var(--iframe-height-sm);
			aspect-ratio: auto;
			min-height: 0;
			border-color: var(--color-black);
			background: var(--color-white);
		}
	}
</style>
