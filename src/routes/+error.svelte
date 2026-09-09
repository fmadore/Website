<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { author } from '$lib/data/siteConfig';

	/*
	 * The in-app error page. It is reached only by client-side navigation into a
	 * matched route with a missing record (an in-site link to
	 * /publications/<no-such-id>); a direct hit on an unknown URL never boots the
	 * app and is served static/404.html with a real HTTP 404. The two pages are
	 * therefore kept deliberately identical in voice and composition — headline,
	 * lede, chips and the path echo all match static/404.html. Edit them together.
	 */

	/** The five indexes a lost reader can pick up the thread from. */
	const ways = [
		{ href: resolve('/publications'), label: 'Publications' },
		{ href: resolve('/research'), label: 'Research' },
		{ href: resolve('/conference-activity'), label: 'Talks & events' },
		{ href: resolve('/digital-humanities'), label: 'Digital humanities' },
		{ href: resolve('/cv'), label: 'CV' }
	];

	const isNotFound = $derived(page.status === 404);

	/* The index the requested URL was already inside is the primary way out —
	 * a missing /publications/<id> is a search of /publications, not a trip home. */
	const currentWay = $derived(
		ways.find(
			(way) => page.url.pathname === way.href || page.url.pathname.startsWith(`${way.href}/`)
		)?.href
	);
</script>

<svelte:head>
	<title>{isNotFound ? 'Page not found' : `Error ${page.status}`} · {author.name}</title>
</svelte:head>

<div class="error-page">
	<div class="error-block">
		<p class="eyebrow">Error · {page.status}</p>

		{#if isNotFound}
			<h1 class="error-title">This page couldn&rsquo;t be found.</h1>
			<p class="error-lede">
				The page you&rsquo;re looking for may have moved, been renamed, or never existed &mdash; and
				the link you followed might be incomplete. Here are a few places to pick up the thread:
			</p>
		{:else}
			<h1 class="error-title">Something went wrong on this page.</h1>
			<p class="error-lede">
				The record itself is unaffected &mdash; only this rendering of it failed. Reload, or pick up
				the thread from one of the indexes below:
			</p>
		{/if}

		<ul class="error-ways">
			{#each ways as way (way.href)}
				<li>
					<a
						href={way.href}
						class="error-chip no-underline"
						class:is-current={way.href === currentWay}
						aria-current={way.href === currentWay ? 'true' : undefined}
					>
						{way.label}
					</a>
				</li>
			{/each}
		</ul>

		<p class="error-diagnostic">
			<span class="error-diagnostic-label">Requested</span>
			<code>{page.url.pathname}</code>
		</p>

		{#if !isNotFound && page.error?.message}
			<p class="error-diagnostic">
				<span class="error-diagnostic-label">Reported</span>
				<code>{page.error.message}</code>
			</p>
		{/if}

		<a class="error-home" href={resolve('/')}>&larr; Back to the homepage</a>
	</div>
</div>

<style>
	/* Top-aligned like every other page: an error is a record too, not a
	 * centred splash. */
	.error-page {
		padding: var(--space-8) 0 var(--space-2xl);
		min-height: 60vh;
	}

	/* A ruled error masthead — content on paper, not a boxed card. */
	.error-block {
		max-width: 42rem;
		border-top: var(--rule-masthead) solid var(--color-primary);
		padding-top: var(--rule-gap);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.error-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-weight: 830;
		font-size: var(--font-size-4xl);
		letter-spacing: var(--tracking-display);
		line-height: 1;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-md);
	}

	.error-lede {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		color: var(--color-text-soft);
		margin: 0 0 var(--space-lg);
		max-width: var(--measure-prose);
	}

	/* Flat chips — the site's selected-chip idiom: 1px ink border, square
	 * corners, mono caps; the current index is a solid ink fill. */
	.error-ways {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-lg);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-2-5);
	}

	.error-chip {
		display: inline-block;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-emphasis);
		text-decoration: none;
		padding: var(--space-2) var(--space-4);
		border: var(--border-width-thin) solid var(--color-primary);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.error-chip:hover,
	.error-chip:focus-visible {
		background-color: var(--color-primary);
		color: var(--color-text-inverted);
	}

	.error-chip.is-current {
		background-color: var(--color-primary);
		color: var(--color-text-inverted);
	}

	.error-chip:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-thin);
	}

	/* Diagnostics — the machine voice, never the lede. */
	.error-diagnostic {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
		margin: 0 0 var(--space-2);
		max-width: var(--measure-prose);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
	}

	.error-diagnostic-label {
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
		font-weight: var(--font-weight-medium);
	}

	.error-diagnostic code {
		font-family: var(--font-family-mono);
		font-size: inherit;
		color: var(--color-text-emphasis);
		background: var(--color-code-bg);
		padding: var(--space-0-5) var(--space-1-5);
		overflow-wrap: anywhere;
	}

	.error-home {
		display: inline-block;
		margin-top: var(--space-lg);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-emphasis);
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-underline-offset: 0.2em;
	}

	.error-home:hover,
	.error-home:focus-visible {
		color: var(--color-accent);
	}
</style>
