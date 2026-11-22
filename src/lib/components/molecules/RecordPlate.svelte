<!--
RecordPlate — the plate that opens a record's metadata rail.

The cover, scan or event photograph each record rail sets above its ledger,
built once: the srcset and its `sizes` from the image manifest, the intrinsic
size so the box is reserved before the bytes arrive, `plateFallback` for an
image that never comes, and the `Fig. 1.` caption when the record has one.
Used by the publication, talk, activity and DH project rails and by the
research project aside.
-->
<script module lang="ts">
	/**
	 * The rail is 380px wide from --lg up; below that the plate spans the single
	 * column. Exported because the activity route preloads its plate for LCP,
	 * and the preload scanner only resolves the same candidate as the rendered
	 * <img> if its `imagesizes` matches this string exactly — a mismatch
	 * downloads a second, differently sized copy that nothing on the page uses.
	 */
	export const RAIL_PLATE_SIZES = '(max-width: 1024px) 100vw, 380px';
</script>

<script lang="ts">
	import { buildSrcset, imageDimensions } from '#lib/utils/imageVariants.ts';
	import { plateFallback } from '#lib/actions/plateFallback.ts';

	interface Props {
		/** The resolved image path (`resolveImagePath`); nothing renders without one. */
		src: string | undefined;
		/** Already typeset. Empty for a plate that only repeats the headline. */
		alt: string;
		/** The whole caption, `Fig. 1.` included; omitted when the record has none. */
		caption?: string;
		/** The page's LCP image: fetched eagerly, at high priority. */
		priority?: boolean;
		/**
		 * Crop to 4:3 at a fixed 380×285 box, for a set of variously shaped
		 * images (the research plates) that would otherwise make the rail's
		 * height jump from one record to the next.
		 */
		crop?: boolean;
	}

	let { src, alt, caption, priority = false, crop = false }: Props = $props();

	const srcset = $derived(buildSrcset(src));
	const size = $derived(crop ? { width: 380, height: 285 } : imageDimensions(src));
</script>

{#if src}
	<figure class="rail-plate">
		<img
			class="plate"
			class:record-plate--crop={crop}
			{src}
			{srcset}
			sizes={srcset ? RAIL_PLATE_SIZES : undefined}
			width={size?.width}
			height={size?.height}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : undefined}
			decoding="async"
			use:plateFallback
		/>
		{#if caption}
			<figcaption class="plate-caption">{caption}</figcaption>
		{/if}
	</figure>
{/if}

<style>
	.record-plate--crop {
		aspect-ratio: 4 / 3;
		height: auto;
	}
</style>
