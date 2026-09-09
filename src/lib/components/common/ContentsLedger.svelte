<!--
ContentsLedger — the table of contents a long document opens with.

The house contents idiom, not a visualisations component: any page deep enough
to be read as a document rather than scanned as a screen opens with its own
contents. Consumers are the two visualisation pages (fourteen and eleven ruled
sections) and /style-guide (nine). It began as `VizContents`, scoped to the
first of those, and was promoted here once the third needed it.

It is set as a ledger, because a ledger is what this system does with anything
keyed: the section number hangs in the mono key column, the section title reads
in serif, and the machine's count for that section closes the row in the meta
column. One density step tighter than a record ledger — this is apparatus
pointing at the page, not the page itself — so the title sits at the base step
rather than the ledger's xl.

Links are quiet ink and take the pine underline only under the pointer. The
site's prose-link idiom is a static pine underline, but fourteen of them
stacked would stripe the whole block in the accent and spend the Scarcity Rule
on a navigation aid; the row link elsewhere (`.ledger-action`) is likewise
quiet at rest and pine on hover, so this follows that.

The `no-underline` class is not decoration: `typography.css` auto-underlines
any bare `<a>` inside an `<li>` at a specificity a component rule cannot beat,
and that class is the opt-out the selector itself provides.

The idiom itself (`.contents-ledger`, `.contents-link`) lives in
`src/styles/components/ink-signal.css`; this component is only the markup that
renders `items` into it.
-->
<script module lang="ts">
	export interface ContentsLedgerItem {
		/** Anchor id of the section, matching the `id` given to the section. */
		id: string;
		/** Section marker, e.g. "§ 3". */
		no: string;
		title: string;
		/** The machine's count for the section, e.g. "117 keywords". */
		count?: string;
	}
</script>

<script lang="ts">
	let {
		items,
		label = 'Contents'
	}: {
		items: ContentsLedgerItem[];
		/** Accessible name for the nav, and the label printed above it. */
		label?: string;
	} = $props();
</script>

<nav aria-label={label} class="contents-ledger">
	<h2 class="rail-label">{label}</h2>
	<ol class="ledger ledger--ruled">
		{#each items as item (item.id)}
			<li class="ledger-row ledger-row--meta">
				<span class="ledger-key">{item.no}</span>
				<a class="ledger-title contents-link no-underline" href="#{item.id}">{item.title}</a>
				<span class="ledger-meta">{item.count ?? ''}</span>
			</li>
		{/each}
	</ol>
</nav>
