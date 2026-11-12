<script lang="ts">
	import { getIcon } from '@iconify/svelte';
	import { compactBody, glyphId } from './glyphPath.ts';

	interface Props {
		/** Iconify names (`academicons:doi`), each registered by `icons.ts`. */
		icons: readonly string[];
	}

	let { icons }: Props = $props();

	// Read at render, not at module scope: the root layout registers the icons
	// in its own script, which runs before any of its children render.
	const symbols = $derived(
		icons.map((name) => {
			const icon = getIcon(name);
			if (!icon) throw new Error(`GlyphSprite: "${name}" is not registered in icons.ts`);
			return {
				id: glyphId(name),
				viewBox: `${icon.left} ${icon.top} ${icon.width} ${icon.height}`,
				body: compactBody(icon.body, icon.width, icon.height)
			};
		})
	);
</script>

<!--
	Marks defined once per document and drawn by `<use href="#glyph-…">`
	(`glyphId`), which the CSP does not govern: it is a same-document
	reference, not a fetch. Two things make this lighter than `<Icon>`: a mark
	used twice carries its path data once, and the data is rounded to the
	precision the mark is drawn at (`compactBody`), which removes about half
	the digits of the Academicons paths.

	Decorative throughout: the definitions are hidden, and every `<use>` sits
	in an `aria-hidden` mark whose link text names the target. Each name must
	be defined by exactly one sprite on a page, or the ids collide.
-->
<svg class="glyph-sprite" aria-hidden="true" focusable="false">
	{#each symbols as symbol (symbol.id)}
		<symbol id={symbol.id} viewBox={symbol.viewBox}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- path markup from the bundled icon sets, never user input -->
			{@html symbol.body}
		</symbol>
	{/each}
</svg>

<style>
	/* Out of the flow without `display: none`, which some engines also apply to
	 * the symbols' rendering through `<use>`. */
	.glyph-sprite {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}
</style>
