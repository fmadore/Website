<script module lang="ts">
	import doi from '@iconify-icons/academicons/doi';
	import publons from '@iconify-icons/academicons/publons';

	/** The `id` of each glyph's `<symbol>`; a mark references it with `<use href="#…">`. */
	export const CV_GLYPH = {
		doi: 'cv-glyph-doi',
		publons: 'cv-glyph-publons'
	} as const;

	/** The `d` of every path in an Iconify body (both glyphs are single-path marks). */
	function paths(icon: typeof doi): string[] {
		return [...icon.body.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((match) => match[1] ?? '');
	}

	const SYMBOLS = [
		{ id: CV_GLYPH.doi, icon: doi },
		{ id: CV_GLYPH.publons, icon: publons }
	].map(({ id, icon }) => ({
		id,
		viewBox: `0 0 ${icon.width ?? 16} ${icon.height ?? 16}`,
		paths: paths(icon)
	}));
</script>

<!--
	The CV's repeated marks, defined once. The DOI mark sits beside every DOI on
	the sheet and the Publons mark on every verified review, and drawn inline by
	<Icon> each copy carried its full path data: 33 DOI marks were 54 KB of the
	page's HTML, against a Lighthouse document budget with almost no headroom.
	Each mark now references its symbol with a same-document `<use href="#…">`,
	which the CSP does not govern. The path data comes from the same
	`@iconify-icons` modules `icons.ts` registers, so the glyphs cannot drift
	from the rest of the site's.

	Decorative throughout: the definitions are hidden, and every `<use>` sits
	in an `aria-hidden` mark whose link text names the target.
-->
<svg class="cv-glyphs" aria-hidden="true" focusable="false">
	{#each SYMBOLS as symbol (symbol.id)}
		<symbol id={symbol.id} viewBox={symbol.viewBox}>
			{#each symbol.paths as d, index (index)}
				<path fill="currentColor" {d} />
			{/each}
		</symbol>
	{/each}
</svg>

<style>
	/* Out of the flow without `display: none`, which some engines also apply to
	 * the symbols' rendering through `<use>`. */
	.cv-glyphs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}
</style>
