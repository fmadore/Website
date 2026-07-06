<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import SlideDeckCard from '$lib/components/communications/SlideDeckCard.svelte';
	import { base, resolve } from '$app/paths';
	import { communicationsWithSlides } from '$lib/data/communications';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';

	const decks = communicationsWithSlides;

	const breadcrumbItems = [
		{ label: 'Talks & Events', href: `${base}/conference-activity` },
		{ label: 'Slides', href: `${base}/conference-activity/slides` }
	];
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-conf-activity-slides');
</script>

<SEO
	title="Slides | Frédérick Madore"
	description="Slide decks from conference papers, lectures, and workshops by Frédérick Madore — step through any deck in the browser or follow through to the full talk."
	keywords="slides, presentations, slide decks, conference papers, lectures, reveal.js, Frédérick Madore"
/>

<div class="page-container page-enter">
	<Breadcrumb items={breadcrumbItems} />

	<div class="scroll-reveal">
		<PageHeader title="Slides" />
	</div>

	<div class="scroll-reveal">
		<PageIntro>Decks from my talks and conference papers.</PageIntro>
	</div>

	{#if decks.length > 0}
		<div class="deck-grid grid-stagger">
			{#each decks as communication, i (communication.id)}
				<SlideDeckCard {communication} index={i} />
			{/each}
		</div>
	{:else}
		<div class="deck-empty scroll-reveal">
			<p class="deck-empty-title">No decks published yet.</p>
			<p class="deck-empty-text">
				Slide decks appear here as talks are presented. In the meantime, browse the
				<a href={resolve('/conference-activity')}>full Talks &amp; Events listing</a>.
			</p>
		</div>
	{/if}
</div>

<style>
	.page-container {
		max-width: var(--content-width-6xl);
		margin: 0 auto;
		padding: var(--space-xl) var(--space-md);
	}

	.deck-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-lg);
		margin-top: var(--space-xl);
	}

	@media (--md) {
		.deck-grid {
			gap: var(--space-xl);
		}
	}

	/* Editorial empty state — prose on paper, not a dashed placeholder box. */
	.deck-empty {
		max-width: 48ch;
		margin-top: var(--space-2xl);
	}

	.deck-empty-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-xl);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-2xs);
	}

	.deck-empty-text {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0;
	}

	/* Accent underline — the link role carries the lone pine. */
	.deck-empty-text a {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.deck-empty-text a:hover {
		color: var(--color-accent-dark);
	}

	@media (--md-down) {
		.page-container {
			padding: var(--space-md) var(--space-sm);
		}
	}
</style>
