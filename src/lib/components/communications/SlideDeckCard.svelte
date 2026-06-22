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

	/* Cover reads like a title slide: eyebrow, display-type title, venue line. */
	.deck-card-cover {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		min-height: 14rem;
		padding: var(--space-lg);
		border-radius: var(--border-radius-lg);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-sm);
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
		border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
	}

	.deck-card-cover:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: 3px;
	}

	.deck-card-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-sm);
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
	}

	.deck-card-type {
		font-family: var(--font-family-sans);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
	}

	.deck-card-no {
		font-family: var(--font-family-mono);
		letter-spacing: var(--letter-spacing-wider);
		color: color-mix(in srgb, var(--color-text-muted) 75%, transparent);
	}

	.deck-card-title {
		margin: 0;
		font-family: var(--font-family-display);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-snug);
		letter-spacing: var(--letter-spacing-tight);
		color: var(--color-text-emphasis);
		/* Full title, never truncated — the cover grows to fit it. */
	}

	/* Animated underline pre-revealed on cover hover — signals the cover links. */
	.deck-card-title-text {
		background-image: linear-gradient(var(--color-primary), var(--color-primary));
		background-repeat: no-repeat;
		background-position: 0 100%;
		background-size: 0% 1px;
		padding-bottom: 1px;
		transition: background-size var(--duration-moderate) var(--ease-out);
	}

	.deck-card-cover:hover .deck-card-title-text,
	.deck-card-cover:focus-visible .deck-card-title-text {
		background-size: 100% 1px;
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
		padding: var(--space-sm) var(--space-2xs) 0;
	}

	.deck-card-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--letter-spacing-tight);
		color: var(--color-text-muted);
	}

	.deck-card-launch {
		position: relative; /* lift above the cover's stretched ::after */
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		text-decoration: none;
		border-radius: var(--border-radius);
		padding: var(--space-2xs) var(--space-xs);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.deck-card-launch:hover {
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
	}

	.deck-card-launch:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
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
		.deck-card-title-text {
			transition: none;
		}

		.deck-card:hover .deck-card-cover {
			transform: none;
		}
	}
</style>
