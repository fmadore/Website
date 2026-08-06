<script lang="ts">
	/**
	 * A JSON-LD block rendered into `<svelte:head>`, so it is present in the
	 * prerendered HTML rather than appearing only after hydration.
	 *
	 * This replaces the earlier `useJsonLdScript` DOM-injection hook. That hook
	 * ran inside an `$effect` guarded on `browser`, which meant the static build
	 * shipped zero `ld+json` blocks: Google executes JS and eventually saw them,
	 * but social-card scrapers and the LLM crawlers that increasingly mediate
	 * access to a site do not, so the structured data was invisible to exactly
	 * the readers it was written for.
	 *
	 * `{@html}` is the standard way to emit a nested script element from a Svelte
	 * template. Its closing tag is concatenated from two halves below, because an
	 * HTML parser ends a script block at the first closing tag it sees — even one
	 * inside a string or a comment, which is why this note spells it out rather
	 * than showing it. (Escaping the slash instead would trip `no-useless-escape`,
	 * since the escape is needed by the HTML parser, not by JavaScript.)
	 */

	interface Props {
		/** Element id, kept stable so a page can be inspected for a given block. */
		id?: string;
		/** Serialised JSON-LD. Nothing renders when empty. */
		json?: string | null;
	}

	let { id, json }: Props = $props();

	/**
	 * Escapes `<` as its JSON unicode form, so a closing script tag inside any
	 * string value cannot end the block early and spill the rest of the graph
	 * into the document as markup. JSON parsers read `<` back as `<`, so the
	 * structured data itself is unchanged.
	 */
	function escapeForScript(value: string): string {
		return value.replace(/</g, '\\u003c');
	}

	const CLOSING_TAG = '</' + 'script>';

	const block = $derived(
		json
			? `<script type="application/ld+json"${id ? ` id="${id}"` : ''}>` +
					escapeForScript(json) +
					CLOSING_TAG
			: ''
	);
</script>

<svelte:head>
	{#if block}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD built from this site's own data; `<` escaped above -->
		{@html block}
	{/if}
</svelte:head>
