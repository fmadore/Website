<!--
ExternalLink — a link that leaves the site, in a new tab.

Owns what every such link must carry and used to be written out by hand at
each call site, with drift (half of them said `rel="noopener"`, half
`"noopener noreferrer"`): `target="_blank"`, the `rel`, the one visually
hidden ` (opens in new tab)` (DESIGN.md § Voice & Copy) and, when asked, the
`↗` glyph in an `aria-hidden` span. It is also the one place the
`svelte/no-navigation-without-resolve` rule is switched off for another
origin, so a disable comment elsewhere marks a real exception.

Styling: a class passed here lands on the `<a>`, but outside the caller's
style scope. Style it with a global idiom class (`.btn`, `.meta-link`,
`.mono-action`), or from the caller as `.parent :global(.my-link)`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAnchorAttributes, 'href' | 'target' | 'children'> {
		/** Undefined only where the record may lack the address (an anchor without one is inert). */
		href: string | undefined;
		/** Append the `↗` glyph, hidden from assistive technology. */
		glyph?: boolean;
		children: Snippet;
	}

	let { href, rel, glyph = false, children, ...rest }: Props = $props();

	/** `noopener noreferrer` always, plus whatever the caller adds (`license`). */
	const relValue = $derived(
		[...new Set(['noopener', 'noreferrer', ...(rel ? String(rel).split(/\s+/) : [])])].join(' ')
	);
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- another origin: the reason this component exists -->
<a {href} target="_blank" rel={relValue} {...rest}>
	{@render children()}{#if glyph}<span aria-hidden="true">&nbsp;↗</span>{/if}<span class="sr-only">
		&nbsp;(opens in new tab)
	</span>
</a>
