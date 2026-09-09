<!--
VizContents — the table of contents for a visualisations page.

A visualisations page is fourteen ruled sections deep, which is a document, and
a document that long opens with its contents. It is set as a ledger, because a
ledger is what this system does with anything keyed: the section number hangs
in the mono key column, the section title reads in serif, and the machine's
count for that section closes the row in the meta column. One density step
tighter than a record ledger — this is apparatus pointing at the page, not the
page itself — so the title sits at the base step rather than the ledger's xl.

Links are quiet ink and take the pine underline only under the pointer. The
site's prose-link idiom is a static pine underline, but fourteen of them
stacked would stripe the whole block in the accent and spend the Scarcity Rule
on a navigation aid; the row link elsewhere (`.ledger-action`) is likewise
quiet at rest and pine on hover, so this follows that.

The `no-underline` class is not decoration: `typography.css` auto-underlines
any bare `<a>` inside an `<li>` at a specificity a component rule cannot beat,
and that class is the opt-out the selector itself provides.
-->
<script module lang="ts">
	export interface VizContentsItem {
		/** Anchor id of the section, matching the `id` given to <VizSection>. */
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
		items: VizContentsItem[];
		/** Accessible name for the nav, and the label printed above it. */
		label?: string;
	} = $props();
</script>

<nav aria-label={label} class="viz-contents">
	<h2 class="rail-label">{label}</h2>
	<ol class="ledger ledger--ruled">
		{#each items as item (item.id)}
			<li class="ledger-row ledger-row--meta">
				<span class="ledger-key">{item.no}</span>
				<a class="ledger-title viz-contents-link no-underline" href="#{item.id}">{item.title}</a>
				<span class="ledger-meta">{item.count ?? ''}</span>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.viz-contents {
		/* Just wide enough for "§ 14" in the mono key. */
		--ledger-key-w: 4rem;
		margin-bottom: var(--space-2xl);
	}

	.ledger {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* One density step under the record ledger: this is a finding aid. */
	.ledger-row {
		padding: var(--space-2) 0;
	}

	.ledger-title {
		font-size: var(--font-size-base);
	}

	.viz-contents-link {
		display: block;
		color: var(--color-text-emphasis);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.viz-contents-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.viz-contents-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* A 17px serif line on a phone still has to clear the 24px target floor. */
	@media (--touch) {
		.viz-contents-link {
			min-height: var(--space-6);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.viz-contents-link {
			transition: none !important;
		}
	}
</style>
