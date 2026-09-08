<!--
PublicationIndexRail — block two of the publication metadata rail.

What indexes the record: tag chips and the frequency-scaled key-term cloud.
Rendered into <RecordLayout>'s `railSecondary` snippet, so below --lg it falls
*past* the document rather than sitting above it — the index belongs after the
thing it indexes.

Block one — cover, Record ledger, access stack — is <PublicationRecordRail>.
-->
<script module lang="ts">
	import type { Publication as PublicationRecord } from '$lib/types';
	import { hasAnalysis as recordHasAnalysis } from '$lib/data/analysis';

	/**
	 * Whether this record has anything to index. The rail block is a grid child
	 * with its own gap, so <RecordLayout> must be handed the snippet only when it
	 * would print something — an empty block reads as a stray interval.
	 */
	export function hasIndexApparatus(publication: PublicationRecord): boolean {
		return (publication.tags?.filter(Boolean).length ?? 0) > 0 || recordHasAnalysis(publication.id);
	}
</script>

<script lang="ts">
	import { base } from '$app/paths';
	import type { Publication } from '$lib/types';
	import { getAnalysis, hasAnalysis } from '$lib/data/analysis';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	interface Props {
		publication: Publication;
	}

	let { publication }: Props = $props();

	// KEY TERMS — real full-text frequencies, sized by rank. Only shown when a
	// text analysis exists for this publication (data as ornament, never faked).
	const keyTerms = $derived.by(() => {
		if (!hasAnalysis(publication.id)) return [];
		const freqs = getAnalysis(publication.id)?.frequencies ?? [];
		const top = freqs.slice(0, 28);
		if (top.length === 0) return [];
		const max = top[0]!.count;
		const min = top[top.length - 1]!.count;
		const span = Math.max(1, max - min);
		// Map raw count → a serif size between ~13px and ~30px.
		return top.map((f) => ({
			word: f.word,
			size: 13 + ((f.count - min) / span) * 17
		}));
	});

	const tags = $derived(publication.tags?.filter(Boolean) ?? []);
</script>

<!-- Tags -->
{#if tags.length > 0}
	<div class="pub-tags">
		<h2 class="rail-label">Tags</h2>
		<div class="chip-row">
			{#each tags as tag (tag)}
				<!-- Label typeset; the href keeps the raw tag the filter matches. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- tag search URL -->
				<a class="chip" href="{base}/publications?tag={encodeURIComponent(tag)}"
					>{typesetQuotes(tag)}</a
				>
			{/each}
		</div>
	</div>
{/if}

<!-- Key terms — real full-text frequencies, sized by rank. -->
{#if keyTerms.length > 0}
	<div class="pub-key-terms">
		<h2 class="rail-label">Key Terms</h2>
		<div class="key-terms">
			{#each keyTerms as term (term.word)}
				<span style="font-size: {term.size.toFixed(1)}px;">{term.word}</span>
			{/each}
		</div>
		<p class="pub-key-terms-note">Most frequent terms from the full text</p>
	</div>
{/if}

<style>
	/* Key-terms note. */
	.pub-key-terms-note {
		margin: var(--space-sm) 0 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}
</style>
