<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Error {page.status}</title>
</svelte:head>

<div class="error-layout">
	<div class="error-block">
		<p class="eyebrow">Error {page.status}</p>
		<h1 class="error-title">
			{#if page.status === 404}Page not found{:else}Something went wrong{/if}
		</h1>
		{#if page.status === 404}
			<p class="error-lede">Sorry, we couldn't find the page you were looking for.</p>
			<p class="error-path">
				The path <code>{page.url.pathname}</code> does not exist.
			</p>
		{:else}
			<p class="error-lede">{page.error?.message || 'An unexpected error occurred.'}</p>
		{/if}
		<a href={resolve('/')} class="btn btn-accent">Go to homepage →</a>
	</div>
</div>

<style>
	.error-layout {
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: var(--space-2xl) 0;
	}

	/* A ruled error masthead — content on paper, not a boxed card. */
	.error-block {
		max-width: 42rem;
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-lg);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.error-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-weight: 830;
		font-size: var(--font-size-4xl);
		letter-spacing: -0.015em;
		line-height: 1;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-md);
	}

	.error-lede {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		color: var(--color-text-soft);
		margin: 0 0 var(--space-sm);
		max-width: 60ch;
	}

	.error-path {
		font-family: var(--font-family-serif);
		color: var(--color-text-light);
		margin: 0 0 var(--space-xl);
	}

	.error-path code {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
		background: var(--color-surface-alt);
		padding: var(--space-0-5) var(--space-1-5);
	}
</style>
