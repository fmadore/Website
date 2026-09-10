<!--
RecordLedger — the "Record" block of a metadata rail.

The catalogue entry for a record: a labelled block of mono key/value hairline
rows. Extracted from PublicationAside so /communications/[id] sets its metadata
identically rather than in a details grid of its own.

The idiom itself (`.rail-label`, `.meta-ledger`, `.meta-row`, …) lives in
`src/styles/components/ink-signal.css` and is documented on /style-guide; this
component is only the markup that renders `rows` into it. Row values arrive
already typeset — an href is never typeset, since a curled apostrophe inside a
DOI would break the link.
-->
<script module lang="ts">
	/** One row of the record ledger. */
	export type MetaRow = {
		/** Mono key printed in the hanging column. */
		key: string;
		/** Printed value — typeset by the caller. */
		value: string;
		/** Optional destination. */
		href?: string;
		/** Opens in a new tab with an ↗ marker; internal links get a → instead. */
		external?: boolean;
		/** Sets the value in pine — reserved for rows that leave the record. */
		accent?: boolean;
		/** Registered Iconify mark printed before the value (e.g. the DOI glyph). */
		icon?: string;
	};
</script>

<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		/** Rows to print, in order. */
		rows: MetaRow[];
		/** Rail section label above the ledger. */
		label?: string;
	}

	let { rows, label = 'Record' }: Props = $props();
</script>

{#if rows.length > 0}
	<div class="record-meta">
		<h2 class="rail-label">{label}</h2>
		<dl class="meta-ledger">
			{#each rows as row (row.key)}
				<div class="meta-row">
					<dt class="meta-key">{row.key}</dt>
					<dd class="meta-value" class:meta-value--accent={row.accent}>
						{#if row.href && row.external}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
							<a href={row.href} target="_blank" rel="noopener" class="meta-link"
								>{#if row.icon}<Icon
										icon={row.icon}
										class="meta-icon"
										aria-hidden="true"
									/>{/if}{row.value}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">
									(opens in new tab)</span
								></a
							>
						{:else if row.href}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed internal path -->
							<a href={row.href} class="meta-link"
								>{row.value}<span aria-hidden="true">&nbsp;→</span></a
							>
						{:else}
							{row.value}
						{/if}
					</dd>
				</div>
			{/each}
		</dl>
	</div>
{/if}
