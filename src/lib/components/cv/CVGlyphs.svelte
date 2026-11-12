<script module lang="ts">
	import { glyphId } from '#lib/components/common/glyphPath.ts';

	/** The `id` of each repeated mark's `<symbol>`; a mark references it with `<use href="#…">`. */
	export const CV_GLYPH = {
		doi: glyphId('academicons:doi'),
		publons: glyphId('academicons:publons')
	} as const;
</script>

<script lang="ts">
	import GlyphSprite from '#lib/components/common/GlyphSprite.svelte';
	import { FOOTER_GLYPHS } from '#lib/components/common/Footer.svelte';
	import { CV_HEADER_GLYPHS } from './CVHeader.svelte';

	// The footer's sprite is on every page, so a letterhead mark it already
	// defines (email, LinkedIn, GitHub, ORCID) is referenced, not defined twice.
	const icons = [
		...new Set(['academicons:doi', 'academicons:publons', ...CV_HEADER_GLYPHS])
	].filter((name) => !FOOTER_GLYPHS.includes(name));
</script>

<!--
	The CV's marks, defined once. The DOI mark sits beside every DOI on the
	sheet and the Publons mark on every verified review, and drawn inline by
	<Icon> each copy carried its full path data: 33 DOI marks were 54 KB of the
	page's HTML, against a Lighthouse document budget with almost no headroom.
	Each mark now references its symbol with a same-document `<use href="#…">`
	(see `GlyphSprite`). The path data comes from the icons `icons.ts`
	registers, so the glyphs cannot drift from the rest of the site's.
-->
<GlyphSprite {icons} />
