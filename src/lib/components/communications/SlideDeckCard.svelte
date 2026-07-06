<script lang="ts">
	import type { Communication } from '$lib/types/communication';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';

	interface Props {
		communication: Communication;
		/** Position in the gallery — drives the quiet faux slide number. */
		index?: number;
	}

	let { communication, index = 0 }: Props = $props();

	const typeLabels: Record<string, string> = {
		conference: 'Conference paper',
		workshop: 'Workshop',
		seminar: 'Seminar',
		lecture: 'Lecture',
		panel: 'Panel',
		event: 'Academic event',
		podcast: 'Podcast'
	};

	const typeLabel = $derived(typeLabels[communication.type ?? 'conference'] ?? 'Talk');
	const detailHref = $derived(resolve(`/communications/${communication.id}`));
	const slideNo = $derived(String(index + 1).padStart(2, '0'));
	const venueLine = $derived(
		[communication.conference, communication.location].filter(Boolean).join(' · ')
	);
</script>

<article class="deck-card scroll-reveal-scale">
	<!-- The whole cover is the primary link to the talk; the stretched ::after
	     makes it fully clickable while the launch link below stays separate. -->
	<a class="deck-card-cover" href={detailHref} data-sveltekit-preload-code="tap">
		<span class="deck-card-top">
			<span class="deck-card-type">{typeLabel}</span>
			<span class="deck-card-no" aria-hidden="true">{slideNo}</span>
		</span>

		<h3 class="deck-card-title">
			<span class="deck-card-title-text">{communication.title}</span>
		</h3>

		{#if venueLine}
			<span class="deck-card-venue">{venueLine}</span>
		{/if}
	</a>

	<div class="deck-card-footer">
		<span class="deck-card-date">{communication.date}</span>
		{#if communication.slidesUrl}
			<!-- eslint-disable svelte/no-navigation-without-resolve -- external deck on the slides subdomain -->
			<a
				class="deck-card-launch"
				href={communication.slidesUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Open the slide deck for {communication.title} in a new tab"
			>
				<span>Open deck</span>
				<Icon icon="lucide:arrow-up-right" width="13" height="13" />
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{/if}
	</div>
</article>

<style>
	.deck-card {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	/* Cover reads like a title slide: mono kicker, display-type title, serif
	 * venue line. Flat paper plate — square, hairline border, no shadow. */
	.deck-card-cover {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		min-height: 14rem;
		padding: var(--space-lg);
		border-radius: 0;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		color: inherit;
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	/* Stretched link — whole cover clicks through to the talk. */
	.deck-card-cover::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.deck-card:hover .deck-card-cover {
		border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
	}

	.deck-card-cover:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: 3px;
	}

	.deck-card-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	/* Record kind — the data voice, in the lone pine accent. */
	.deck-card-type {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-accent);
	}

	/* Plate number — mono, tabular, quiet ink. */
	.deck-card-no {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
	}

	/* Title — the display voice. */
	.deck-card-title {
		margin: 0;
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-xl);
		font-weight: 700;
		line-height: var(--line-height-snug);
		letter-spacing: -0.01em;
		color: var(--color-text-emphasis);
		/* Full title, never truncated — the cover grows to fit it. */
	}

	/* The title follows the cover's accent warm-up on hover. */
	.deck-card-title-text {
		transition: color var(--duration-fast) var(--ease-out);
	}

	.deck-card:hover .deck-card-title-text,
	.deck-card-cover:focus-visible .deck-card-title-text {
		color: var(--color-accent);
	}

	.deck-card-venue {
		margin-top: auto; /* settle the venue at the foot of the cover */
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
	}

	.deck-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) 0 0;
	}

	/* Date — a mono dateline stamp. */
	.deck-card-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* "Open deck" — the data voice: a mono accent affordance. */
	.deck-card-launch {
		position: relative; /* lift above the cover's stretched ::after */
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
		text-decoration: none;
		padding: var(--space-1) 0;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.deck-card-launch:hover {
		color: var(--color-accent-dark);
	}

	.deck-card-launch:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (--sm-down) {
		.deck-card-cover {
			padding: var(--space-md);
		}

		.deck-card-title {
			font-size: var(--font-size-lg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.deck-card-cover,
		.deck-card-title-text,
		.deck-card-launch {
			transition: none;
		}
	}
</style>
