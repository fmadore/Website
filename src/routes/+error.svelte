<script lang="ts">
	import { page } from '$app/state';
	import { base, resolve } from '$app/paths';
	import { author } from '$lib/data/siteConfig';
	import { getGlobalState } from '$lib/stores/globalState.svelte';

	/*
	 * The in-app error page. It is reached only by client-side navigation into a
	 * matched route with a missing record (an in-site link to
	 * /publications/<no-such-id>); a direct hit on an unknown URL never boots the
	 * app and is served static/404.html with a real HTTP 404. The two pages are
	 * therefore kept deliberately identical in voice and composition — headline,
	 * lede, chips and the path echo all match static/404.html. Edit them together.
	 * The offline branch below is the one exception: only the booted app knows the
	 * connection dropped, and static/404.html is never reached without a network.
	 */

	/** The six indexes a lost reader can pick up the thread from. `also` names a
	 * record family whose index lives under another path: /communications/<id>
	 * is filed under Talks & events. Mirrored in static/404.html. */
	const ways = [
		{ href: resolve('/publications'), label: 'Publications' },
		{ href: resolve('/research'), label: 'Research' },
		{
			href: resolve('/conference-activity'),
			label: 'Talks & events',
			also: [`${base}/communications`]
		},
		{ href: resolve('/activities'), label: 'Activities' },
		{ href: resolve('/digital-humanities'), label: 'Digital humanities' },
		{ href: resolve('/cv'), label: 'CV' }
	];

	/** What the reader asked for, not its percent-encoding: /publications/émancipation,
	 * not /publications/%C3%A9mancipation. A malformed sequence throws, so the raw
	 * path is the fallback. */
	const requestedPath = $derived.by(() => {
		try {
			return decodeURIComponent(page.url.pathname);
		} catch {
			return page.url.pathname;
		}
	});

	const globalState = getGlobalState();

	/* Offline outranks the status code. A client-side navigation into a record
	 * the runtime cache never saw fails as a load error, and reporting that as
	 * "something went wrong on this page" sends the reader to reload a page the
	 * network cannot serve. Naming the real cause first is the honest state. */
	const isOffline = $derived(!globalState.isOnline);
	const isNotFound = $derived(page.status === 404);

	/* When the connection comes back while this branch is showing, the record is
	 * fetchable again: reload once so the reader lands on it rather than on a
	 * stale error. Only a page that actually rendered the offline branch may
	 * reload itself, and `reloaded` guards the flip so a flapping connection
	 * cannot loop the page. */
	let wasOffline = $state(false);
	let reloaded = false;

	$effect(() => {
		if (isOffline) {
			wasOffline = true;
		} else if (wasOffline && !reloaded) {
			reloaded = true;
			location.reload();
		}
	});

	/* The index the requested URL was already inside is the primary way out —
	 * a missing /publications/<id> is a search of /publications, not a trip home. */
	const inside = (root: string) =>
		page.url.pathname === root || page.url.pathname.startsWith(`${root}/`);
	const currentWay = $derived(ways.find((way) => inside(way.href) || way.also?.some(inside))?.href);
</script>

<svelte:head>
	<title
		>{isOffline ? 'Offline' : isNotFound ? 'Page not found' : `Error ${page.status}`} | {author.name}</title
	>
</svelte:head>

<div class="error-page">
	<div class="error-block">
		<p class="eyebrow">Error · {isOffline ? 'Offline' : page.status}</p>

		{#if isOffline}
			<h1 class="error-title">This record is not in the offline cache.</h1>
			<p class="error-lede">
				You are offline. Pages you opened before the connection dropped are still available:
			</p>
		{:else if isNotFound}
			<h1 class="error-title">This page couldn&rsquo;t be found.</h1>
			<p class="error-lede">
				This page may have moved, been renamed, or never existed. A few places to pick up the
				thread:
			</p>
		{:else}
			<h1 class="error-title">Something went wrong on this page.</h1>
			<p class="error-lede">
				The record itself is unaffected; only this rendering of it failed. Reload, or pick up the
				thread from one of the indexes below:
			</p>
		{/if}

		<ul class="error-ways">
			{#each ways as way (way.href)}
				<li>
					<!-- The shared chip idiom, not a local copy of it: 1px border,
					     square corners, mono caps, solid ink when it is the current
					     index. `.chip--selected` is the idiom's own current state. -->
					<a
						href={way.href}
						class="chip no-underline"
						class:chip--selected={way.href === currentWay}
						aria-current={way.href === currentWay ? 'true' : undefined}
					>
						{way.label}
					</a>
				</li>
			{/each}
		</ul>

		<p class="error-diagnostic">
			<span class="error-diagnostic-label">Requested</span>
			<code>{requestedPath}</code>
		</p>

		{#if !isOffline && !isNotFound && page.error?.message}
			<p class="error-diagnostic">
				<span class="error-diagnostic-label">Reported</span>
				<code>{page.error.message}</code>
			</p>
		{/if}

		<!-- A non-breaking space: Svelte trims a trailing ordinary one inside the
		     span, and the live DOM read `←Back to the homepage`. -->
		<a class="error-home" href={resolve('/')}
			><span aria-hidden="true">&larr;&nbsp;</span>Back to the homepage</a
		>
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

	/* The chips themselves are the shared `.chip` idiom (ink-signal.css); this
	 * list only places them. */
	.error-ways {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-lg);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-2-5);
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
