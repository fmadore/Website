<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status}</title>
</svelte:head>

<div
	class="container"
	style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: var(--spacing-8);"
>
	<h1 class="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
	{#if $page.status === 404}
		<h2 class="text-2xl font-semibold mb-3">Page Not Found</h2>
		<p class="mb-2">Sorry, we couldn't find the page you were looking for.</p>
		<p class="mb-6">
			The path <code
				style="background-color: var(--color-border); color: var(--color-text); padding: var(--spacing-1) var(--spacing-2); border-radius: var(--border-radius-sm);"
				>{$page.url.pathname}</code
			> does not exist.
		</p>
	{:else}
		<h2 class="text-2xl font-semibold mb-3">Error {$page.status}</h2>
		<p class="mb-6">{$page.error?.message || 'An unexpected error occurred.'}</p>
	{/if}
	<a href="/" class="btn btn-primary" style="margin-top: var(--spacing-4);"> Go to Homepage </a>
</div>
