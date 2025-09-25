<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status}</title>
</svelte:head>

<div class="container error-layout flex flex-col items-center justify-center text-center p-8">
	<h1 class="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
	{#if $page.status === 404}
		<h2 class="text-2xl font-semibold mb-3">Page Not Found</h2>
		<p class="mb-2">Sorry, we couldn't find the page you were looking for.</p>
		<p class="mb-6">
			The path <code class="error-path">{$page.url.pathname}</code
			> does not exist.
		</p>
	{:else}
		<h2 class="text-2xl font-semibold mb-3">Error {$page.status}</h2>
		<p class="mb-6">{$page.error?.message || 'An unexpected error occurred.'}</p>
	{/if}
	<a href="/" class="btn btn-primary mt-4"> Go to Homepage </a>
</div>

<style>
	.error-layout {
		min-height: 80vh;
	}

	.error-path {
		background-color: var(--color-border);
		color: var(--color-text);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
	}
</style>
